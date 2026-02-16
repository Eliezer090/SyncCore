// Next.js Instrumentation - roda uma vez quando o servidor inicia
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

export async function register() {
  console.log('🔧 [Instrumentation] register() chamado. NEXT_RUNTIME:', process.env.NEXT_RUNTIME);

  // Apenas no servidor Node.js (não no edge runtime e não durante o build)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🔧 [Instrumentation] Iniciando serviços de background...');

    const rabbitmqUrl = process.env.RABBITMQ_URL;
    console.log('🔧 [Instrumentation] RABBITMQ_URL:', rabbitmqUrl ? `${rabbitmqUrl.substring(0, 15)}...` : 'NÃO DEFINIDA');

    if (rabbitmqUrl) {
      try {
        const { startConsumer } = await import('@/services/atendimento-humano-consumer');
        await startConsumer();
        console.log('✅ [Instrumentation] Consumer de atendimento humano iniciado com sucesso!');
      } catch (error) {
        console.error('❌ [Instrumentation] Erro ao iniciar consumer RabbitMQ:', error);
      }
    } else {
      console.log('⚠️ [Instrumentation] RABBITMQ_URL não configurada, consumer não iniciado');
    }
  }
}
