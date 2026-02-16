import amqp from 'amqplib';
import type { ChannelModel, Channel } from 'amqplib';

let connection: ChannelModel | null = null;
let channel: Channel | null = null;
let reconnecting = false;

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const RECONNECT_DELAY = 5000; // 5 segundos

// Lista de consumers para reconectar automaticamente
const activeConsumers: Array<{ queue: string; callback: (message: unknown) => Promise<void> }> = [];

export async function getChannel(): Promise<Channel> {
  if (channel) return channel;

  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    
    // Prefetch 1 mensagem por vez para processar de forma ordenada
    await channel.prefetch(1);
    
    console.log('✅ Conectado ao RabbitMQ');
    
    // Reconectar em caso de erro
    connection.on('error', (err: Error) => {
      console.error('❌ Erro na conexão RabbitMQ:', err.message);
      channel = null;
      connection = null;
      scheduleReconnect();
    });
    
    connection.on('close', () => {
      console.log('🔌 Conexão RabbitMQ fechada');
      channel = null;
      connection = null;
      scheduleReconnect();
    });
    
    return channel;
  } catch (error) {
    console.error('❌ Erro ao conectar ao RabbitMQ:', error);
    channel = null;
    connection = null;
    throw error;
  }
}

function scheduleReconnect(): void {
  if (reconnecting) return;
  reconnecting = true;
  
  console.log(`🔄 Tentando reconectar ao RabbitMQ em ${RECONNECT_DELAY / 1000}s...`);
  
  setTimeout(async () => {
    reconnecting = false;
    try {
      await getChannel();
      // Reconectar todos os consumers ativos
      for (const consumer of activeConsumers) {
        console.log(`🔄 Reconectando consumer da fila: ${consumer.queue}`);
        await consumeQueue(consumer.queue, consumer.callback, true);
      }
    } catch (error) {
      console.error('❌ Falha na reconexão RabbitMQ:', error);
      // Vai tentar novamente via o handler de close/error
    }
  }, RECONNECT_DELAY);
}

export async function closeConnection(): Promise<void> {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    channel = null;
    connection = null;
    console.log('🔌 Conexão RabbitMQ encerrada');
  } catch (error) {
    console.error('Erro ao fechar conexão RabbitMQ:', error);
  }
}

// Publicar mensagem em uma fila
export async function publishToQueue(queue: string, message: object): Promise<boolean> {
  try {
    const ch = await getChannel();
    await ch.assertQueue(queue, { durable: true });
    return ch.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
  } catch (error) {
    console.error('Erro ao publicar mensagem:', error);
    return false;
  }
}

// Consumir mensagens de uma fila
export async function consumeQueue(
  queue: string,
  callback: (message: unknown) => Promise<void>,
  isReconnect = false
): Promise<void> {
  try {
    const ch = await getChannel();
    await ch.assertQueue(queue, { durable: true });
    
    // Registrar consumer para reconexão automática (apenas na primeira vez)
    if (!isReconnect) {
      const existing = activeConsumers.find(c => c.queue === queue);
      if (!existing) {
        activeConsumers.push({ queue, callback });
      }
    }
    
    console.log(`👂 Escutando fila: ${queue}`);
    
    ch.consume(queue, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          console.log(`📩 Mensagem recebida da fila ${queue}:`, JSON.stringify(content));
          await callback(content);
          ch.ack(msg);
          console.log(`✅ Mensagem processada e confirmada (ack) da fila ${queue}`);
        } catch (error) {
          console.error(`❌ Erro ao processar mensagem da fila ${queue}:`, error);
          ch.nack(msg, false, false); // Rejeitar sem requeue
        }
      }
    });
  } catch (error) {
    console.error('Erro ao consumir fila:', error);
    throw error;
  }
}
