import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Notificacao } from '@/types/database';
import { notificacaoEmitter } from '@/lib/notificacao-events';

// Esta API é chamada pelo consumer RabbitMQ ou diretamente pelo N8N
// para criar uma notificação de atendimento humano
export async function POST(request: NextRequest) {
  try {
    // Verificar secret key (para segurança)
    const authHeader = request.headers.get('X-Webhook-Secret');
    const webhookSecret = process.env.WEBHOOK_SECRET || 'synccore-webhook-secret';
    
    if (authHeader !== webhookSecret) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { cliente_id, empresa_id, timestamp } = body;

    if (!cliente_id || !empresa_id) {
      return NextResponse.json({ error: 'cliente_id e empresa_id são obrigatórios' }, { status: 400 });
    }

    // Buscar nome do cliente
    const clienteResult = await query<{ nome: string; telefone: string }>(
      'SELECT nome, telefone FROM clientes WHERE id = $1',
      [cliente_id]
    );
    const cliente = clienteResult[0];
    const nomeCliente = cliente?.nome || cliente?.telefone || `Cliente #${cliente_id}`;

    // Criar mensagem
    const mensagem = `${nomeCliente} está solicitando atendimento humano`;

    // Inserir notificação
    const result = await query<Notificacao>(`
      INSERT INTO notificacoes (empresa_id, cliente_id, tipo, mensagem, lida)
      VALUES ($1, $2, 'atendimento_humano', $3, false)
      RETURNING *
    `, [empresa_id, cliente_id, mensagem]);

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
    notificacaoEmitter.emitNovaNotificacao(parseInt(empresa_id), notificacao);

    console.log(`🔔 Nova notificação de atendimento humano: ${nomeCliente} (Empresa: ${empresa_id})`);

    return NextResponse.json({
      success: true,
      notificacao,
      timestamp: timestamp || new Date().toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao processar webhook de atendimento humano:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
