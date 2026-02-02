// Consumer RabbitMQ para notificações de atendimento humano
// Este script pode ser rodado separadamente ou integrado ao servidor

import { consumeQueue } from '../lib/rabbitmq';
import { query } from '../lib/db';
import { notificacaoEmitter } from '../lib/notificacao-events';
import type { Notificacao } from '../types/database';

interface AtendimentoHumanoMessage {
  cliente_id: string | number;
  empresa_id: string | number;
  timestamp: string;
}

async function processarAtendimentoHumano(message: AtendimentoHumanoMessage): Promise<void> {
  const { cliente_id, empresa_id, timestamp } = message;

  console.log(`📨 Recebida mensagem de atendimento humano:`, { cliente_id, empresa_id, timestamp });

  try {
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
    notificacaoEmitter.emitNovaNotificacao(Number(empresa_id), notificacao);

    console.log(`✅ Notificação criada: ${nomeCliente} (Empresa: ${empresa_id})`);
  } catch (error) {
    console.error('❌ Erro ao processar mensagem de atendimento humano:', error);
    throw error;
  }
}

export async function startConsumer(): Promise<void> {
  console.log('🚀 Iniciando consumer de atendimento humano...');
  
  try {
    await consumeQueue('atendimento_humano', async (message) => {
      await processarAtendimentoHumano(message as AtendimentoHumanoMessage);
    });
    
    console.log('✅ Consumer de atendimento humano iniciado');
  } catch (error) {
    console.error('❌ Erro ao iniciar consumer:', error);
    // Tentar reconectar após 5 segundos
    setTimeout(() => startConsumer(), 5000);
  }
}

// Se executado diretamente
if (require.main === module) {
  startConsumer();
}
