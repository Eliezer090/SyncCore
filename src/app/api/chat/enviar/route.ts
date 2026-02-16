import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, getEmpresaIdParaQuery } from '@/lib/auth/middleware';
import { query } from '@/lib/db';
import { sendText, sanitizeInstanceName } from '@/lib/evolution-api';

// POST /api/chat/enviar - Envia uma mensagem de texto via WhatsApp
export async function POST(request: NextRequest) {
  try {
    const { user, error } = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    const empresaId = getEmpresaIdParaQuery(user);
    if (!empresaId) {
      return NextResponse.json({ error: 'Empresa não selecionada' }, { status: 400 });
    }

    const body = await request.json();
    const { remoteJid, text } = body;

    if (!remoteJid || !text) {
      return NextResponse.json({ error: 'remoteJid e text são obrigatórios' }, { status: 400 });
    }

    // Buscar instância da empresa
    const empresas = await query<{ id: number; nome: string; whatsapp_vinculado: string | null }>(
      'SELECT id, nome, whatsapp_vinculado FROM empresas WHERE id = $1',
      [empresaId]
    );

    if (!empresas.length || !empresas[0].whatsapp_vinculado) {
      return NextResponse.json({ error: 'WhatsApp não vinculado' }, { status: 400 });
    }

    const instanceName = `empresa_${empresas[0].id}_${sanitizeInstanceName(empresas[0].nome)}`;

    // Enviar mensagem via Evolution API
    const result = await sendText(instanceName, remoteJid, text);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    console.error('[Chat API] Erro ao enviar mensagem:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
