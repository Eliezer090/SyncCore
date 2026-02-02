'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { CheckIcon } from '@phosphor-icons/react/dist/ssr/Check';
import { XIcon } from '@phosphor-icons/react/dist/ssr/X';
import { UserCircleIcon } from '@phosphor-icons/react/dist/ssr/UserCircle';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';

import { useNotificacoes } from '@/hooks/use-notificacoes';

dayjs.extend(relativeTime);
dayjs.locale('pt-br');

interface NotificationPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

export function NotificationPopover({ anchorEl, open, onClose }: NotificationPopoverProps): React.JSX.Element {
  const { notificacoes, naoLidas, loading, marcarComoLida, excluirNotificacao } = useNotificacoes();

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { width: 380, maxHeight: 480 },
        },
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Notificações</Typography>
          {naoLidas > 0 && (
            <Chip label={`${naoLidas} não lidas`} color="error" size="small" />
          )}
        </Stack>
      </Box>

      {loading ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">Carregando...</Typography>
        </Box>
      ) : notificacoes.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">Nenhuma notificação</Typography>
        </Box>
      ) : (
        <List sx={{ maxHeight: 380, overflow: 'auto', p: 0 }}>
          {notificacoes.map((notificacao, index) => (
            <React.Fragment key={notificacao.id}>
              {index > 0 && <Divider />}
              <ListItem
                sx={{
                  bgcolor: notificacao.lida ? 'transparent' : 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' },
                }}
                secondaryAction={
                  <Stack direction="row" spacing={0.5}>
                    {!notificacao.lida && (
                      <Tooltip title="Marcar como lida">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            marcarComoLida(notificacao.id);
                          }}
                        >
                          <CheckIcon size={16} />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          excluirNotificacao(notificacao.id);
                        }}
                      >
                        <XIcon size={16} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                }
              >
                <Box sx={{ mr: 1.5, color: notificacao.tipo === 'atendimento_humano' ? 'warning.main' : 'primary.main' }}>
                  <UserCircleIcon size={32} />
                </Box>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle2" noWrap sx={{ maxWidth: 180 }}>
                        {notificacao.cliente_nome || notificacao.cliente_telefone || 'Cliente'}
                      </Typography>
                      {notificacao.tipo === 'atendimento_humano' && (
                        <Chip label="Atendimento" size="small" color="warning" sx={{ height: 20, fontSize: '0.65rem' }} />
                      )}
                    </Stack>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        {notificacao.mensagem}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {dayjs(notificacao.criada_em).fromNow()}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}
    </Popover>
  );
}
