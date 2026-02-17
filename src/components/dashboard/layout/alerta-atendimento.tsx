'use client';
 
import * as React from 'react';
import { useRouter } from 'next/navigation';
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import { UserCircleIcon } from '@phosphor-icons/react/dist/ssr/UserCircle';
import { PhoneIcon } from '@phosphor-icons/react/dist/ssr/Phone';
import { XIcon } from '@phosphor-icons/react/dist/ssr/X';
import { keyframes } from '@mui/material/styles';

import { useNotificacoes } from '@/hooks/use-notificacoes';
import { paths } from '@/paths';

// Animação de pulso
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.7);
  }
  70% {
    box-shadow: 0 0 0 12px rgba(255, 152, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0);
  }
`;

// Animação de entrada deslizando da direita
const slideIn = keyframes`
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`;

export function AlertaAtendimentoHumano(): React.JSX.Element {
  const router = useRouter();
  const { novaNotificacao, limparNovaNotificacao, marcarComoLida } = useNotificacoes();

  const handleClose = () => {
    limparNovaNotificacao();
  };

  const handleAtender = () => {
    if (novaNotificacao) {
      marcarComoLida(novaNotificacao.id);
      const telefone = novaNotificacao.cliente_telefone;
      if (telefone) {
        router.push(`${paths.dashboard.chat}?telefone=${encodeURIComponent(telefone)}`);
      } else {
        router.push(paths.dashboard.chat);
      }
    }
    limparNovaNotificacao();
  };

  return (
    <Snackbar
      open={Boolean(novaNotificacao)}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      onClose={handleClose}
      sx={{ 
        top: { xs: '16px', sm: '24px' },
        right: { xs: '16px', sm: '24px' },
        maxWidth: 400,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 2.5,
          borderRadius: 2,
          borderLeft: '4px solid',
          borderLeftColor: 'warning.main',
          animation: `${slideIn} 0.4s ease-out`,
          minWidth: 320,
          maxWidth: 400,
        }}
      >
        <Stack spacing={2}>
          {/* Header com ícone e botão fechar */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  animation: `${pulse} 2s infinite`,
                  borderRadius: '50%',
                  display: 'flex',
                }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'warning.main',
                    color: 'warning.contrastText',
                  }}
                >
                  <UserCircleIcon size={24} />
                </Avatar>
              </Box>
              <Typography variant="subtitle1" fontWeight="bold">
                🔔 Novo Atendimento Requerido
              </Typography>
            </Stack>
            <IconButton size="small" onClick={handleClose} sx={{ ml: 1 }}>
              <XIcon size={18} />
            </IconButton>
          </Stack>

          {/* Info do cliente */}
          <Box
            sx={{
              bgcolor: 'grey.50',
              borderRadius: 1.5,
              p: 1.5,
            }}
          >
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <UserCircleIcon size={18} />
                <Typography variant="body2" fontWeight={500}>
                  {novaNotificacao?.cliente_nome || 'Nome não disponível'}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <PhoneIcon size={18} />
                <Typography variant="body2" color="text.secondary">
                  {novaNotificacao?.cliente_telefone || 'Telefone não disponível'}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          {/* Mensagem */}
          <Typography variant="body2" color="text.secondary">
            Este cliente deseja falar com um atendente humano.
          </Typography>

          {/* Ações */}
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              size="small"
              onClick={handleClose}
            >
              Dispensar
            </Button>
            <Button
              variant="contained"
              color="warning"
              size="small"
              onClick={handleAtender}
            >
              Atender
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Snackbar>
  );
}
