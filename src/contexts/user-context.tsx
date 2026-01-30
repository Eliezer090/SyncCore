'use client';

import * as React from 'react';

import type { User, UserEmpresa } from '@/types/user';
import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/default-logger';

export interface UserContextValue {
  user: User | null;
  error: string | null;
  isLoading: boolean;
  refreshKey: number; // Key que muda quando empresa é alterada, para forçar refresh das páginas
  checkSession?: () => Promise<void>;
  setEmpresaAtiva?: (empresa: UserEmpresa | null) => Promise<void>;
}

export const UserContext = React.createContext<UserContextValue | undefined>(undefined);

export interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps): React.JSX.Element {
  const [state, setState] = React.useState<{ 
    user: User | null; 
    error: string | null; 
    isLoading: boolean;
    refreshKey: number;
  }>({
    user: null,
    error: null,
    isLoading: true,
    refreshKey: 0,
  });

  const checkSession = React.useCallback(async (): Promise<void> => {
    try {
      const { data, error } = await authClient.getUser();

      if (error) {
        logger.error(error);
        setState((prev) => ({ ...prev, user: null, error: 'Something went wrong', isLoading: false }));
        return;
      }

      setState((prev) => ({ ...prev, user: data ?? null, error: null, isLoading: false }));
    } catch (error) {
      logger.error(error);
      setState((prev) => ({ ...prev, user: null, error: 'Something went wrong', isLoading: false }));
    }
  }, []);

  const setEmpresaAtiva = React.useCallback(async (empresa: UserEmpresa | null): Promise<void> => {
    console.log('[UserContext] setEmpresaAtiva chamado com:', empresa);
    try {
      const token = localStorage.getItem('custom-auth-token');
      console.log('[UserContext] Token existe:', !!token);
      if (!token) {
        console.log('[UserContext] Token não encontrado, abortando');
        return;
      }

      console.log('[UserContext] Fazendo POST para /api/admin/empresas');
      const response = await fetch('/api/admin/empresas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ empresaId: empresa?.id || null }),
      });

      console.log('[UserContext] Response status:', response.status, response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[UserContext] Erro na resposta:', errorText);
        throw new Error('Erro ao selecionar empresa');
      }

      const data = await response.json();
      console.log('[UserContext] Resposta da API:', data);

      // Atualizar token
      localStorage.setItem('custom-auth-token', data.token);
      console.log('[UserContext] Token atualizado no localStorage');

      // Atualizar usuário no estado e incrementar refreshKey para forçar reload das páginas
      setState((prev) => {
        console.log('[UserContext] Atualizando estado, prev.user:', prev.user);
        if (!prev.user) return prev;
        
        const updatedUser = {
          ...prev.user,
          empresaAtiva: data.empresaAtiva,
        };
        console.log('[UserContext] updatedUser:', updatedUser);
        
        // Atualizar cache local
        localStorage.setItem('user-data', JSON.stringify(updatedUser));
        console.log('[UserContext] user-data atualizado no localStorage');
        
        const newState = { 
          ...prev, 
          user: updatedUser,
          refreshKey: prev.refreshKey + 1, // Incrementa para forçar refresh
        };
        console.log('[UserContext] Novo estado, refreshKey:', newState.refreshKey);
        return newState;
      });
    } catch (error) {
      console.error('[UserContext] Erro em setEmpresaAtiva:', error);
      logger.error('Erro ao selecionar empresa:', error);
    }
  }, []);

  React.useEffect(() => {
    checkSession().catch((error) => {
      logger.error(error);
      // noop
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Expected
  }, []);

  return (
    <UserContext.Provider value={{ ...state, checkSession, setEmpresaAtiva }}>
      {children}
    </UserContext.Provider>
  );
}

export const UserConsumer = UserContext.Consumer;
