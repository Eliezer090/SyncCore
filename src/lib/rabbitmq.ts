import amqp from 'amqplib';
import type { ChannelModel, Channel } from 'amqplib';

let connection: ChannelModel | null = null;
let channel: Channel | null = null;
let reconnecting = false;
let connectionAttempts = 0;

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const RECONNECT_DELAY = 5000; // 5 segundos

// Lista de consumers para reconectar automaticamente
const activeConsumers: Array<{ queue: string; callback: (message: unknown) => Promise<void> }> = [];

// Log com timestamp para facilitar debug
function logRabbit(level: 'info' | 'warn' | 'error', message: string, ...args: unknown[]): void {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [RabbitMQ]`;
  
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

export async function getChannel(): Promise<Channel> {
  logRabbit('info', 'getChannel() chamado. channel existe?', !!channel, 'connection existe?', !!connection);
  
  if (channel) {
    logRabbit('info', 'Retornando channel existente');
    return channel;
  }

  connectionAttempts++;
  logRabbit('info', `Tentativa de conexão #${connectionAttempts}`);
  logRabbit('info', 'RABBITMQ_URL:', RABBITMQ_URL ? `${RABBITMQ_URL.substring(0, 20)}...` : 'NÃO DEFINIDA');

  try {
    logRabbit('info', 'Iniciando conexão com amqp.connect()...');
    connection = await amqp.connect(RABBITMQ_URL);
    logRabbit('info', 'Conexão estabelecida! Criando channel...');
    
    channel = await connection.createChannel();
    logRabbit('info', 'Channel criado! Configurando prefetch...');
    
    // Prefetch 1 mensagem por vez para processar de forma ordenada
    await channel.prefetch(1);
    
    logRabbit('info', '✅ Conectado ao RabbitMQ com sucesso!');
    
    // Reconectar em caso de erro
    connection.on('error', (err: Error) => {
      logRabbit('error', 'Erro na conexão RabbitMQ:', err.message);
      channel = null;
      connection = null;
      scheduleReconnect();
    });
    
    connection.on('close', () => {
      logRabbit('warn', 'Conexão RabbitMQ fechada');
      channel = null;
      connection = null;
      scheduleReconnect();
    });
    
    return channel;
  } catch (error) {
    logRabbit('error', 'Erro ao conectar ao RabbitMQ:', error);
    logRabbit('error', 'Detalhes do erro:', error instanceof Error ? error.stack : 'N/A');
    channel = null;
    connection = null;
    throw error;
  }
}

function scheduleReconnect(): void {
  if (reconnecting) {
    logRabbit('info', 'Reconexão já em andamento, ignorando...');
    return;
  }
  reconnecting = true;
  
  logRabbit('info', `Agendando reconexão em ${RECONNECT_DELAY / 1000}s...`);
  
  setTimeout(async () => {
    reconnecting = false;
    try {
      logRabbit('info', 'Executando reconexão...');
      await getChannel();
      // Reconectar todos os consumers ativos
      logRabbit('info', `Reconectando ${activeConsumers.length} consumers...`);
      for (const consumer of activeConsumers) {
        logRabbit('info', `Reconectando consumer da fila: ${consumer.queue}`);
        await consumeQueue(consumer.queue, consumer.callback, true);
      }
      logRabbit('info', 'Reconexão completa!');
    } catch (error) {
      logRabbit('error', 'Falha na reconexão RabbitMQ:', error);
      // Vai tentar novamente via o handler de close/error
    }
  }, RECONNECT_DELAY);
}

export async function closeConnection(): Promise<void> {
  try {
    logRabbit('info', 'Fechando conexão RabbitMQ...');
    if (channel) await channel.close();
    if (connection) await connection.close();
    channel = null;
    connection = null;
    logRabbit('info', 'Conexão RabbitMQ encerrada');
  } catch (error) {
    logRabbit('error', 'Erro ao fechar conexão RabbitMQ:', error);
  }
}

// Publicar mensagem em uma fila
export async function publishToQueue(queue: string, message: object): Promise<boolean> {
  logRabbit('info', `publishToQueue() - Fila: ${queue}`);
  try {
    const ch = await getChannel();
    await ch.assertQueue(queue, { durable: true });
    const result = ch.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
    logRabbit('info', `Mensagem publicada na fila ${queue}:`, result);
    return result;
  } catch (error) {
    logRabbit('error', 'Erro ao publicar mensagem:', error);
    return false;
  }
}

// Consumir mensagens de uma fila
export async function consumeQueue(
  queue: string,
  callback: (message: unknown) => Promise<void>,
  isReconnect = false
): Promise<void> {
  logRabbit('info', `consumeQueue() - Fila: ${queue}, isReconnect: ${isReconnect}`);
  
  try {
    logRabbit('info', `Obtendo channel para consumir fila ${queue}...`);
    const ch = await getChannel();
    
    logRabbit('info', `Asserting queue ${queue}...`);
    await ch.assertQueue(queue, { durable: true });
    
    // Registrar consumer para reconexão automática (apenas na primeira vez)
    if (!isReconnect) {
      const existing = activeConsumers.find(c => c.queue === queue);
      if (!existing) {
        activeConsumers.push({ queue, callback });
        logRabbit('info', `Consumer registrado para reconexão automática. Total: ${activeConsumers.length}`);
      }
    }
    
    logRabbit('info', `👂 Iniciando consume() na fila: ${queue}`);
    
    const consumerTag = await ch.consume(queue, async (msg) => {
      logRabbit('info', `Callback de consume() disparado para fila ${queue}. msg existe?`, !!msg);
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          logRabbit('info', `📩 Mensagem recebida da fila ${queue}:`, JSON.stringify(content));
          await callback(content);
          ch.ack(msg);
          logRabbit('info', `✅ Mensagem processada e confirmada (ack) da fila ${queue}`);
        } catch (error) {
          logRabbit('error', `Erro ao processar mensagem da fila ${queue}:`, error);
          ch.nack(msg, false, false); // Rejeitar sem requeue
        }
      }
    });
    
    logRabbit('info', `Consumer iniciado na fila ${queue}. ConsumerTag:`, consumerTag.consumerTag);
    
  } catch (error) {
    logRabbit('error', `Erro ao consumir fila ${queue}:`, error);
    throw error;
  }
}
