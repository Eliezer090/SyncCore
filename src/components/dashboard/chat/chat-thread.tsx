'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { PaperPlaneTilt as SendIcon } from '@phosphor-icons/react/dist/ssr/PaperPlaneTilt';
import { ArrowLeft as BackIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { Robot as RobotIcon } from '@phosphor-icons/react/dist/ssr/Robot';
import { UserCircle as UserIcon } from '@phosphor-icons/react/dist/ssr/UserCircle';

interface ChatMessage {
  id: string;
  fromMe: boolean;
  remoteJid: string;
  participant?: string;
  messageType: string;
  text: string;
  timestamp: number;
  pushName?: string;
  status?: string;
  hasMedia: boolean;
  mediaType: string | null;
}

interface ChatContact {
  remoteJid: string;
  pushName: string;
  profilePicUrl: string | null;
  unreadMessages: number;
  lastMessage: unknown;
  updatedAt: string | null;
}

interface ChatThreadProps {
  remoteJid: string;
  contact: ChatContact;
  onMessageSent?: () => void;
}

function formatTime(ts: number | undefined): string {
  if (!ts) return '';
  const date = new Date(ts * 1000);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDateSeparator(ts: number): string {
  const date = new Date(ts * 1000);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return 'Hoje';
  if (isYesterday) return 'Ontem';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');
}

function formatPhoneNumber(jid: string): string {
  const number = jid.replace('@s.whatsapp.net', '');
  if (number.length === 13 && number.startsWith('55')) {
    const ddd = number.substring(2, 4);
    const part1 = number.substring(4, 9);
    const part2 = number.substring(9);
    return `(${ddd}) ${part1}-${part2}`;
  }
  return number;
}

export function ChatThread({ remoteJid, contact, onMessageSent }: ChatThreadProps): React.JSX.Element {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const [inputText, setInputText] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);

  // Estado da IA para este contato
  const [iaStatus, setIaStatus] = React.useState<{ found: boolean; ia_ativa: boolean; cliente_id: number | null }>({ found: false, ia_ativa: true, cliente_id: null });
  const [iaLoading, setIaLoading] = React.useState(true);
  const [iaToggling, setIaToggling] = React.useState(false);

  // Buscar status da IA para este contato
  const fetchIaStatus = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('custom-auth-token');
      const response = await fetch('/api/chat/ia-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ telefone: remoteJid }),
      });

      if (response.ok) {
        const data = await response.json();
        setIaStatus({ found: data.found, ia_ativa: data.ia_ativa ?? true, cliente_id: data.cliente_id ?? null });
      }
    } catch (err) {
      console.error('Erro ao buscar status IA:', err);
    } finally {
      setIaLoading(false);
    }
  }, [remoteJid]);

  React.useEffect(() => {
    setIaLoading(true);
    fetchIaStatus();
  }, [fetchIaStatus]);

  // Transferir atendimento para IA
  const handleTransferirParaIA = async () => {
    if (!iaStatus.cliente_id) return;
    try {
      setIaToggling(true);
      const token = localStorage.getItem('custom-auth-token');
      const response = await fetch(`/api/clientes/${iaStatus.cliente_id}/ia-ativa`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ia_ativa: true }),
      });

      if (response.ok) {
        setIaStatus((prev) => ({ ...prev, ia_ativa: true }));
      }
    } catch (err) {
      console.error('Erro ao transferir para IA:', err);
    } finally {
      setIaToggling(false);
    }
  };

  // Assumir atendimento (desativar IA)
  const handleAssumirAtendimento = async () => {
    if (!iaStatus.cliente_id) return;
    try {
      setIaToggling(true);
      const token = localStorage.getItem('custom-auth-token');
      const response = await fetch(`/api/clientes/${iaStatus.cliente_id}/ia-ativa`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ia_ativa: false }),
      });

      if (response.ok) {
        setIaStatus((prev) => ({ ...prev, ia_ativa: false }));
      }
    } catch (err) {
      console.error('Erro ao assumir atendimento:', err);
    } finally {
      setIaToggling(false);
    }
  };

  const fetchMessages = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('custom-auth-token');
      const response = await fetch('/api/chat/mensagens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ remoteJid, page: 1, offset: 100 }),
      });

      if (!response.ok) {
        console.error('Erro ao buscar mensagens');
        return;
      }

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Erro ao buscar mensagens:', err);
    } finally {
      setLoading(false);
    }
  }, [remoteJid]);

  React.useEffect(() => {
    setLoading(true);
    setMessages([]);
    fetchMessages();

    // Poll a cada 5 segundos para novas mensagens
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Scroll automático para última mensagem
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    setSending(true);
    setInputText('');

    // Adicionar mensagem otimisticamente
    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      fromMe: true,
      remoteJid,
      messageType: 'conversation',
      text,
      timestamp: Math.floor(Date.now() / 1000),
      status: 'sending',
      hasMedia: false,
      mediaType: null,
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      const token = localStorage.getItem('custom-auth-token');
      const response = await fetch('/api/chat/enviar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ remoteJid, text }),
      });

      if (!response.ok) {
        // Marcar como erro
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempMessage.id ? { ...m, status: 'error' } : m
          )
        );
        return;
      }

      // Atualizar lista
      if (onMessageSent) onMessageSent();

      // Recarregar mensagens após envio
      setTimeout(fetchMessages, 1000);
    } catch (err) {
      console.error('Erro ao enviar:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempMessage.id ? { ...m, status: 'error' } : m
        )
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Agrupar mensagens por dia
  const getDateKey = (ts: number) => new Date(ts * 1000).toDateString();

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Header do chat */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Botão voltar (mobile) */}
        <IconButton
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          onClick={() => window.history.back()}
        >
          <BackIcon />
        </IconButton>

        <Avatar src={contact.profilePicUrl || undefined} sx={{ width: 40, height: 40 }}>
          {getInitials(contact.pushName)}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {contact.pushName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatPhoneNumber(remoteJid)}
          </Typography>
        </Box>

        {/* Botão de toggle IA no header */}
        {!iaLoading && iaStatus.found && (
          iaStatus.ia_ativa ? (
            <Button
              size="small"
              variant="outlined"
              color="warning"
              startIcon={<UserIcon size={16} />}
              onClick={handleAssumirAtendimento}
              disabled={iaToggling}
              sx={{ textTransform: 'none', fontSize: '0.75rem' }}
            >
              {iaToggling ? <CircularProgress size={14} /> : 'Assumir'}
            </Button>
          ) : (
            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<RobotIcon size={16} weight="bold" />}
              onClick={handleTransferirParaIA}
              disabled={iaToggling}
              sx={{ textTransform: 'none', fontSize: '0.75rem' }}
            >
              {iaToggling ? <CircularProgress size={14} color="inherit" /> : 'Retomar IA'}
            </Button>
          )
        )}
      </Box>

      {/* Banner de status do atendimento */}
      {!iaLoading && iaStatus.found && !iaStatus.ia_ativa && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            px: 2,
            py: 1,
            bgcolor: 'warning.main',
            color: 'warning.contrastText',
          }}
        >
          <UserIcon size={18} weight="bold" />
          <Typography variant="body2" fontWeight="bold">
            Atendimento Humano Ativo — IA desativada para esta conversa
          </Typography>
        </Box>
      )}

      {!iaLoading && iaStatus.found && iaStatus.ia_ativa && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            px: 2,
            py: 0.5,
            bgcolor: 'success.light',
            color: 'success.contrastText',
          }}
        >
          <RobotIcon size={16} weight="bold" />
          <Typography variant="caption" fontWeight="medium">
            IA respondendo esta conversa
          </Typography>
        </Box>
      )}

      {/* Área de mensagens */}
      <Box
        ref={messagesContainerRef}
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          bgcolor: '#efeae2',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23c8c3b8\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Nenhuma mensagem encontrada
            </Typography>
          </Box>
        ) : (
          <>
            {messages.map((msg, index) => {
              // Separador de data
              const showDate = index === 0 || getDateKey(msg.timestamp) !== getDateKey(messages[index - 1].timestamp);

              return (
                <React.Fragment key={msg.id}>
                  {showDate && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.85)',
                          px: 2,
                          py: 0.5,
                          borderRadius: 2,
                          boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                        }}
                      >
                        {formatDateSeparator(msg.timestamp)}
                      </Typography>
                    </Box>
                  )}

                  {/* Balão de mensagem */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: msg.fromMe ? 'flex-end' : 'flex-start',
                      mb: 0.3,
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '65%',
                        bgcolor: msg.fromMe ? '#d9fdd3' : '#ffffff',
                        borderRadius: 2,
                        px: 1.5,
                        py: 0.8,
                        boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                        position: 'relative',
                        ...(msg.status === 'error' && { border: '1px solid', borderColor: 'error.main' }),
                      }}
                    >
                      {/* Indicador de mídia */}
                      {msg.hasMedia && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          {msg.mediaType === 'image' && '📷 '}
                          {msg.mediaType === 'video' && '🎥 '}
                          {msg.mediaType === 'audio' && '🎵 '}
                          {msg.mediaType === 'document' && '📄 '}
                          {msg.mediaType === 'sticker' && '🏷️ '}
                        </Typography>
                      )}

                      {/* Texto da mensagem */}
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          lineHeight: 1.4,
                        }}
                      >
                        {msg.text || (msg.hasMedia ? `[${msg.mediaType || 'Mídia'}]` : '[Mensagem não suportada]')}
                      </Typography>

                      {/* Horário e status */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          gap: 0.5,
                          mt: 0.2,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                          {formatTime(msg.timestamp)}
                        </Typography>
                        {msg.fromMe && (
                          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: msg.status === 'error' ? 'error.main' : msg.status === 'sending' ? 'text.disabled' : 'primary.main' }}>
                            {msg.status === 'error' ? '✗' : msg.status === 'sending' ? '🕐' : '✓✓'}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Input de mensagem */}
      <Divider />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1.5,
          bgcolor: 'background.paper',
        }}
      >
        <TextField
          fullWidth
          size="small"
          multiline
          maxRows={4}
          placeholder="Digite uma mensagem..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: '#f0f2f5',
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleSend}
                  disabled={!inputText.trim() || sending}
                  color="primary"
                  size="small"
                >
                  {sending ? <CircularProgress size={20} /> : <SendIcon weight="fill" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Box>
  );
}
