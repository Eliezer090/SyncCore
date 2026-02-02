import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { notificacaoEmitter } from '@/lib/notificacao-events';
import type { Notificacao } from '@/types/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface TokenPayload {
  userId: number;
  empresaId: number | null;
  email: string;
  papel: string;
}

export async function GET(request: NextRequest) {
  // Verificar autenticação via token no query param
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return new Response('Token não fornecido', { status: 401 });
  }

  let payload: TokenPayload;
  try {
    payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return new Response('Token inválido', { status: 401 });
  }

  const empresaId = payload.empresaId;
  const isAdminGlobal = payload.papel === 'admin';

  // Criar stream de eventos
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Enviar heartbeat inicial
      controller.enqueue(encoder.encode('event: connected\ndata: {"status":"connected"}\n\n'));

      // Handler para novas notificações
      const handleNotificacao = (notificacao: Notificacao) => {
        try {
          const data = JSON.stringify(notificacao);
          controller.enqueue(encoder.encode(`event: notificacao\ndata: ${data}\n\n`));
        } catch {
          // Controller fechado
        }
      };

      // Escutar notificações da empresa ou todas (admin global)
      if (isAdminGlobal) {
        notificacaoEmitter.onNovaNotificacao('all', handleNotificacao);
      } else if (empresaId) {
        notificacaoEmitter.onNovaNotificacao(empresaId, handleNotificacao);
      }

      // Heartbeat a cada 30 segundos para manter conexão
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode('event: heartbeat\ndata: {"time":"' + new Date().toISOString() + '"}\n\n'));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 30000);

      // Cleanup quando conexão fechar
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        if (isAdminGlobal) {
          notificacaoEmitter.offNovaNotificacao('all', handleNotificacao);
        } else if (empresaId) {
          notificacaoEmitter.offNovaNotificacao(empresaId, handleNotificacao);
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Desabilitar buffering do nginx
    },
  });
}
