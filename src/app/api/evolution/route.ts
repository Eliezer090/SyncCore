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
  try {
    // Verificar autenticação
    const { user, error } = getAuthUser(request);
    if (!user || error) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { empresa_id } = body;

    if (!empresa_id) {
      return NextResponse.json({ error: 'empresa_id é obrigatório' }, { status: 400 });
    }

    // Verificar permissão (admin ou da empresa)
    if (user.papel !== 'admin' && user.empresaId !== empresa_id) {
      return NextResponse.json({ error: 'Sem permissão para esta empresa' }, { status: 403 });
    }

    // Buscar dados da empresa
    const empresaResult = await query<Empresa>(
      'SELECT id, nome, whatsapp_vinculado FROM empresas WHERE id = $1',
      [empresa_id]
    );

    if (empresaResult.length === 0) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    }

    const empresa = empresaResult[0];

    // Setup completo: criar instância + webhook + QR
    const result = await setupWhatsAppConnection(empresa.nome, empresa.id);

    if (!result.success || !result.data) {
      return NextResponse.json({ error: result.error || 'Erro ao configurar WhatsApp' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      instanceName: result.data.instanceName,
      qrcode: result.data.qrcode,
    });
  } catch (error) {
    console.error('[Evolution Route] Erro:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
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
