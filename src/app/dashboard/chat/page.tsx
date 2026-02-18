'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { ChatSidebar } from '@/components/dashboard/chat/chat-sidebar';
import { ChatThread } from '@/components/dashboard/chat/chat-thread';

interface ChatContact {
  remoteJid: string;
  pushName: string;
  profilePicUrl: string | null;
  unreadMessages: number;
  lastMessage: {
    messageTimestamp: number;
    fromMe: boolean;
    text: string;
  } | null;
  updatedAt: string | null;
}

interface ChatEvent {
  type: 'nova_mensagem' | 'contato_atualizado';
  mensagem?: {
    id: number;
    empresa_id: number;
    remote_jid: string;
    message_id: string;
    from_me: boolean;
    push_name: string | null;
    message_type: string;
    text: string | null;
    timestamp: number;
    status: string | null;
    has_media: boolean;
    media_type: string | null;
  };
  contato?: {
    empresa_id: number;
    remote_jid: string;
    push_name: string | null;
    profile_pic_url: string | null;
    last_message_text: string | null;
    last_message_timestamp: number | null;
    last_message_from_me: boolean | null;
    unread_count: number;
  };
}

function normalizeTelefone(telefone: string): string {
  return telefone.replace(/\D/g, '');
}

function findJidByTelefone(contacts: ChatContact[], telefone: string): string | null {
  const normalized = normalizeTelefone(telefone);
  if (!normalized) return null;

  const match = contacts.find((c) => {
    const jidNumber = c.remoteJid.replace('@s.whatsapp.net', '');
    return jidNumber === normalized 
      || jidNumber === `55${normalized}`
      || (normalized.startsWith('55') && jidNumber === normalized.substring(2));
  });

  return match?.remoteJid || null;
}

export default function ChatPage(): React.JSX.Element {
  const searchParams = useSearchParams();
  const telefoneParam = searchParams.get('telefone');
  
  const [contacts, setContacts] = React.useState<ChatContact[]>([]);
  const [selectedJid, setSelectedJid] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [autoSelected, setAutoSelected] = React.useState(false);

  // Ref para evitar duplicatas no SSE
  const eventSourceRef = React.useRef<EventSource | null>(null);
  // Ref para novo evento de mensagem — passado ao ChatThread
  const [lastChatEvent, setLastChatEvent] = React.useState<ChatEvent | null>(null);

  const fetchContacts = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('custom-auth-token');
      const response = await fetch('/api/chat/conversas', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao buscar conversas');
      }

      const data = await response.json();
      const chats = data.chats || [];
      setContacts(chats);
      setError(null);

      // Auto-selecionar contato pelo telefone da URL (apenas na primeira vez)
      if (telefoneParam && !autoSelected && chats.length > 0) {
        const jid = findJidByTelefone(chats, telefoneParam);
        if (jid) {
          setSelectedJid(jid);
          setAutoSelected(true);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar conversas');
    } finally {
      setLoading(false);
    }
  }, [telefoneParam, autoSelected]);

  // Fetch inicial + SSE para atualizações em tempo real
  React.useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Conectar ao SSE para receber eventos de chat em tempo real
  React.useEffect(() => {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) return;

    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let isCleanedUp = false;

    const connect = () => {
      if (isCleanedUp) return;

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource(`/api/chat/stream?token=${token}`);
      eventSourceRef.current = eventSource;

      eventSource.addEventListener('chat', (event) => {
        try {
          const chatEvent: ChatEvent = JSON.parse(event.data);

          if (chatEvent.type === 'contato_atualizado' && chatEvent.contato) {
            const c = chatEvent.contato;
            setContacts((prev) => {
              const existing = prev.find((x) => x.remoteJid === c.remote_jid);
              const updated: ChatContact = {
                remoteJid: c.remote_jid,
                pushName: c.push_name || existing?.pushName || c.remote_jid.split('@')[0] || 'Desconhecido',
                profilePicUrl: c.profile_pic_url || existing?.profilePicUrl || null,
                unreadMessages: c.unread_count,
                lastMessage: c.last_message_timestamp ? {
                  messageTimestamp: c.last_message_timestamp,
                  fromMe: c.last_message_from_me || false,
                  text: c.last_message_text || '',
                } : existing?.lastMessage || null,
                updatedAt: new Date().toISOString(),
              };

              const newList = prev.filter((x) => x.remoteJid !== c.remote_jid);
              newList.unshift(updated);
              return newList;
            });
          }

          // Repassar evento para o ChatThread
          if (chatEvent.type === 'nova_mensagem') {
            setLastChatEvent(chatEvent);
          }
        } catch (err) {
          console.error('[Chat SSE] Erro ao parsear evento:', err);
        }
      });

      eventSource.onerror = () => {
        eventSource.close();
        eventSourceRef.current = null;
        if (!isCleanedUp) {
          reconnectTimeout = setTimeout(connect, 5000);
        }
      };
    };

    connect();

    return () => {
      isCleanedUp = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  // Marcar como lido ao selecionar contato
  const handleSelectContact = React.useCallback((jid: string) => {
    setSelectedJid(jid);

    // Zerar unread no frontend
    setContacts((prev) =>
      prev.map((c) => c.remoteJid === jid ? { ...c, unreadMessages: 0 } : c)
    );

    // Zerar unread no backend
    const token = localStorage.getItem('custom-auth-token');
    fetch('/api/chat/conversas', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ remoteJid: jid }),
    }).catch(() => {});
  }, []);

  const selectedContact = contacts.find((c) => c.remoteJid === selectedJid) || null;

  const filteredContacts = contacts.filter((c) =>
    c.pushName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.remoteJid.includes(searchTerm)
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Chat WhatsApp</Typography>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - var(--MainNav-height, 56px))', overflow: 'hidden', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <ChatSidebar
        contacts={filteredContacts}
        selectedJid={selectedJid}
        onSelectContact={handleSelectContact}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {selectedJid && selectedContact ? (
        <ChatThread
          remoteJid={selectedJid}
          contact={selectedContact}
          lastChatEvent={lastChatEvent}
          onMessageSent={() => fetchContacts()}
        />
      ) : (
        <Box sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.default',
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              💬 Chat WhatsApp
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Selecione uma conversa para visualizar as mensagens
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
