import * as React from 'react';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { paths } from '@/paths';

export interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <Box
      sx={{
        display: { xs: 'flex', lg: 'grid' },
        flexDirection: 'column',
        gridTemplateColumns: '1fr 1fr',
        minHeight: '100%',
      }}
    >
      <Box sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
        <Box sx={{ p: 3 }}>
          <Box component={RouterLink} href={paths.home} sx={{ display: 'inline-block', fontSize: 0 }}>
            <Box
              component="img"
              alt="SyncCore"
              src="/assets/synccore-logo.png"
              sx={{ height: 40, width: 'auto' }}
            />
          </Box>
        </Box>
        <Box sx={{ alignItems: 'center', display: 'flex', flex: '1 1 auto', justifyContent: 'center', p: 3 }}>
          <Box sx={{ maxWidth: '450px', width: '100%' }}>{children}</Box>
        </Box>
      </Box>
      <Box
        sx={{
          alignItems: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%)',
          color: 'var(--mui-palette-text-primary)',
          display: { xs: 'none', lg: 'flex' },
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Stack spacing={4} sx={{ alignItems: 'center', maxWidth: '600px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box
              component="img"
              alt="SyncCore"
              src="/assets/synccore-logo.png"
              sx={{ height: 'auto', width: '100%', maxWidth: '300px' }}
            />
          </Box>
          <Stack spacing={2}>
            
            <Typography 
              align="center" 
              sx={{ 
                fontSize: '18px', 
                fontWeight: 400, 
                color: '#666',
                fontStyle: 'italic'
              }}
            >
              Gestão inteligente em cada detalhe
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
