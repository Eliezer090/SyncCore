import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, getEmpresaIdParaQuery } from '@/lib/auth/middleware';
import { query } from '@/lib/db';
import { fetchChats, sanitizeInstanceName } from '@/lib/evolution-api';

// GET /api/chat/conversas - Lista todas as conversas da instância WhatsApp da empresa
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

    // Buscar dados da empresa para montar o instanceName
    const empresas = await query<{ id: number; nome: string; whatsapp_vinculado: string | null }>(
      'SELECT id, nome, whatsapp_vinculado FROM empresas WHERE id = $1',
      [empresaId]
    );

    if (!empresas.length) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    }

    const empresa = empresas[0];
    if (!empresa.whatsapp_vinculado) {
      return NextResponse.json({ error: 'WhatsApp não vinculado a esta empresa' }, { status: 400 });
    }

    const instanceName = `empresa_${empresa.id}_${sanitizeInstanceName(empresa.nome)}`;

    // Buscar conversas via Evolution API
    const result = await fetchChats(instanceName);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Filtrar apenas chats de pessoas (não grupos, status, etc.)
    const chats = (result.data || [])
      .filter((chat) => {
        const jid = chat.remoteJid || '';
        return jid.endsWith('@s.whatsapp.net') && !jid.startsWith('status@');
      })
      .map((chat) => ({
        remoteJid: chat.remoteJid,
        pushName: chat.pushName || chat.remoteJid?.split('@')[0] || 'Desconhecido',
        profilePicUrl: chat.profilePicUrl || null,
        unreadMessages: chat.unreadMessages || 0,
        lastMessage: chat.lastMessage ? {
          messageType: chat.lastMessage.messageType,
          messageTimestamp: chat.lastMessage.messageTimestamp,
          pushName: chat.lastMessage.pushName,
          fromMe: chat.lastMessage.key?.fromMe || false,
          text: extractMessageText(chat.lastMessage.message),
        } : null,
        updatedAt: chat.updatedAt || null,
      }))
      .sort((a, b) => {
        const tsA = a.lastMessage?.messageTimestamp || 0;
        const tsB = b.lastMessage?.messageTimestamp || 0;
        return tsB - tsA;
      });

    return NextResponse.json({ chats, instanceName });
  } catch (err) {
    console.error('[Chat API] Erro ao buscar conversas:', err);
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
  if (message.imageMessage) return '📷 Imagem';
  if (message.videoMessage) return '🎥 Vídeo';
  if (message.audioMessage) return '🎵 Áudio';
  if (message.documentMessage) {
    const doc = message.documentMessage as Record<string, unknown>;
    return `📄 ${doc.fileName || 'Documento'}`;
  }
  if (message.stickerMessage) return '🏷️ Sticker';
  if (message.locationMessage) return '📍 Localização';
  if (message.contactMessage) return '👤 Contato';
  if (message.reactionMessage) return '😀 Reação';
  
  return '';
}
