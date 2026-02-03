import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/middleware';
import { query } from '@/lib/db';
import {
  getQRCode,
  getConnectionState,
  getInstanceInfo,
  sanitizeInstanceName,
} from '@/lib/evolution-api';

interface Empresa {
  id: number;
  nome: string;
  whatsapp_vinculado: string | null;
}

// GET - Obter novo QR Code ou verificar conexão
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const { user, error } = getAuthUser(request);
    if (!user || error) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const empresaId = searchParams.get('empresa_id');
    const action = searchParams.get('action') || 'qrcode'; // 'qrcode' ou 'status'

    if (!empresaId) {
      return NextResponse.json({ error: 'empresa_id é obrigatório' }, { status: 400 });
    }

    // Verificar permissão
    if (user.papel !== 'admin' && user.empresaId !== parseInt(empresaId)) {
      return NextResponse.json({ error: 'Sem permissão para esta empresa' }, { status: 403 });
    }

    // Buscar dados da empresa
    const empresaResult = await query<Empresa>(
      'SELECT id, nome, whatsapp_vinculado FROM empresas WHERE id = $1',
      [empresaId]
    );

    if (empresaResult.length === 0) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    }

    const empresa = empresaResult[0];
    const instanceName = `empresa_${empresa.id}_${sanitizeInstanceName(empresa.nome)}`;

    console.log('[Evolution QR Route] Verificando estado para:', instanceName);

    // Verificar estado atual
    const stateResult = await getConnectionState(instanceName);
    console.log('[Evolution QR Route] Estado:', JSON.stringify(stateResult));
    
    const isConnected = stateResult.success && stateResult.data?.state === 'open';

    // Se já está conectado, SEMPRE buscar as informações da instância (mesmo se action=status)
    if (isConnected) {
      console.log('[Evolution QR Route] Instância conectada, buscando info...');
      let phoneNumber: string | null = null;
      
      // Buscar informações da instância
      const infoResult = await getInstanceInfo(instanceName);
      console.log('[Evolution QR Route] Info da instância:', JSON.stringify(infoResult));
      
      if (infoResult.success && infoResult.data?.owner) {
        phoneNumber = infoResult.data.owner.split('@')[0];
        console.log('[Evolution QR Route] Número extraído:', phoneNumber);
        
        // Atualizar o whatsapp_vinculado se mudou
        if (phoneNumber && phoneNumber !== empresa.whatsapp_vinculado) {
          await query(
            'UPDATE empresas SET whatsapp_vinculado = $1 WHERE id = $2',
            [phoneNumber, empresaId]
          );
          console.log('[Evolution QR Route] Número atualizado no banco');
        }
      }

      return NextResponse.json({
        connected: true,
        state: 'open',
        instanceName,
        phoneNumber,
      });
    }

    // Se quer apenas status e NÃO está conectado
    if (action === 'status') {
      return NextResponse.json({
        connected: false,
        state: stateResult.data?.state || 'close',
        instanceName,
      });
    }

    // Obter novo QR Code
    const qrResult = await getQRCode(instanceName);

    if (!qrResult.success || !qrResult.data) {
      return NextResponse.json({
        connected: false,
        state: 'error',
        error: qrResult.error || 'Erro ao obter QR Code',
      });
    }

    return NextResponse.json({
      connected: false,
      state: 'connecting',
      instanceName,
      qrcode: qrResult.data,
    });
  } catch (error) {
    console.error('[Evolution QR Route] Erro:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Confirmar conexão e salvar número
export async function PUT(request: NextRequest) {
  console.log('[Evolution QR Route PUT] ====== Iniciando confirmação ======');
  
  try {
    // Verificar autenticação
    const { user, error } = getAuthUser(request);
    if (!user || error) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { empresa_id } = body;
    console.log('[Evolution QR Route PUT] empresa_id:', empresa_id);

    if (!empresa_id) {
      return NextResponse.json({ error: 'empresa_id é obrigatório' }, { status: 400 });
    }

    // Verificar permissão
    if (user.papel !== 'admin' && user.empresaId !== empresa_id) {
      return NextResponse.json({ error: 'Sem permissão para esta empresa' }, { status: 403 });
    }

    // Buscar dados da empresa
    const empresaResult = await query<Empresa>(
      'SELECT id, nome FROM empresas WHERE id = $1',
      [empresa_id]
    );

    if (empresaResult.length === 0) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    }

    const empresa = empresaResult[0];
    const instanceName = `empresa_${empresa.id}_${sanitizeInstanceName(empresa.nome)}`;
    console.log('[Evolution QR Route PUT] instanceName:', instanceName);

    // Verificar se conectou
    console.log('[Evolution QR Route PUT] Verificando estado da conexão...');
    const stateResult = await getConnectionState(instanceName);
    console.log('[Evolution QR Route PUT] Estado:', JSON.stringify(stateResult));
    
    if (!stateResult.success || stateResult.data?.state !== 'open') {
      return NextResponse.json({
        success: false,
        connected: false,
        error: 'WhatsApp ainda não conectado',
      });
    }

    // Buscar número do WhatsApp
    console.log('[Evolution QR Route PUT] Buscando info da instância...');
    const infoResult = await getInstanceInfo(instanceName);
    console.log('[Evolution QR Route PUT] Info resultado:', JSON.stringify(infoResult));
    
    if (!infoResult.success || !infoResult.data?.owner) {
      console.log('[Evolution QR Route PUT] Owner não encontrado na resposta');
      return NextResponse.json({
        success: false,
        connected: true,
        error: 'Não foi possível obter o número do WhatsApp',
      });
    }

    const phoneNumber = infoResult.data.owner.split('@')[0];
    console.log('[Evolution QR Route PUT] Número extraído:', phoneNumber);

    // Salvar no banco
    await query(
      'UPDATE empresas SET whatsapp_vinculado = $1 WHERE id = $2',
      [phoneNumber, empresa_id]
    );
    console.log('[Evolution QR Route PUT] Número salvo no banco!');

    return NextResponse.json({
      success: true,
      connected: true,
      phoneNumber,
      message: 'WhatsApp vinculado com sucesso!',
    });
  } catch (error) {
    console.error('[Evolution QR Route PUT] Erro:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
