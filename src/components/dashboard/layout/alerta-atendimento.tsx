'use client';

import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import { UserCircleIcon } from '@phosphor-icons/react/dist/ssr/UserCircle';
import { PhoneIcon } from '@phosphor-icons/react/dist/ssr/Phone';
import { keyframes } from '@mui/material/styles';

import { useNotificacoes } from '@/hooks/use-notificacoes';

// Animação de pulso
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.7);
  }
  70% {
    box-shadow: 0 0 0 20px rgba(255, 152, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0);
  }
`;

export function AlertaAtendimentoHumano(): React.JSX.Element {
  const { novaNotificacao, limparNovaNotificacao, marcarComoLida } = useNotificacoes();

  const handleClose = () => {
    limparNovaNotificacao();
  };

  const handleAtender = () => {
    if (novaNotificacao) {
      marcarComoLida(novaNotificacao.id);
    }
    limparNovaNotificacao();
    // Aqui você pode redirecionar para a tela de conversa do cliente
    // window.location.href = `/dashboard/conversas?cliente_id=${novaNotificacao?.cliente_id}`;
  };

  return (
    <Dialog
      open={Boolean(novaNotificacao)}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            overflow: 'visible',
          },
        },
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          },
        },
      }}
    >
      <DialogContent sx={{ pt: 4, pb: 3, px: 4 }}>
        <Stack spacing={3} alignItems="center">
          {/* Ícone com animação */}
          <Box
            sx={{
              position: 'relative',
              animation: `${pulse} 2s infinite`,
              borderRadius: '50%',
            }}
          >
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: 'warning.main',
                color: 'warning.contrastText',
              }}
            >
              <UserCircleIcon size={60} />
            </Avatar>
          </Box>

          {/* Título */}
          <Typography variant="h4" textAlign="center" fontWeight="bold">
            🔔 Atendimento Humano Solicitado!
          </Typography>

          {/* Informações do cliente */}
          <Box
            sx={{
              bgcolor: 'grey.100',
              borderRadius: 2,
              p: 3,
              width: '100%',
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <UserCircleIcon size={24} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Cliente
                  </Typography>
                  <Typography variant="h6">
                    {novaNotificacao?.cliente_nome || 'Nome não disponível'}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center">
                <PhoneIcon size={24} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Telefone
                  </Typography>
                  <Typography variant="body1">
                    {novaNotificacao?.cliente_telefone || 'Telefone não disponível'}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Box>

          {/* Mensagem */}
          <Typography variant="body1" color="text.secondary" textAlign="center">
            Este cliente deseja falar com um atendente humano.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 4, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          onClick={handleClose}
          size="large"
          sx={{ minWidth: 120 }}
        >
          Fechar
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={handleAtender}
          size="large"
          sx={{ minWidth: 160 }}
        >
          Atender Cliente
        </Button>
      </DialogActions>
    </Dialog>
  );
}
