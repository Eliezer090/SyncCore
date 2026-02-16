import { NextRequest, NextResponse } from 'next/server';
import { publishToQueue } from '@/lib/rabbitmq';

// POST /api/admin/test-rabbitmq - Testa a comunicação com RabbitMQ
export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log('[TestRabbitMQ] Endpoint chamado');
  
  try {
    const body = await request.json().catch(() => ({}));
    const { empresa_id = 1, cliente_id = 1 } = body;

    console.log('[TestRabbitMQ] Enviando mensagem de teste...');
    console.log('[TestRabbitMQ] empresa_id:', empresa_id, 'cliente_id:', cliente_id);

    const testMessage = {
      cliente_id,
      empresa_id,
      timestamp: new Date().toISOString(),
      test: true,
      message: 'Mensagem de teste do RabbitMQ'
    };

    console.log('[TestRabbitMQ] Mensagem:', JSON.stringify(testMessage));

    await publishToQueue('atendimento_humano', testMessage);

    console.log('[TestRabbitMQ] ✅ Mensagem enviada com sucesso!');

    return NextResponse.json({
      success: true,
      message: 'Mensagem de teste enviada para a fila atendimento_humano',
      data: testMessage
    });
  } catch (error) {
    console.error('[TestRabbitMQ] ❌ Erro:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const errorStack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json({
      success: false,
      error: errorMessage,
      stack: errorStack
    }, { status: 500 });
  }
}

// GET /api/admin/test-rabbitmq - Status do RabbitMQ
export async function GET(): Promise<NextResponse> {
  console.log('[TestRabbitMQ] GET - Verificando status...');
  
  const rabbitmqUrl = process.env.RABBITMQ_URL;
  
  return NextResponse.json({
    configured: !!rabbitmqUrl,
    url: rabbitmqUrl ? `${rabbitmqUrl.substring(0, 30)}...` : null,
    timestamp: new Date().toISOString()
  });
}
