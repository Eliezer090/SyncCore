/**
 * Evolution API - Integração com WhatsApp
 * 
 * Biblioteca para criar instâncias, conectar WhatsApp via QR Code,
 * e configurar webhooks automaticamente.
 */

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '';
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || '';

interface EvolutionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

interface InstanceInfo {
  instanceName: string;
  instanceId?: string;
  status: string;
  owner?: string;
  profileName?: string;
  profilePictureUrl?: string;
}

interface QRCodeResponse {
  pairingCode?: string;
  code?: string;
  base64?: string;
  count?: number;
}

interface ConnectionState {
  instance: string;
  state: 'open' | 'close' | 'connecting';
  statusReason?: number;
}

// Headers padrão para requisições
function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'apikey': EVOLUTION_API_KEY,
  };
}

// Sanitizar nome da instância (remover caracteres especiais)
export function sanitizeInstanceName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]/g, '_') // Substitui caracteres especiais por _
    .replace(/_+/g, '_') // Remove _ duplicados
    .replace(/^_|_$/g, ''); // Remove _ do início e fim
}

/**
 * Verifica se uma instância já existe
 */
export async function checkInstanceExists(instanceName: string): Promise<EvolutionResponse<InstanceInfo | null>> {
  try {
    const response = await fetch(`${EVOLUTION_API_URL}/instance/fetchInstances`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Evolution] Erro ao verificar instâncias:', error);
      return { success: false, error: 'Erro ao verificar instâncias' };
    }

    const instances: InstanceInfo[] = await response.json();
    const found = instances.find(i => i.instanceName === instanceName);
    
    return { success: true, data: found || null };
  } catch (error) {
    console.error('[Evolution] Erro ao verificar instância:', error);
    return { success: false, error: 'Erro de conexão com Evolution API' };
  }
}

/**
 * Cria uma nova instância na Evolution API
 */
export async function createInstance(instanceName: string): Promise<EvolutionResponse<InstanceInfo>> {
  try {
    const payload = {
      instanceName,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS',
    };

    const response = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Evolution] Erro ao criar instância:', error);
      return { success: false, error: 'Erro ao criar instância' };
    }

    const data = await response.json();
    console.log('[Evolution] Instância criada:', instanceName);
    
    return { success: true, data };
  } catch (error) {
    console.error('[Evolution] Erro ao criar instância:', error);
    return { success: false, error: 'Erro de conexão com Evolution API' };
  }
}

/**
 * Configura o webhook da instância para o N8N
 */
export async function configureWebhook(instanceName: string, webhookUrl?: string): Promise<EvolutionResponse> {
  try {
    const url = webhookUrl || N8N_WEBHOOK_URL;
    
    if (!url) {
      return { success: false, error: 'URL do webhook não configurada' };
    }

    const payload = {
      webhook: {
        enabled: true,
        url,
        webhookByEvents: false,
        webhookBase64: false,
        events: [
          'MESSAGES_UPSERT',
          // Eventos adicionais que podem ser úteis:
          // 'MESSAGES_UPDATE',
          // 'MESSAGES_DELETE',
          // 'SEND_MESSAGE',
          // 'CONNECTION_UPDATE',
          // 'QRCODE_UPDATED',
        ],
      },
    };

    const response = await fetch(`${EVOLUTION_API_URL}/webhook/set/${instanceName}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Evolution] Erro ao configurar webhook:', error);
      return { success: false, error: 'Erro ao configurar webhook' };
    }

    console.log('[Evolution] Webhook configurado para:', instanceName);
    return { success: true };
  } catch (error) {
    console.error('[Evolution] Erro ao configurar webhook:', error);
    return { success: false, error: 'Erro de conexão com Evolution API' };
  }
}

/**
 * Obtém o QR Code para conexão
 */
export async function getQRCode(instanceName: string): Promise<EvolutionResponse<QRCodeResponse>> {
  try {
    const response = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Evolution] Erro ao obter QR Code:', error);
      return { success: false, error: 'Erro ao obter QR Code' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('[Evolution] Erro ao obter QR Code:', error);
    return { success: false, error: 'Erro de conexão com Evolution API' };
  }
}

/**
 * Verifica o estado da conexão
 */
export async function getConnectionState(instanceName: string): Promise<EvolutionResponse<ConnectionState>> {
  try {
    const response = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Evolution] Erro ao verificar conexão:', error);
      return { success: false, error: 'Erro ao verificar conexão' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('[Evolution] Erro ao verificar conexão:', error);
    return { success: false, error: 'Erro de conexão com Evolution API' };
  }
}

/**
 * Obtém informações da instância conectada (incluindo número do WhatsApp)
 */
export async function getInstanceInfo(instanceName: string): Promise<EvolutionResponse<InstanceInfo>> {
  try {
    const response = await fetch(`${EVOLUTION_API_URL}/instance/fetchInstances?instanceName=${instanceName}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Evolution] Erro ao obter info da instância:', error);
      return { success: false, error: 'Erro ao obter informações' };
    }

    const instances: InstanceInfo[] = await response.json();
    const instance = instances.find(i => i.instanceName === instanceName);
    
    if (!instance) {
      return { success: false, error: 'Instância não encontrada' };
    }

    return { success: true, data: instance };
  } catch (error) {
    console.error('[Evolution] Erro ao obter info:', error);
    return { success: false, error: 'Erro de conexão com Evolution API' };
  }
}

/**
 * Desconecta uma instância (logout)
 */
export async function logoutInstance(instanceName: string): Promise<EvolutionResponse> {
  try {
    const response = await fetch(`${EVOLUTION_API_URL}/instance/logout/${instanceName}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Evolution] Erro ao desconectar:', error);
      return { success: false, error: 'Erro ao desconectar' };
    }

    console.log('[Evolution] Instância desconectada:', instanceName);
    return { success: true };
  } catch (error) {
    console.error('[Evolution] Erro ao desconectar:', error);
    return { success: false, error: 'Erro de conexão com Evolution API' };
  }
}

/**
 * Fluxo completo: criar instância (se não existir), configurar webhook e obter QR
 */
export async function setupWhatsAppConnection(empresaNome: string, empresaId: number): Promise<EvolutionResponse<{ qrcode: QRCodeResponse; instanceName: string }>> {
  const instanceName = `empresa_${empresaId}_${sanitizeInstanceName(empresaNome)}`;
  
  console.log('[Evolution] Iniciando setup para:', instanceName);

  // 1. Verificar se instância existe
  const existsResult = await checkInstanceExists(instanceName);
  
  if (!existsResult.success) {
    return { success: false, error: existsResult.error };
  }

  // 2. Criar instância se não existir
  if (!existsResult.data) {
    const createResult = await createInstance(instanceName);
    if (!createResult.success) {
      return { success: false, error: createResult.error };
    }
  }

  // 3. Configurar webhook
  const webhookResult = await configureWebhook(instanceName);
  if (!webhookResult.success) {
    console.warn('[Evolution] Webhook não configurado:', webhookResult.error);
    // Não falha - pode configurar depois
  }

  // 4. Obter QR Code
  const qrResult = await getQRCode(instanceName);
  if (!qrResult.success || !qrResult.data) {
    return { success: false, error: qrResult.error || 'Erro ao obter QR Code' };
  }

  return { 
    success: true, 
    data: { 
      qrcode: qrResult.data, 
      instanceName 
    } 
  };
}
