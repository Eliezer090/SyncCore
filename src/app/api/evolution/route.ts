import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/middleware';
import { query } from '@/lib/db';
import {
  setupWhatsAppConnection,
  getConnectionState,
  getQRCode,
  getInstanceInfo,
  logoutInstance,
  sanitizeInstanceName,
} from '@/lib/evolution-api';

interface Empresa {
  id: number;
  nome: string;
  whatsapp_vinculado: string | null;
}

// POST - Iniciar conexão WhatsApp (criar instância + QR Code)
export async function POST(request: NextRequest) {
  console.log('[Evolution Route] ====== POST /api/evolution ======');
  
  try {
    // Verificar autenticação
    console.log('[Evolution Route] Verificando autenticação...');
    const { user, error } = getAuthUser(request);
    if (!user || error) {
      console.error('[Evolution Route] Não autorizado:', error);
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }
    console.log('[Evolution Route] Usuário autenticado:', user.id, user.papel);

    const body = await request.json();
    const { empresa_id } = body;
    console.log('[Evolution Route] empresa_id recebido:', empresa_id);

    if (!empresa_id) {
      console.error('[Evolution Route] empresa_id não fornecido');
      return NextResponse.json({ error: 'empresa_id é obrigatório' }, { status: 400 });
    }

    // Verificar permissão (admin ou da empresa)
    if (user.papel !== 'admin' && user.empresaId !== empresa_id) {
      console.error('[Evolution Route] Sem permissão - user.empresaId:', user.empresaId, 'empresa_id:', empresa_id);
      return NextResponse.json({ error: 'Sem permissão para esta empresa' }, { status: 403 });
    }

    // Buscar dados da empresa
    console.log('[Evolution Route] Buscando dados da empresa...');
    const empresaResult = await query<Empresa>(
      'SELECT id, nome, whatsapp_vinculado FROM empresas WHERE id = $1',
      [empresa_id]
    );

    if (empresaResult.length === 0) {
      console.error('[Evolution Route] Empresa não encontrada:', empresa_id);
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    }

    const empresa = empresaResult[0];
    console.log('[Evolution Route] Empresa encontrada:', empresa.id, empresa.nome);

    // Setup completo: criar instância + webhook + QR
    console.log('[Evolution Route] Iniciando setupWhatsAppConnection...');
    const result = await setupWhatsAppConnection(empresa.nome, empresa.id);
    console.log('[Evolution Route] Resultado do setup:', JSON.stringify({ success: result.success, error: result.error, hasData: !!result.data }));

    if (!result.success || !result.data) {
      console.error('[Evolution Route] Setup falhou:', result.error);
      return NextResponse.json({ error: result.error || 'Erro ao configurar WhatsApp' }, { status: 500 });
    }

    console.log('[Evolution Route] ====== SUCESSO ======');
    return NextResponse.json({
      success: true,
      instanceName: result.data.instanceName,
      qrcode: result.data.qrcode,
    });
  } catch (error) {
    console.error('[Evolution Route] ERRO CATCH:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[Evolution Route] Error message:', errorMessage);
    console.error('[Evolution Route] Error stack:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json({ error: `Erro interno do servidor: ${errorMessage}` }, { status: 500 });
  }
}

// GET - Verificar status da conexão
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const { user, error } = getAuthUser(request);
    if (!user || error) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const empresaId = searchParams.get('empresa_id');

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

    // Verificar estado da conexão
    const stateResult = await getConnectionState(instanceName);

    if (!stateResult.success) {
      return NextResponse.json({
        connected: false,
        state: 'not_found',
        instanceName,
        error: stateResult.error,
      });
    }

    const isConnected = stateResult.data?.state === 'open';

    // Se conectado, buscar informações da instância
    let phoneNumber: string | null = null;
    if (isConnected) {
      const infoResult = await getInstanceInfo(instanceName);
      if (infoResult.success && infoResult.data?.owner) {
        // O owner vem no formato "5511999999999@s.whatsapp.net"
        phoneNumber = infoResult.data.owner.split('@')[0];
      }
    }

    return NextResponse.json({
      connected: isConnected,
      state: stateResult.data?.state || 'unknown',
      instanceName,
      phoneNumber,
      whatsappVinculado: empresa.whatsapp_vinculado,
    });
  } catch (error) {
    console.error('[Evolution Route] Erro:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Desconectar WhatsApp
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticação
    const { user, error } = getAuthUser(request);
    if (!user || error) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const empresaId = searchParams.get('empresa_id');

    if (!empresaId) {
      return NextResponse.json({ error: 'empresa_id é obrigatório' }, { status: 400 });
    }

    // Verificar permissão
    if (user.papel !== 'admin' && user.empresaId !== parseInt(empresaId)) {
      return NextResponse.json({ error: 'Sem permissão para esta empresa' }, { status: 403 });
    }

    // Buscar dados da empresa
    const empresaResult = await query<Empresa>(
      'SELECT id, nome FROM empresas WHERE id = $1',
      [empresaId]
    );

    if (empresaResult.length === 0) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    }

    const empresa = empresaResult[0];
    const instanceName = `empresa_${empresa.id}_${sanitizeInstanceName(empresa.nome)}`;

    // Desconectar
    const result = await logoutInstance(instanceName);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Erro ao desconectar' }, { status: 500 });
    }

    // Limpar o whatsapp_vinculado
    await query(
      'UPDATE empresas SET whatsapp_vinculado = NULL WHERE id = $1',
      [empresaId]
    );

    return NextResponse.json({ success: true, message: 'WhatsApp desconectado' });
  } catch (error) {
    console.error('[Evolution Route] Erro:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
