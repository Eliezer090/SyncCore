import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import type { Notificacao } from '@/types/database';
import { notificacaoEmitter } from '@/lib/notificacao-events';

// POST /api/notificacoes/mensagem-manual
// Chamada pelo N8N quando um cliente em modo manual (ia_ativa = false) envia uma mensagem
// Cria uma notificação do tipo 'mensagem_manual' e emite via SSE
export async function POST(request: NextRequest) {
  try {
    // Verificar secret key (para segurança)
    const authHeader = request.headers.get('X-Webhook-Secret');
    const webhookSecret = process.env.WEBHOOK_SECRET || 'synccore-webhook-secret';

    if (authHeader !== webhookSecret) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { telefone, empresa_id, mensagem_texto } = body;

    if (!telefone || !empresa_id) {
      return NextResponse.json({ error: 'telefone e empresa_id são obrigatórios' }, { status: 400 });
    }

    // Normalizar telefone
    const telefoneLimpo = telefone.replace('@s.whatsapp.net', '').replace(/\D/g, '');

    // Buscar cliente pelo telefone
    const cliente = await queryOne<{ id: number; nome: string; telefone: string }>(`
      SELECT c.id, c.nome, c.telefone
      FROM clientes c
      JOIN clientes_empresas ce ON c.id = ce.cliente_id
      WHERE ce.empresa_id = $1 
        AND ce.ia_ativa = false
        AND (
          REGEXP_REPLACE(c.telefone, '[^0-9]', '', 'g') = $2
          OR REGEXP_REPLACE(c.telefone, '[^0-9]', '', 'g') = $3
          OR '55' || REGEXP_REPLACE(c.telefone, '[^0-9]', '', 'g') = $2
        )
    `, [empresa_id, telefoneLimpo, telefoneLimpo.startsWith('55') ? telefoneLimpo.substring(2) : telefoneLimpo]);

    if (!cliente) {
      // Cliente não encontrado ou não está em modo manual — ignorar
      return NextResponse.json({ success: false, reason: 'Cliente não encontrado em modo manual' });
    }

    const nomeCliente = cliente.nome || cliente.telefone || 'Cliente';

    // Verificar se já existe uma notificação não lida recente (últimos 2 min) para evitar spam
    const notificacaoRecente = await queryOne<{ id: string }>(`
      SELECT id FROM notificacoes 
      WHERE empresa_id = $1 
        AND cliente_id = $2 
        AND tipo = 'mensagem_manual' 
        AND lida = false
        AND criada_em > NOW() - INTERVAL '2 minutes'
    `, [empresa_id, cliente.id]);

    if (notificacaoRecente) {
      // Já existe notificação recente não lida — não criar outra
      return NextResponse.json({ success: true, reason: 'Notificação recente já existe', id: notificacaoRecente.id });
    }

    // Testar texto da mensagem
    const previewTexto = mensagem_texto
      ? (mensagem_texto.length > 60 ? `${mensagem_texto.substring(0, 60)}...` : mensagem_texto)
      : '';
    const mensagem = previewTexto
      ? `${nomeCliente} enviou: "${previewTexto}"`
      : `${nomeCliente} enviou uma nova mensagem`;

    // Inserir notificação
    const result = await query<Notificacao>(`
      INSERT INTO notificacoes (empresa_id, cliente_id, tipo, mensagem, lida)
      VALUES ($1, $2, 'mensagem_manual', $3, false)
      RETURNING *
    `, [empresa_id, cliente.id, mensagem]);

    // Buscar dados completos com JOINs
    const notificacaoCompleta = await query<Notificacao>(`
      SELECT 
        n.*,
        c.nome as cliente_nome,
        c.telefone as cliente_telefone,
        e.nome as empresa_nome
      FROM notificacoes n
      LEFT JOIN clientes c ON n.cliente_id = c.id
      LEFT JOIN empresas e ON n.empresa_id = e.id
      WHERE n.id = $1
    `, [result[0].id]);

    const notificacao = notificacaoCompleta[0];

    // Emitir evento para SSE (notificar frontend em tempo real)
    notificacaoEmitter.emitNovaNotificacao(Number(empresa_id), notificacao);

    console.log(`💬 Nova mensagem manual: ${nomeCliente} (Empresa: ${empresa_id})`);

    return NextResponse.json({ success: true, notificacao }, { status: 201 });
  } catch (error) {
    console.error('Erro ao processar webhook de mensagem manual:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
