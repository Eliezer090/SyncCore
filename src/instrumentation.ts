// Next.js Instrumentation - roda uma vez quando o servidor inicia
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

export async function register() {
  // Apenas no servidor Node.js (não no edge runtime e não durante o build)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🔧 [Instrumentation] Iniciando serviços de background...');

    // Iniciar consumer RabbitMQ apenas se a URL estiver configurada
    const rabbitmqUrl = process.env.RABBITMQ_URL;
    if (rabbitmqUrl && rabbitmqUrl !== 'amqp://localhost') {
      try {
        const { startConsumer } = await import('@/services/atendimento-humano-consumer');
        await startConsumer();
        console.log('✅ [Instrumentation] Consumer de atendimento humano iniciado');
      } catch (error) {
        console.error('❌ [Instrumentation] Erro ao iniciar consumer RabbitMQ:', error);
        // Não lança o erro para não impedir o servidor de iniciar
      }
    } else {
      console.log('⚠️ [Instrumentation] RABBITMQ_URL não configurada, consumer não iniciado');
    }
  }
}
