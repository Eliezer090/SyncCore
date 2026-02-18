import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, getEmpresaIdParaQuery } from '@/lib/auth/middleware';
import { query } from '@/lib/db';
import { sendText, sanitizeInstanceName } from '@/lib/evolution-api';
import { chatEmitter } from '@/lib/chat-events';
import type { MensagemChat, ChatContato } from '@/types/database';

// POST /api/chat/enviar - Envia uma mensagem de texto via WhatsApp e salva no banco
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

    // Salvar mensagem enviada no banco local
    const messageId = result.data?.key?.id || `sent-${Date.now()}`;
    const timestamp = Math.floor(Date.now() / 1000);

    try {
      const savedRows = await query<MensagemChat>(
        `INSERT INTO mensagens_chat 
          (empresa_id, remote_jid, message_id, from_me, push_name, message_type, text, timestamp, status, has_media, media_type, media_url)
         VALUES ($1, $2, $3, true, null, 'conversation', $4, $5, 'sent', false, null, null)
         ON CONFLICT (empresa_id, message_id) DO NOTHING
         RETURNING *`,
        [empresaId, remoteJid, messageId, text, timestamp]
      );

      // Atualizar contato
      const contatoRows = await query<ChatContato>(
        `INSERT INTO chat_contatos 
          (empresa_id, remote_jid, last_message_text, last_message_timestamp, last_message_from_me, unread_count, atualizado_em)
         VALUES ($1, $2, $3, $4, true, 0, NOW())
         ON CONFLICT (empresa_id, remote_jid) DO UPDATE SET
           last_message_text = EXCLUDED.last_message_text,
           last_message_timestamp = EXCLUDED.last_message_timestamp,
           last_message_from_me = true,
           unread_count = 0,
           atualizado_em = NOW()
         RETURNING *`,
        [empresaId, remoteJid, text, timestamp]
      );

      // Emitir eventos SSE
      if (savedRows[0]) {
        chatEmitter.emitNovaMensagem(empresaId, savedRows[0]);
      }
      if (contatoRows[0]) {
        chatEmitter.emitContatoAtualizado(empresaId, contatoRows[0]);
      }
    } catch (dbErr) {
      console.error('[Chat API] Erro ao salvar mensagem enviada no DB:', dbErr);
      // Não falha — a mensagem foi enviada com sucesso via Evolution
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    console.error('[Chat API] Erro ao enviar mensagem:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
