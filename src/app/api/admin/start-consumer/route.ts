import { NextResponse } from 'next/server';
import { startConsumer } from '@/services/atendimento-humano-consumer';

// Variável para rastrear se o consumer já foi iniciado
let consumerStarted = false;
let consumerError: string | null = null;

// POST /api/admin/start-consumer - Inicia o consumer manualmente
export async function POST(): Promise<NextResponse> {
  console.log('[StartConsumer] Endpoint chamado');
  console.log('[StartConsumer] consumerStarted:', consumerStarted);
  
  if (consumerStarted) {
    return NextResponse.json({
      success: true,
      message: 'Consumer já estava rodando',
      alreadyRunning: true
    });
  }

  try {
    console.log('[StartConsumer] Iniciando consumer...');
    await startConsumer();
    consumerStarted = true;
    consumerError = null;
    
    console.log('[StartConsumer] ✅ Consumer iniciado com sucesso!');
    
    return NextResponse.json({
      success: true,
      message: 'Consumer iniciado com sucesso',
      alreadyRunning: false
    });
  } catch (error) {
    console.error('[StartConsumer] ❌ Erro:', error);
    consumerError = error instanceof Error ? error.message : 'Erro desconhecido';
    
    return NextResponse.json({
      success: false,
      error: consumerError
    }, { status: 500 });
  }
}

// GET /api/admin/start-consumer - Verifica status do consumer
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    consumerStarted,
    consumerError,
    rabbitmqConfigured: !!process.env.RABBITMQ_URL,
    timestamp: new Date().toISOString()
  });
}
