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
  // Tentar primeiro buscar a instância específica pelo nome
  const urlSpecific = `${EVOLUTION_API_URL}/instance/fetchInstances?instanceName=${instanceName}`;
  console.log('[Evolution] checkInstanceExists - Buscando instância específica:', urlSpecific);
  
  try {
    // Primeiro: buscar instância específica
    const responseSpecific = await fetch(urlSpecific, {
      method: 'GET',
      headers: getHeaders(),
    });

    console.log('[Evolution] checkInstanceExists - Status (específico):', responseSpecific.status);
    
    if (responseSpecific.ok) {
      const data = await responseSpecific.json();
      console.log('[Evolution] checkInstanceExists - Resposta específica:', JSON.stringify(data));
      
      // A Evolution API pode retornar um array ou um objeto
      if (Array.isArray(data) && data.length > 0) {
        const found = data.find((i: InstanceInfo) => i.instanceName === instanceName);
        if (found) {
          console.log('[Evolution] checkInstanceExists - Instância encontrada (array):', found.instanceName);
          return { success: true, data: found };
        }
      } else if (data && typeof data === 'object' && !Array.isArray(data)) {
        // Pode ser um objeto único
        if (data.instanceName === instanceName || data.instance?.instanceName === instanceName) {
          console.log('[Evolution] checkInstanceExists - Instância encontrada (objeto)');
          return { success: true, data: data as InstanceInfo };
        }
      }
    }

    // Segundo: buscar todas as instâncias como fallback
    const urlAll = `${EVOLUTION_API_URL}/instance/fetchInstances`;
    console.log('[Evolution] checkInstanceExists - Buscando todas instâncias:', urlAll);
    
    const responseAll = await fetch(urlAll, {
      method: 'GET',
      headers: getHeaders(),
    });

    console.log('[Evolution] checkInstanceExists - Status (todas):', responseAll.status);
    
    if (!responseAll.ok) {
      const error = await responseAll.text();
      console.error('[Evolution] checkInstanceExists - Erro resposta:', error);
      return { success: false, error: `Erro ao verificar instâncias: ${responseAll.status} - ${error}` };
    }

    const instances = await responseAll.json();
    console.log('[Evolution] checkInstanceExists - Resposta (raw):', JSON.stringify(instances).substring(0, 500));
    
    // Normalizar para array
    const instancesArray = Array.isArray(instances) ? instances : [instances].filter(Boolean);
    console.log('[Evolution] checkInstanceExists - Total instâncias:', instancesArray.length);
    
    // Listar nomes das instâncias para debug
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const names = instancesArray.map((i: any) => 
      i.instanceName || i.instance?.instanceName || 'unknown'
    );
    console.log('[Evolution] checkInstanceExists - Nomes encontrados:', names);
    
    // Buscar a instância pelo nome (checando diferentes formatos de resposta)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const found = instancesArray.find((i: any) => 
      i.instanceName === instanceName || 
      i.instance?.instanceName === instanceName
    ) as InstanceInfo | undefined;
    
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
 * Se a instância já existe (erro 403), retorna sucesso indicando que já existe
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
      const errorText = await response.text();
      console.error('[Evolution] createInstance - Erro resposta:', errorText);
      
      // Se erro 403 com "already in use", significa que a instância já existe
      // Isso é OK - podemos continuar o fluxo
      if (response.status === 403 && errorText.includes('already in use')) {
        console.log('[Evolution] createInstance - Instância já existe, continuando...');
        return { 
          success: true, 
          data: { instanceName, status: 'existing' } as InstanceInfo 
        };
      }
      
      return { success: false, error: `Erro ao criar instância: ${response.status} - ${errorText}` };
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
  const url = `${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`;
  console.log('[Evolution] getConnectionState - URL:', url);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    console.log('[Evolution] getConnectionState - Status HTTP:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('[Evolution] getConnectionState - Erro resposta:', error);
      return { success: false, error: 'Erro ao verificar conexão' };
    }

    const data = await response.json();
    console.log('[Evolution] getConnectionState - Resposta raw:', JSON.stringify(data));
    
    // A Evolution API retorna no formato: {"instance":{"instanceName":"xxx","state":"open"}}
    // Precisamos extrair o state corretamente
    let state: 'open' | 'close' | 'connecting' = 'close';
    let instance = instanceName;
    
    if (data.instance) {
      // Formato: {"instance":{"instanceName":"xxx","state":"open"}}
      state = data.instance.state || 'close';
      instance = data.instance.instanceName || instanceName;
    } else if (data.state) {
      // Formato alternativo: {"state":"open","instanceName":"xxx"}
      state = data.state;
      instance = data.instanceName || instanceName;
    }
    
    console.log('[Evolution] getConnectionState - State extraído:', state);
    
    return { 
      success: true, 
      data: {
        instance,
        state,
        statusReason: data.statusReason || data.instance?.statusReason
      }
    };
  } catch (error) {
    console.error('[Evolution] getConnectionState - Erro catch:', error);
    return { success: false, error: 'Erro de conexão com Evolution API' };
  }
}

/**
 * Obtém informações da instância conectada (incluindo número do WhatsApp)
 * Tenta múltiplas rotas da Evolution API para obter o número
 */
