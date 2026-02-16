// Consumer RabbitMQ para notificações de atendimento humano
// Este script pode ser rodado separadamente ou integrado ao servidor

import { consumeQueue } from '../lib/rabbitmq';
import { query } from '../lib/db';
import { notificacaoEmitter } from '../lib/notificacao-events';
import type { Notificacao } from '../types/database';

// Log com timestamp
function logConsumer(level: 'info' | 'warn' | 'error', message: string, ...args: unknown[]): void {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [AtendimentoConsumer]`;
  
  switch (level) {
    case 'info':
      console.log(`${prefix} ℹ️ ${message}`, ...args);
      break;
    case 'warn':
      console.warn(`${prefix} ⚠️ ${message}`, ...args);
      break;
    case 'error':
      console.error(`${prefix} ❌ ${message}`, ...args);
      break;
  }
}

interface AtendimentoHumanoMessage {
  cliente_id: string | number;
  empresa_id: string | number;
  timestamp: string;
}

async function processarAtendimentoHumano(message: AtendimentoHumanoMessage): Promise<void> {
  const { cliente_id, empresa_id, timestamp } = message;

  logConsumer('info', `📨 Processando mensagem de atendimento humano:`, { cliente_id, empresa_id, timestamp });

  try {
    // Buscar nome do cliente
    logConsumer('info', 'Buscando dados do cliente...');
    const clienteResult = await query<{ nome: string; telefone: string }>(
      'SELECT nome, telefone FROM clientes WHERE id = $1',
      [cliente_id]
    );
    const cliente = clienteResult[0];
    const nomeCliente = cliente?.nome || cliente?.telefone || `Cliente #${cliente_id}`;
    logConsumer('info', `Cliente encontrado: ${nomeCliente}`);

    // Criar mensagem
    const mensagem = `${nomeCliente} está solicitando atendimento humano`;

    // Inserir notificação
    logConsumer('info', 'Inserindo notificação no banco...');
    const result = await query<Notificacao>(`
      INSERT INTO notificacoes (empresa_id, cliente_id, tipo, mensagem, lida)
      VALUES ($1, $2, 'atendimento_humano', $3, false)
      RETURNING *
    `, [empresa_id, cliente_id, mensagem]);
    logConsumer('info', `Notificação inserida com ID: ${result[0].id}`);

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
    logConsumer('info', 'Emitindo evento SSE...');
    notificacaoEmitter.emitNovaNotificacao(Number(empresa_id), notificacao);

    logConsumer('info', `✅ Notificação criada com sucesso: ${nomeCliente} (Empresa: ${empresa_id})`);
  } catch (error) {
    logConsumer('error', 'Erro ao processar mensagem de atendimento humano:', error);
    throw error;
  }
}

export async function startConsumer(): Promise<void> {
  logConsumer('info', '🚀 startConsumer() chamado');
  logConsumer('info', 'Ambiente - NODE_ENV:', process.env.NODE_ENV);
  logConsumer('info', 'Ambiente - RABBITMQ_URL:', process.env.RABBITMQ_URL ? `${process.env.RABBITMQ_URL.substring(0, 20)}...` : 'NÃO DEFINIDA');
  
  try {
    logConsumer('info', 'Chamando consumeQueue("atendimento_humano")...');
    
    await consumeQueue('atendimento_humano', async (message) => {
      logConsumer('info', 'Callback do consumer chamado com mensagem:', message);
      await processarAtendimentoHumano(message as AtendimentoHumanoMessage);
    });
    
    logConsumer('info', '✅ Consumer de atendimento humano iniciado com sucesso!');
  } catch (error) {
    logConsumer('error', 'Erro ao iniciar consumer:', error);
    logConsumer('info', 'Agendando retry em 5 segundos...');
    // Tentar reconectar após 5 segundos
    setTimeout(() => startConsumer(), 5000);
  }
}

// Se executado diretamente
if (require.main === module) {
  logConsumer('info', 'Executando como script standalone');
  startConsumer();
}
