'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useRouter } from 'next/navigation';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr';

import { usePermissoes } from '@/hooks/use-permissoes';
import { useUser } from '@/hooks/use-user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  recurso: string;  // Código do recurso (ex: 'clientes', 'produtos')
  acao?: 'visualizar' | 'criar' | 'editar' | 'excluir';
  fallback?: React.ReactNode;
}

/**
 * Componente wrapper que protege uma rota baseado nas permissões do usuário
 * 
 * Uso:
 * <ProtectedRoute recurso="clientes" acao="visualizar">
 *   <ClientesPage />
 * </ProtectedRoute>
 */
export function ProtectedRoute({ 
  children, 
  recurso, 
  acao = 'visualizar',
  fallback 
}: ProtectedRouteProps): React.JSX.Element {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const { temPermissao, isLoading: permLoading } = usePermissoes();

  const isLoading = userLoading || permLoading;

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Não logado
  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Você precisa estar logado para acessar esta página.
        </Alert>
      </Box>
    );
  }

  // Verificar permissão
  const permitido = temPermissao(recurso, acao);

  if (!permitido) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Acesso Negado
          </Typography>
          <Typography variant="body2">
            Você não tem permissão para {getAcaoTexto(acao)} o recurso "{recurso}".
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Entre em contato com o administrador do sistema se você acredita que deveria ter acesso.
          </Typography>
        </Alert>
        <Button
          startIcon={<ArrowLeftIcon />}
          onClick={() => router.back()}
          variant="outlined"
        >
          Voltar
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
}

function getAcaoTexto(acao: string): string {
  const textos: Record<string, string> = {
    visualizar: 'visualizar',
    criar: 'criar itens em',
    editar: 'editar itens em',
    excluir: 'excluir itens em',
  };
  return textos[acao] || acao;
}

/**
 * Hook para verificar permissão e mostrar/esconder elementos
 */
export function useProtectedAction(recurso: string, acao: 'criar' | 'editar' | 'excluir'): {
  permitido: boolean;
  isLoading: boolean;
} {
  const { temPermissao, isLoading } = usePermissoes();
  
  return {
    permitido: temPermissao(recurso, acao),
    isLoading,
  };
}
