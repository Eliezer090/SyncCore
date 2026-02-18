import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, getEmpresaIdParaQuery } from '@/lib/auth/middleware';
import { query } from '@/lib/db';
import type { MensagemChat } from '@/types/database';

// POST /api/chat/mensagens - Busca mensagens de um chat do banco local
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
    const { remoteJid, limit = 100, before } = body;

    if (!remoteJid) {
      return NextResponse.json({ error: 'remoteJid é obrigatório' }, { status: 400 });
    }

    // Buscar mensagens do banco local — ordem cronológica (mais antigo primeiro)
    let sql: string;
    let params: unknown[];

    if (before) {
      // Paginação: mensagens antes de um timestamp
      sql = `SELECT * FROM mensagens_chat 
             WHERE empresa_id = $1 AND remote_jid = $2 AND timestamp < $3
             ORDER BY timestamp DESC 
             LIMIT $4`;
      params = [empresaId, remoteJid, before, limit];
    } else {
      // Últimas N mensagens
      sql = `SELECT * FROM mensagens_chat 
             WHERE empresa_id = $1 AND remote_jid = $2
             ORDER BY timestamp DESC 
             LIMIT $3`;
      params = [empresaId, remoteJid, limit];
    }

    const rows = await query<MensagemChat>(sql, params);

    // Reverter para ordem cronológica (mais antigo primeiro)
    rows.reverse();

    // Formatar para o frontend
    const messages = rows.map((msg) => ({
      id: msg.message_id,
      fromMe: msg.from_me,
      remoteJid: msg.remote_jid,
      messageType: msg.message_type,
      text: msg.text || '',
      timestamp: msg.timestamp,
      pushName: msg.push_name,
      status: msg.status,
      hasMedia: msg.has_media,
      mediaType: msg.media_type,
    }));

    // Contar total
    const countResult = await query<{ total: string }>(
      'SELECT COUNT(*) as total FROM mensagens_chat WHERE empresa_id = $1 AND remote_jid = $2',
      [empresaId, remoteJid]
    );
    const total = parseInt(countResult[0]?.total || '0', 10);

    return NextResponse.json({ messages, total });
  } catch (err) {
    console.error('[Chat API] Erro ao buscar mensagens:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
