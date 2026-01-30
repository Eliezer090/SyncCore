'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import { paths } from '@/paths';
import { logger } from '@/lib/default-logger';
import { useUser } from '@/hooks/use-user';
import { SetupEmpresaModal } from './setup-empresa-modal';

export interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps): React.JSX.Element | null {
  const router = useRouter();
  const { user, error, isLoading } = useUser();
  const [isChecking, setIsChecking] = React.useState<boolean>(true);
  const [showSetupEmpresa, setShowSetupEmpresa] = React.useState<boolean>(false);

  const checkPermissions = async (): Promise<void> => {
    if (isLoading) {
      return;
    }

    if (error) {
      setIsChecking(false);
      return;
    }

    if (!user) {
      logger.debug('[AuthGuard]: User is not logged in, redirecting to sign in');
      router.replace(paths.auth.signIn);
      return;
    }

    // Verificar se usuário tem empresa vinculada
    // Admin não precisa de empresa vinculada - ele gerencia todas as empresas
    if (!user.empresa && user.papel !== 'admin') {
      logger.debug('[AuthGuard]: User has no empresa, showing setup modal');
      setShowSetupEmpresa(true);
    }

    setIsChecking(false);
  };

  React.useEffect(() => {
    checkPermissions().catch(() => {
      // noop
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Expected
  }, [user, error, isLoading]);

  const handleSetupSuccess = React.useCallback(() => {
    setShowSetupEmpresa(false);
    // Recarregar a página para atualizar todos os dados
    window.location.reload();
  }, []);

  if (isChecking) {
    return null;
  }

  if (error) {
    return <Alert color="error">{error}</Alert>;
  }

  // Se precisa configurar empresa, mostrar apenas o modal (sem dashboard por trás)
  if (showSetupEmpresa) {
    return (
      <Box
        sx={{
          bgcolor: 'var(--mui-palette-background-default)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SetupEmpresaModal 
          open={showSetupEmpresa} 
          onSuccess={handleSetupSuccess}
        />
      </Box>
    );
  }

  return <React.Fragment>{children}</React.Fragment>;
}
