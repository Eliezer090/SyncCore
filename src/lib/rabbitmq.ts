import amqp from 'amqplib';
import type { ChannelModel, Channel } from 'amqplib';

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

export async function getChannel(): Promise<Channel> {
  if (channel) return channel;

  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    
    console.log('✅ Conectado ao RabbitMQ');
    
    // Reconectar em caso de erro
    connection.on('error', (err: Error) => {
      console.error('❌ Erro na conexão RabbitMQ:', err.message);
      channel = null;
      connection = null;
    });
    
    connection.on('close', () => {
      console.log('🔌 Conexão RabbitMQ fechada');
      channel = null;
      connection = null;
    });
    
    return channel;
  } catch (error) {
    console.error('❌ Erro ao conectar ao RabbitMQ:', error);
    throw error;
  }
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
  callback: (message: unknown) => Promise<void>
): Promise<void> {
  try {
    const ch = await getChannel();
    await ch.assertQueue(queue, { durable: true });
    
    console.log(`👂 Escutando fila: ${queue}`);
    
    ch.consume(queue, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await callback(content);
          ch.ack(msg);
        } catch (error) {
          console.error('Erro ao processar mensagem:', error);
          ch.nack(msg, false, false); // Rejeitar sem requeue
        }
      }
    });
  } catch (error) {
    console.error('Erro ao consumir fila:', error);
    throw error;
  }
}
