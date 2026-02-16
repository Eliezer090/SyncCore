import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, getEmpresaIdParaQuery } from '@/lib/auth/middleware';
import { query } from '@/lib/db';
import { fetchMessages, sanitizeInstanceName } from '@/lib/evolution-api';

// POST /api/chat/mensagens - Busca mensagens de um chat específico
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
    const { remoteJid, page = 1, offset = 50 } = body;

    if (!remoteJid) {
      return NextResponse.json({ error: 'remoteJid é obrigatório' }, { status: 400 });
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

    // Buscar mensagens via Evolution API
    const result = await fetchMessages(instanceName, remoteJid, page, offset);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    const messages = result.data?.messages?.records || [];

    // Transformar mensagens para formato mais simples
    const formattedMessages = messages.map((msg) => ({
      id: msg.key?.id || msg.id,
      fromMe: msg.key?.fromMe || false,
      remoteJid: msg.key?.remoteJid || remoteJid,
      participant: msg.key?.participant,
      messageType: msg.messageType || 'unknown',
      text: extractMessageText(msg.message),
      timestamp: msg.messageTimestamp,
      pushName: msg.pushName,
      status: msg.status,
      hasMedia: hasMedia(msg.message),
      mediaType: getMediaType(msg.message),
    }));

    // Reverter para ordem cronológica (mais antigo primeiro)
    formattedMessages.reverse();

    return NextResponse.json({
      messages: formattedMessages,
      total: result.data?.messages?.total || 0,
      page,
    });
  } catch (err) {
    console.error('[Chat API] Erro ao buscar mensagens:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
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

function hasMedia(message: Record<string, unknown> | undefined): boolean {
  if (!message) return false;
  return !!(message.imageMessage || message.videoMessage || message.audioMessage || message.documentMessage || message.stickerMessage);
}

function getMediaType(message: Record<string, unknown> | undefined): string | null {
  if (!message) return null;
  if (message.imageMessage) return 'image';
  if (message.videoMessage) return 'video';
  if (message.audioMessage) return 'audio';
  if (message.documentMessage) return 'document';
  if (message.stickerMessage) return 'sticker';
  return null;
}
