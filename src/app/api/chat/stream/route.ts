import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { chatEmitter } from '@/lib/chat-events';
import type { ChatEvent } from '@/lib/chat-events';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface TokenPayload {
  userId: number;
  empresaId: number | null;
  email: string;
  papel: string;
}

// GET /api/chat/stream?token=xxx
export async function GET(request: NextRequest) {
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
  if (!empresaId) {
    return new Response('Empresa não encontrada no token', { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Heartbeat inicial
      controller.enqueue(encoder.encode('event: connected\ndata: {"status":"connected"}\n\n'));

      // Handler para eventos de chat
      const handleChatEvent = (event: ChatEvent) => {
        try {
          const data = JSON.stringify(event);
          controller.enqueue(encoder.encode(`event: chat\ndata: ${data}\n\n`));
        } catch {
          // Controller fechado
        }
      };

      chatEmitter.onChatEvent(empresaId, handleChatEvent);

      // Heartbeat a cada 30 segundos
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
        chatEmitter.offChatEvent(empresaId, handleChatEvent);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
