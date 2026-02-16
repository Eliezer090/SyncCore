'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { Robot as RobotIcon } from '@phosphor-icons/react/dist/ssr/Robot';
import { UserCircleIcon } from '@phosphor-icons/react/dist/ssr/UserCircle';
import { ChatCircleDots as ChatIcon } from '@phosphor-icons/react/dist/ssr/ChatCircleDots';

import { getAuthHeaders } from '@/lib/auth/client';
import { paths } from '@/paths';

interface ConversaManual {
  cliente_id: number;
  cliente_nome: string | null;
  cliente_telefone: string;
  empresa_id: number;
  ia_ativa: boolean;
}

interface ManualConversasPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

export function ManualConversasPopover({ anchorEl, open, onClose }: ManualConversasPopoverProps): React.JSX.Element {
  const router = useRouter();
  const [conversas, setConversas] = React.useState<ConversaManual[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [transferindo, setTransferindo] = React.useState<number | null>(null);

  const fetchConversas = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chat/conversas-manuais', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) return;

      const data = await response.json();
      setConversas(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar conversas manuais:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar quando abrir o popover
  React.useEffect(() => {
    if (open) {
      fetchConversas();
    }
  }, [open, fetchConversas]);

  const handleTransferirParaIA = async (clienteId: number) => {
    try {
      setTransferindo(clienteId);
      const response = await fetch(`/api/clientes/${clienteId}/ia-ativa`, {
        method: 'PATCH',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ ia_ativa: true }),
      });

      if (response.ok) {
        // Remover da lista local
        setConversas((prev) => prev.filter((c) => c.cliente_id !== clienteId));
      }
    } catch (error) {
      console.error('Erro ao transferir para IA:', error);
    } finally {
      setTransferindo(null);
    }
  };

  const handleAbrirChat = (telefone: string) => {
    onClose();
    router.push(`${paths.dashboard.chat}?telefone=${encodeURIComponent(telefone)}`);
  };

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { width: 400, maxHeight: 500 },
        },
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <ChatIcon size={20} weight="fill" color="var(--mui-palette-warning-main)" />
            <Typography variant="h6">Atendimento Manual</Typography>
          </Stack>
          {conversas.length > 0 && (
            <Chip label={`${conversas.length} conversa${conversas.length > 1 ? 's' : ''}`} color="warning" size="small" />
          )}
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Conversas onde a IA está desativada
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress size={24} />
        </Box>
      ) : conversas.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <RobotIcon size={40} weight="light" style={{ opacity: 0.4 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Nenhuma conversa em modo manual
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Todas as conversas estão sendo atendidas pela IA
          </Typography>
        </Box>
      ) : (
        <List sx={{ maxHeight: 380, overflow: 'auto', p: 0 }}>
          {conversas.map((conversa, index) => (
            <React.Fragment key={conversa.cliente_id}>
              {index > 0 && <Divider />}
              <ListItem
                sx={{
                  py: 1.5,
                  px: 2,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Box sx={{ mr: 1.5, color: 'warning.main' }}>
                  <UserCircleIcon size={36} />
                </Box>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" noWrap sx={{ maxWidth: 140 }}>
                      {conversa.cliente_nome || 'Cliente'}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {conversa.cliente_telefone}
                    </Typography>
                  }
                />
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Abrir conversa">
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={() => handleAbrirChat(conversa.cliente_telefone)}
                      sx={{ minWidth: 0, px: 1 }}
                    >
                      <ChatIcon size={18} />
                    </Button>
                  </Tooltip>
                  <Tooltip title="Transferir para IA">
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => handleTransferirParaIA(conversa.cliente_id)}
                      disabled={transferindo === conversa.cliente_id}
                      sx={{ minWidth: 0, px: 1 }}
                    >
                      {transferindo === conversa.cliente_id ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <RobotIcon size={18} weight="bold" />
                      )}
                    </Button>
                  </Tooltip>
                </Stack>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}
    </Popover>
  );
}
