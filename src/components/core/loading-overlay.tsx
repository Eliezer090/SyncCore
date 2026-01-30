'use client';

import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

interface LoadingOverlayProps {
  open: boolean;
  message?: string;
}

export function LoadingOverlay({ open, message = 'Carregando...' }: LoadingOverlayProps): React.JSX.Element {
  return (
    <Backdrop
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(4px)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 1,
      }}
      open={open}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          p: 3,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <CircularProgress
          size={48}
          thickness={4}
          sx={{
            color: 'primary.main',
          }}
        />
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          {message}
        </Typography>
      </Box>
    </Backdrop>
  );
}

// Versão fullscreen para uso em páginas inteiras
interface FullPageLoadingProps {
  message?: string;
}

export function FullPageLoading({ message = 'Carregando...' }: FullPageLoadingProps): React.JSX.Element {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        zIndex: (theme) => theme.zIndex.modal + 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          p: 4,
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: 6,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'inline-flex',
          }}
        >
          <CircularProgress
            size={64}
            thickness={4}
            sx={{
              color: 'primary.main',
            }}
          />
          <CircularProgress
            size={64}
            thickness={4}
            sx={{
              color: 'primary.light',
              position: 'absolute',
              left: 0,
              animationDuration: '1.5s',
              opacity: 0.3,
            }}
          />
        </Box>
        <Typography
          variant="h6"
          color="text.primary"
          sx={{ fontWeight: 600 }}
        >
          {message}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          Por favor, aguarde...
        </Typography>
      </Box>
    </Box>
  );
}
