'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { MagnifyingGlass as SearchIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

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

interface ChatSidebarProps {
  contacts: ChatContact[];
  selectedJid: string | null;
  onSelectContact: (jid: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
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

function formatTimestamp(ts: number | undefined): string {
  if (!ts) return '';
  const date = new Date(ts * 1000);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Ontem';
  }

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');
}

export function ChatSidebar({
  contacts,
  selectedJid,
  onSelectContact,
  searchTerm,
  onSearchChange,
}: ChatSidebarProps): React.JSX.Element {
  return (
    <Box
      sx={{
        width: { xs: selectedJid ? 0 : '100%', md: 360 },
        display: { xs: selectedJid ? 'none' : 'flex', md: 'flex' },
        flexDirection: 'column',
        borderRight: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Conversas
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar conversa..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ mt: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="var(--icon-fontSize-md)" />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Divider />

      {/* Lista de contatos */}
      <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
        {contacts.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
            </Typography>
          </Box>
        ) : (
          contacts.map((contact) => (
            <ListItemButton
              key={contact.remoteJid}
              selected={selectedJid === contact.remoteJid}
              onClick={() => onSelectContact(contact.remoteJid)}
              sx={{
                py: 1.5,
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                },
              }}
            >
              <ListItemAvatar>
                <Badge
                  badgeContent={contact.unreadMessages}
                  color="primary"
                  max={99}
                  invisible={!contact.unreadMessages}
                >
                  <Avatar
                    src={contact.profilePicUrl || undefined}
                    sx={{ width: 48, height: 48 }}
                  >
                    {getInitials(contact.pushName)}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" noWrap sx={{ maxWidth: 180 }}>
                      {contact.pushName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimestamp(contact.lastMessage?.messageTimestamp)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      noWrap
                      sx={{ maxWidth: 200 }}
                    >
                      {contact.lastMessage?.fromMe ? '✓ ' : ''}
                      {contact.lastMessage?.text || formatPhoneNumber(contact.remoteJid)}
                    </Typography>
                  </Box>
                }
              />
            </ListItemButton>
          ))
        )}
      </List>
    </Box>
  );
}
