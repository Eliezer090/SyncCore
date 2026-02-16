'use client';

import * as React from 'react';
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
    messageType: string;
    messageTimestamp: number;
    pushName: string;
    fromMe: boolean;
    text: string;
  } | null;
  updatedAt: string | null;
}

export default function ChatPage(): React.JSX.Element {
  const [contacts, setContacts] = React.useState<ChatContact[]>([]);
  const [selectedJid, setSelectedJid] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

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
      setContacts(data.chats || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar conversas');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchContacts();
    // Atualizar a cada 15 segundos
    const interval = setInterval(fetchContacts, 15000);
    return () => clearInterval(interval);
  }, [fetchContacts]);

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
    <Box sx={{ display: 'flex', height: 'calc(100vh - 120px)', overflow: 'hidden', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      {/* Sidebar com lista de conversas */}
      <ChatSidebar
        contacts={filteredContacts}
        selectedJid={selectedJid}
        onSelectContact={(jid) => setSelectedJid(jid)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Thread de mensagens */}
      {selectedJid && selectedContact ? (
        <ChatThread
          remoteJid={selectedJid}
          contact={selectedContact}
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
