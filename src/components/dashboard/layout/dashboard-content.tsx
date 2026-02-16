'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

// Rotas que devem ocupar tela inteira (sem Container/padding)
const FULLSCREEN_ROUTES = ['/dashboard/chat'];

interface DashboardContentProps {
  children: React.ReactNode;
}

export function DashboardContent({ children }: DashboardContentProps): React.JSX.Element {
  const pathname = usePathname();
  const isFullscreen = FULLSCREEN_ROUTES.some((route) => pathname.startsWith(route));

  if (isFullscreen) {
    return (
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {children}
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: '64px' }}>
      {children}
    </Container>
  );
}