export async function getInstanceInfo(instanceName: string): Promise<EvolutionResponse<InstanceInfo>> {
  console.log('[Evolution] getInstanceInfo - Buscando info para:', instanceName);
  
  try {
    // Primeiro, tentar a rota fetchInstances
    const url1 = `${EVOLUTION_API_URL}/instance/fetchInstances?instanceName=${instanceName}`;
    console.log('[Evolution] getInstanceInfo - Tentando URL 1:', url1);
    
    const response1 = await fetch(url1, {
      method: 'GET',
      headers: getHeaders(),
    });

    let owner: string | undefined;
    let profileName: string | undefined;
    let profilePictureUrl: string | undefined;
    let status: string = 'unknown';

    if (response1.ok) {
      const data1 = await response1.json();
      console.log('[Evolution] getInstanceInfo - Resposta fetchInstances:', JSON.stringify(data1, null, 2));
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let rawInstance: any = null;
      
      if (Array.isArray(data1)) {
        rawInstance = data1.find((i) => 
          i.instanceName === instanceName || 
          i.instance?.instanceName === instanceName ||
          i.name === instanceName
        );
      } else if (data1 && typeof data1 === 'object') {
        rawInstance = data1;
      }
      
      if (rawInstance) {
        // Tentar extrair owner de diferentes caminhos
        owner = rawInstance.owner || 
                rawInstance.instance?.owner || 
                rawInstance.ownerJid || 
                rawInstance.instance?.ownerJid ||
                rawInstance.wuid;
        profileName = rawInstance.profileName || rawInstance.instance?.profileName || rawInstance.pushname;
        profilePictureUrl = rawInstance.profilePictureUrl || rawInstance.instance?.profilePictureUrl;
        status = rawInstance.status || rawInstance.instance?.status || rawInstance.connectionStatus || 'unknown';
      }
    }
    
    // Se não conseguiu o owner, tentar a rota de connectionState que às vezes retorna mais info
    if (!owner) {
      const url2 = `${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`;
      console.log('[Evolution] getInstanceInfo - Tentando URL 2:', url2);
      
      const response2 = await fetch(url2, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      if (response2.ok) {
        const data2 = await response2.json();
        console.log('[Evolution] getInstanceInfo - Resposta connectionState:', JSON.stringify(data2, null, 2));
        
        // Tentar extrair de instance.owner ou instance.wuid
        owner = data2.instance?.owner || data2.owner || data2.instance?.wuid || data2.wuid;
        status = data2.instance?.state || data2.state || status;
      }
    }
    
    // Se ainda não conseguiu, tentar a rota específica de me/profile (algumas versões da Evolution)
    if (!owner) {
      const url3 = `${EVOLUTION_API_URL}/chat/whatsappNumber/${instanceName}`;
      console.log('[Evolution] getInstanceInfo - Tentando URL 3:', url3);
      
      try {
        const response3 = await fetch(url3, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ numbers: ['me'] }),
        });
        
        if (response3.ok) {
          const data3 = await response3.json();
          console.log('[Evolution] getInstanceInfo - Resposta whatsappNumber:', JSON.stringify(data3, null, 2));
          
          if (Array.isArray(data3) && data3.length > 0) {
            owner = data3[0].jid || data3[0].number;
          }
        }
      } catch (e) {
        console.log('[Evolution] getInstanceInfo - URL 3 falhou (esperado em algumas versões)');
      }
    }
    
    console.log('[Evolution] getInstanceInfo - owner final:', owner);
    console.log('[Evolution] getInstanceInfo - status final:', status);
    
    // Construir objeto InstanceInfo
    const instance: InstanceInfo = {
      instanceName: instanceName,
      status: status,
      owner: owner,
      profileName: profileName,
      profilePictureUrl: profilePictureUrl,
    };
    
    return { success: true, data: instance };
  } catch (error) {
    console.error('[Evolution] getInstanceInfo - Erro catch:', error);
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
  
  // Se falhou em verificar, tentar criar mesmo assim (a criação vai retornar se já existe)
  let instanceExists: boolean = !!(existsResult.success && existsResult.data);
  
  if (!existsResult.success) {
    console.warn('[Evolution] Passo 1 AVISO: Não foi possível verificar instância, tentando criar...');
  }

  // 2. Criar instância se não existir (ou se não conseguiu verificar)
  if (!instanceExists) {
    console.log('[Evolution] Passo 2: Criando instância...');
    const createResult = await createInstance(instanceName);
    console.log('[Evolution] Passo 2 resultado:', JSON.stringify(createResult));
    
    // createInstance agora retorna sucesso mesmo se já existir (trata erro 403)
    if (!createResult.success) {
      console.error('[Evolution] Passo 2 FALHOU:', createResult.error);
      return { success: false, error: createResult.error };
    }
    
    // Se criou ou já existia, marcar como existente
    instanceExists = true;
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
    // Se falhou ao obter QR, pode ser que a instância já está conectada
    // Vamos verificar o estado da conexão
    console.log('[Evolution] Passo 4 AVISO: QR não obtido, verificando estado da conexão...');
    const stateResult = await getConnectionState(instanceName);
    
    if (stateResult.success && stateResult.data?.state === 'open') {
      console.log('[Evolution] Instância já está conectada!');
      return { 
        success: false, 
        error: 'Instância já está conectada. Se quiser reconectar, desconecte primeiro.' 
      };
    }
    
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
