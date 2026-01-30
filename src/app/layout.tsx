import * as React from 'react';
import type { Viewport } from 'next';

import '@/styles/global.css';

import { UserProvider } from '@/contexts/user-context';
import { LocalizationProvider } from '@/components/core/localization-provider';
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider';
import { DebugPermissoes } from '@/components/core/debug-permissoes';

export const viewport = { width: 'device-width', initialScale: 1 } satisfies Viewport;

// Força renderização dinâmica para toda a aplicação
export const dynamic = 'force-dynamic';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <html lang="en">
      <body>
        <LocalizationProvider>
          <UserProvider>
            <ThemeProvider>{children}</ThemeProvider>
            <DebugPermissoes />
          </UserProvider>
        </LocalizationProvider>
      </body>
    </html>
  );
}
