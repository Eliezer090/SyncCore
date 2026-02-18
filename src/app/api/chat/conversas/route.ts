import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, getEmpresaIdParaQuery } from '@/lib/auth/middleware';
import { query, execute } from '@/lib/db';
import type { ChatContato } from '@/types/database';

// GET /api/chat/conversas - Lista todas as conversas do banco local
export async function GET(request: NextRequest) {
  try {
    const { user, error } = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    const empresaId = getEmpresaIdParaQuery(user);
    if (!empresaId) {
      return NextResponse.json({ error: 'Empresa não selecionada' }, { status: 400 });
    }

    // Buscar contatos/conversas do banco local, ordenados por última mensagem
    const contatos = await query<ChatContato>(
      `SELECT * FROM chat_contatos 
       WHERE empresa_id = $1
       ORDER BY last_message_timestamp DESC NULLS LAST`,
      [empresaId]
    );

    // Converter para formato esperado pelo frontend
    const chats = contatos.map((c) => ({
      remoteJid: c.remote_jid,
      pushName: c.push_name || c.remote_jid.split('@')[0] || 'Desconhecido',
      profilePicUrl: c.profile_pic_url || null,
      unreadMessages: c.unread_count || 0,
      lastMessage: c.last_message_timestamp ? {
        messageTimestamp: c.last_message_timestamp,
        fromMe: c.last_message_from_me || false,
        text: c.last_message_text || '',
      } : null,
      updatedAt: c.atualizado_em?.toISOString() || null,
    }));

    return NextResponse.json({ chats });
  } catch (err) {
    console.error('[Chat API] Erro ao buscar conversas:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// PUT /api/chat/conversas - Marcar conversa como lida (zerar unread_count)
export async function PUT(request: NextRequest) {
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
    const { remoteJid } = body;

    if (!remoteJid) {
      return NextResponse.json({ error: 'remoteJid é obrigatório' }, { status: 400 });
    }

    await execute(
      `UPDATE chat_contatos SET unread_count = 0, atualizado_em = NOW()
       WHERE empresa_id = $1 AND remote_jid = $2`,
      [empresaId, remoteJid]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Chat API] Erro ao marcar como lida:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
