import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { chatEmitter } from '@/lib/chat-events';
import type { MensagemChat, ChatContato } from '@/types/database';

export const dynamic = 'force-dynamic';

/**
 * POST /api/chat/webhook
 * Chamado pelo N8N após processar a mensagem (IA já respondeu o cliente).
 * Salva a mensagem no banco local para exibição no dashboard.
 *
 * Fluxo: Evolution API → N8N (responde cliente) → SyncCore (salva no DB)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const event = body.event;
    const instance = body.instance;
    const data = body.data;

    // Apenas processar mensagens
    if (!event || !instance || !data) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Aceitar apenas eventos de mensagens
    const isMessageEvent = event === 'messages.upsert' || event === 'MESSAGES_UPSERT' || event === 'send.message' || event === 'SEND_MESSAGE';
    if (!isMessageEvent) {
      return NextResponse.json({ ok: true, skipped: true, event });
    }

    // Extrair empresa_id do instanceName: "empresa_{id}_{nome}"
    const empresaId = extractEmpresaId(instance);
    if (!empresaId) {
      console.warn('[Chat Webhook] Não foi possível extrair empresa_id de:', instance);
      return NextResponse.json({ ok: true, skipped: true, reason: 'invalid_instance' });
    }

    // Processar mensagem (pode ser um array ou objeto único)
    const messages = Array.isArray(data) ? data : [data];

    for (const msg of messages) {
      await processMessage(empresaId, msg);
    }

    return NextResponse.json({ ok: true, processed: messages.length });
  } catch (err) {
    console.error('[Chat Webhook] Erro:', err);
    return NextResponse.json({ ok: false, error: 'Erro interno' }, { status: 500 });
  }
}

function extractEmpresaId(instanceName: string): number | null {
  // instanceName = "empresa_1_NomeDaEmpresa"
  const match = instanceName.match(/^empresa_(\d+)_/);
  return match ? parseInt(match[1], 10) : null;
}

function extractMessageText(message: Record<string, unknown> | undefined): string {
  if (!message) return '';

  if (message.conversation) return message.conversation as string;
  if (message.extendedTextMessage) {
    const ext = message.extendedTextMessage as Record<string, unknown>;
    return (ext.text || '') as string;
  }
  if (message.imageMessage) {
    const img = message.imageMessage as Record<string, unknown>;
    return (img.caption || '📷 Imagem') as string;
  }
  if (message.videoMessage) {
    const vid = message.videoMessage as Record<string, unknown>;
    return (vid.caption || '🎥 Vídeo') as string;
  }
  if (message.audioMessage) return '🎵 Áudio';
  if (message.documentMessage) {
    const doc = message.documentMessage as Record<string, unknown>;
    return `📄 ${doc.fileName || 'Documento'}`;
  }
  if (message.stickerMessage) return '🏷️ Sticker';
  if (message.locationMessage) return '📍 Localização';
  if (message.contactMessage) {
    const contact = message.contactMessage as Record<string, unknown>;
    return `👤 ${contact.displayName || 'Contato'}`;
  }
  if (message.reactionMessage) {
    const reaction = message.reactionMessage as Record<string, unknown>;
    return (reaction.text || '😀') as string;
  }

  return '';
}

function getMediaInfo(message: Record<string, unknown> | undefined): { hasMedia: boolean; mediaType: string | null; mediaUrl: string | null } {
  if (!message) return { hasMedia: false, mediaType: null, mediaUrl: null };

  const mediaTypes: [string, string][] = [
    ['imageMessage', 'image'],
    ['videoMessage', 'video'],
    ['audioMessage', 'audio'],
    ['documentMessage', 'document'],
    ['stickerMessage', 'sticker'],
  ];

  for (const [key, type] of mediaTypes) {
    if (message[key]) {
      const mediaMsg = message[key] as Record<string, unknown>;
      return {
        hasMedia: true,
        mediaType: type,
        mediaUrl: (mediaMsg.url || mediaMsg.directPath || null) as string | null,
      };
    }
  }

  return { hasMedia: false, mediaType: null, mediaUrl: null };
}

async function processMessage(empresaId: number, msg: Record<string, unknown>): Promise<void> {
  try {
    const key = msg.key as Record<string, unknown> | undefined;
    if (!key) return;

    const remoteJid = (key.remoteJid || '') as string;
    const messageId = (key.id || '') as string;
    const fromMe = (key.fromMe || false) as boolean;

    // Ignorar mensagens de grupos e status
    if (!remoteJid.endsWith('@s.whatsapp.net') || remoteJid.startsWith('status@')) {
      return;
    }

    if (!messageId) return;

    const message = msg.message as Record<string, unknown> | undefined;
    const messageType = (msg.messageType || 'unknown') as string;
    const pushName = (msg.pushName || null) as string | null;
    const timestamp = Number(msg.messageTimestamp || Math.floor(Date.now() / 1000));
    const status = (msg.status || null) as string | null;
    const text = extractMessageText(message);
    const { hasMedia, mediaType, mediaUrl } = getMediaInfo(message);

    // Ignorar mensagens de reação e protocol
    if (messageType === 'protocolMessage' || messageType === 'reactionMessage') {
      return;
    }

    // Inserir mensagem (ON CONFLICT para evitar duplicatas)
    const result = await query<MensagemChat>(
      `INSERT INTO mensagens_chat 
        (empresa_id, remote_jid, message_id, from_me, push_name, message_type, text, timestamp, status, has_media, media_type, media_url, raw_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (empresa_id, message_id) DO UPDATE SET
         status = COALESCE(EXCLUDED.status, mensagens_chat.status),
         text = COALESCE(EXCLUDED.text, mensagens_chat.text)
       RETURNING *`,
      [empresaId, remoteJid, messageId, fromMe, pushName, messageType, text, timestamp, status, hasMedia, mediaType, mediaUrl, message ? JSON.stringify(message) : null]
    );

    const savedMsg = result[0];
    if (!savedMsg) return;

    // Atualizar (ou criar) contato
    const contato = await upsertContato(empresaId, remoteJid, pushName, text, timestamp, fromMe);

    // Emitir eventos SSE
    chatEmitter.emitNovaMensagem(empresaId, savedMsg);
    if (contato) {
      chatEmitter.emitContatoAtualizado(empresaId, contato);
    }
  } catch (err) {
    console.error('[Chat Webhook] Erro ao processar mensagem:', err);
  }
}

async function upsertContato(
  empresaId: number,
  remoteJid: string,
  pushName: string | null,
  lastText: string,
  timestamp: number,
  fromMe: boolean,
): Promise<ChatContato | null> {
  try {
    const rows = await query<ChatContato>(
      `INSERT INTO chat_contatos 
        (empresa_id, remote_jid, push_name, last_message_text, last_message_timestamp, last_message_from_me, unread_count, atualizado_em)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (empresa_id, remote_jid) DO UPDATE SET
         push_name = COALESCE(EXCLUDED.push_name, chat_contatos.push_name),
         last_message_text = EXCLUDED.last_message_text,
         last_message_timestamp = EXCLUDED.last_message_timestamp,
         last_message_from_me = EXCLUDED.last_message_from_me,
         unread_count = CASE 
           WHEN EXCLUDED.last_message_from_me THEN 0
           ELSE chat_contatos.unread_count + 1
         END,
         atualizado_em = NOW()
       RETURNING *`,
      [empresaId, remoteJid, pushName, lastText, timestamp, fromMe, fromMe ? 0 : 1]
    );

    return rows[0] || null;
  } catch (err) {
    console.error('[Chat Webhook] Erro ao upsert contato:', err);
    return null;
  }
}
