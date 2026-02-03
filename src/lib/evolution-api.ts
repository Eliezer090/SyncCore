/**
 * Evolution API - Integração com WhatsApp
 * 
 * Biblioteca para criar instâncias, conectar WhatsApp via QR Code,
 * e configurar webhooks automaticamente.
 */

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '';
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || '';

// Log das configurações ao inicializar (sem expor a chave completa)
console.log('[Evolution Config] URL:', EVOLUTION_API_URL);
console.log('[Evolution Config] API Key configurada:', EVOLUTION_API_KEY ? `${EVOLUTION_API_KEY.substring(0, 8)}...` : 'NÃO CONFIGURADA');
console.log('[Evolution Config] N8N Webhook:', N8N_WEBHOOK_URL || 'NÃO CONFIGURADO');

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
  const url = `${EVOLUTION_API_URL}/instance/fetchInstances`;
  console.log('[Evolution] checkInstanceExists - URL:', url);
  console.log('[Evolution] checkInstanceExists - Instance:', instanceName);
  
  try {
    console.log('[Evolution] Fazendo fetch para:', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    console.log('[Evolution] checkInstanceExists - Status:', response.status);
    
    if (!response.ok) {
      const error = await response.text();
      console.error('[Evolution] checkInstanceExists - Erro resposta:', error);
      return { success: false, error: `Erro ao verificar instâncias: ${response.status} - ${error}` };
    }

    const instances: InstanceInfo[] = await response.json();
    console.log('[Evolution] checkInstanceExists - Total instâncias:', instances.length);
    const found = instances.find(i => i.instanceName === instanceName);
    console.log('[Evolution] checkInstanceExists - Encontrada:', !!found);
    
    return { success: true, data: found || null };
  } catch (error) {
    console.error('[Evolution] checkInstanceExists - Erro catch:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return { success: false, error: `Erro de conexão com Evolution API: ${errorMessage}` };
  }
}

/**
 * Cria uma nova instância na Evolution API
 */
export async function createInstance(instanceName: string): Promise<EvolutionResponse<InstanceInfo>> {
  const url = `${EVOLUTION_API_URL}/instance/create`;
  console.log('[Evolution] createInstance - URL:', url);
  console.log('[Evolution] createInstance - Instance:', instanceName);
  
  try {
    const payload = {
      instanceName,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS',
    };
    console.log('[Evolution] createInstance - Payload:', JSON.stringify(payload));

    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    console.log('[Evolution] createInstance - Status:', response.status);
    
    if (!response.ok) {
      const error = await response.text();
      console.error('[Evolution] createInstance - Erro resposta:', error);
      return { success: false, error: `Erro ao criar instância: ${response.status} - ${error}` };
    }

    const data = await response.json();
    console.log('[Evolution] createInstance - Sucesso:', instanceName);
    console.log('[Evolution] createInstance - Data:', JSON.stringify(data));
    
    return { success: true, data };
  } catch (error) {
    console.error('[Evolution] createInstance - Erro catch:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return { success: false, error: `Erro de conexão com Evolution API: ${errorMessage}` };
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
  const url = `${EVOLUTION_API_URL}/instance/connect/${instanceName}`;
  console.log('[Evolution] getQRCode - URL:', url);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    console.log('[Evolution] getQRCode - Status:', response.status);
    
    if (!response.ok) {
      const error = await response.text();
      console.error('[Evolution] getQRCode - Erro resposta:', error);
      return { success: false, error: `Erro ao obter QR Code: ${response.status} - ${error}` };
    }

    const data = await response.json();
    console.log('[Evolution] getQRCode - Sucesso, base64 presente:', !!data?.base64);
    return { success: true, data };
  } catch (error) {
    console.error('[Evolution] getQRCode - Erro catch:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return { success: false, error: `Erro de conexão com Evolution API: ${errorMessage}` };
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
  
  console.log('[Evolution] ====== INÍCIO DO SETUP ======');
  console.log('[Evolution] Empresa Nome:', empresaNome);
  console.log('[Evolution] Empresa ID:', empresaId);
  console.log('[Evolution] Instance Name:', instanceName);
  console.log('[Evolution] EVOLUTION_API_URL:', EVOLUTION_API_URL);
  console.log('[Evolution] API Key presente:', !!EVOLUTION_API_KEY);

  // 1. Verificar se instância existe
  console.log('[Evolution] Passo 1: Verificando se instância existe...');
  const existsResult = await checkInstanceExists(instanceName);
  console.log('[Evolution] Passo 1 resultado:', JSON.stringify(existsResult));
  
  if (!existsResult.success) {
    console.error('[Evolution] Passo 1 FALHOU:', existsResult.error);
    return { success: false, error: existsResult.error };
  }

  // 2. Criar instância se não existir
  if (!existsResult.data) {
    console.log('[Evolution] Passo 2: Criando instância...');
    const createResult = await createInstance(instanceName);
    console.log('[Evolution] Passo 2 resultado:', JSON.stringify(createResult));
    if (!createResult.success) {
      console.error('[Evolution] Passo 2 FALHOU:', createResult.error);
      return { success: false, error: createResult.error };
    }
  } else {
    console.log('[Evolution] Passo 2: Instância já existe, pulando criação');
  }

  // 3. Configurar webhook
  console.log('[Evolution] Passo 3: Configurando webhook...');
  const webhookResult = await configureWebhook(instanceName);
  console.log('[Evolution] Passo 3 resultado:', JSON.stringify(webhookResult));
  if (!webhookResult.success) {
    console.warn('[Evolution] Passo 3 AVISO: Webhook não configurado:', webhookResult.error);
    // Não falha - pode configurar depois
  }

  // 4. Obter QR Code
  console.log('[Evolution] Passo 4: Obtendo QR Code...');
  const qrResult = await getQRCode(instanceName);
  console.log('[Evolution] Passo 4 resultado: success=', qrResult.success, 'hasData=', !!qrResult.data);
  if (!qrResult.success || !qrResult.data) {
    console.error('[Evolution] Passo 4 FALHOU:', qrResult.error);
    return { success: false, error: qrResult.error || 'Erro ao obter QR Code' };
  }

  console.log('[Evolution] ====== SETUP CONCLUÍDO COM SUCESSO ======');
  return { 
    success: true, 
    data: { 
      qrcode: qrResult.data, 
      instanceName 
    } 
  };
}
