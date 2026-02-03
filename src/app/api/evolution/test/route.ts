import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/middleware';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '';

// GET - Testar conexão com Evolution API
export async function GET(request: NextRequest) {
  console.log('[Evolution Test] ====== TESTE DE CONEXÃO ======');
  
  try {
    // Verificar autenticação (apenas admin pode testar)
    const { user, error } = getAuthUser(request);
    if (!user || error) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }
    
    if (user.papel !== 'admin') {
      return NextResponse.json({ error: 'Apenas admin pode testar' }, { status: 403 });
    }

    // Informações de configuração (sem expor a chave completa)
    const config = {
      evolutionApiUrl: EVOLUTION_API_URL,
      evolutionApiKeyConfigured: !!EVOLUTION_API_KEY,
      evolutionApiKeyLength: EVOLUTION_API_KEY.length,
      evolutionApiKeyPrefix: EVOLUTION_API_KEY ? EVOLUTION_API_KEY.substring(0, 8) + '...' : 'NÃO CONFIGURADA',
    };
    
    console.log('[Evolution Test] Configurações:', config);

    // Testar conexão básica com a Evolution API
    console.log('[Evolution Test] Testando conexão com:', EVOLUTION_API_URL);
    
    let evolutionStatus = 'unknown';
    let evolutionError: string | null = null;
    let evolutionInstances: number | null = null;
    let evolutionResponse: unknown = null;
    
    try {
      const startTime = Date.now();
      const response = await fetch(`${EVOLUTION_API_URL}/instance/fetchInstances`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY,
        },
        // Timeout de 10 segundos
        signal: AbortSignal.timeout(10000),
      });
      const endTime = Date.now();
      
      console.log('[Evolution Test] Resposta em', endTime - startTime, 'ms');
      console.log('[Evolution Test] Status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        evolutionStatus = 'connected';
        evolutionInstances = Array.isArray(data) ? data.length : 0;
        evolutionResponse = Array.isArray(data) ? data.map((i: { instanceName: string; status: string }) => ({
          name: i.instanceName,
          status: i.status
        })) : data;
        console.log('[Evolution Test] Instâncias encontradas:', evolutionInstances);
      } else {
        const errorText = await response.text();
        evolutionStatus = 'error';
        evolutionError = `Status ${response.status}: ${errorText}`;
        console.error('[Evolution Test] Erro:', evolutionError);
      }
    } catch (fetchError) {
      evolutionStatus = 'connection_failed';
      evolutionError = fetchError instanceof Error ? fetchError.message : 'Erro desconhecido';
      console.error('[Evolution Test] Falha na conexão:', evolutionError);
    }

    // Resultado do teste
    const result = {
      timestamp: new Date().toISOString(),
      config,
      evolution: {
        status: evolutionStatus,
        error: evolutionError,
        instancesCount: evolutionInstances,
        instances: evolutionResponse,
      },
      nodeEnv: process.env.NODE_ENV,
    };

    console.log('[Evolution Test] Resultado final:', JSON.stringify(result, null, 2));
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('[Evolution Test] ERRO CATCH:', error);
    return NextResponse.json({ 
      error: 'Erro interno', 
      details: error instanceof Error ? error.message : 'Desconhecido' 
    }, { status: 500 });
  }
}
