// Next.js Instrumentation - roda uma vez quando o servidor inicia
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

function logInstrumentation(message: string, ...args: unknown[]): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [Instrumentation] ${message}`, ...args);
}

export async function register() {
  logInstrumentation('========================================');
  logInstrumentation('🔧 register() INICIADO');
  logInstrumentation('========================================');
  logInstrumentation('NEXT_RUNTIME:', process.env.NEXT_RUNTIME);
  logInstrumentation('NODE_ENV:', process.env.NODE_ENV);
  logInstrumentation('Process PID:', process.pid);

  // Apenas no servidor Node.js (não no edge runtime e não durante o build)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    logInstrumentation('✅ Ambiente nodejs detectado - prosseguindo...');
    logInstrumentation('Verificando variáveis de ambiente...');

    const rabbitmqUrl = process.env.RABBITMQ_URL;
    logInstrumentation('RABBITMQ_URL definida?:', !!rabbitmqUrl);
    if (rabbitmqUrl) {
      logInstrumentation('RABBITMQ_URL (parcial):', `${rabbitmqUrl.substring(0, 30)}...`);
    }

    if (rabbitmqUrl) {
      try {
        logInstrumentation('Importando atendimento-humano-consumer...');
        const consumerModule = await import('@/services/atendimento-humano-consumer');
        logInstrumentation('Módulo importado com sucesso. Funções disponíveis:', Object.keys(consumerModule));
        
        logInstrumentation('Chamando startConsumer()...');
        await consumerModule.startConsumer();
        logInstrumentation('✅ startConsumer() retornou com sucesso!');
      } catch (error) {
        logInstrumentation('❌ Erro ao iniciar consumer RabbitMQ:');
        if (error instanceof Error) {
          logInstrumentation('  - Message:', error.message);
          logInstrumentation('  - Stack:', error.stack);
        } else {
          logInstrumentation('  - Error:', error);
        }
      }
    } else {
      logInstrumentation('⚠️ RABBITMQ_URL não configurada - consumer NÃO será iniciado');
      logInstrumentation('Para usar o consumer, defina RABBITMQ_URL no .env');
    }
  } else {
    logInstrumentation('⚠️ NEXT_RUNTIME não é nodejs:', process.env.NEXT_RUNTIME);
    logInstrumentation('Consumer não será iniciado neste ambiente');
  }
  
  logInstrumentation('========================================');
  logInstrumentation('🔧 register() FINALIZADO');
  logInstrumentation('========================================');
}
