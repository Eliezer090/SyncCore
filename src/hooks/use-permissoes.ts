'use client';

import * as React from 'react';
import type { PermissaoCompleta } from '@/types/database';
import { useUser } from './use-user';

export interface UsePermissoesReturn {
  permissoes: PermissaoCompleta[];
  isLoading: boolean;
  error: string | null;
  temPermissao: (recursoCodigo: string, acao?: 'visualizar' | 'criar' | 'editar' | 'excluir') => boolean;
  getPermissao: (recursoCodigo: string) => PermissaoCompleta | undefined;
  refetch: () => Promise<void>;
}

export function usePermissoes(): UsePermissoesReturn {
  const { user } = useUser();
  const [permissoes, setPermissoes] = React.useState<PermissaoCompleta[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchPermissoes = React.useCallback(async () => {
    if (!user?.papel) {
      setPermissoes([]);
      setIsLoading(false);
      console.log('[usePermissoes] Papel não encontrado no usuário');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
        console.log('[usePermissoes] Token não encontrado');
        setPermissoes([]);
        setIsLoading(false);
        return;
      }

      console.log('[usePermissoes] Carregando permissões para papel:', user.papel);
      const response = await fetch(`/api/permissoes?papel=${user.papel}&apenasVisualizaveis=true`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar permissões');
      }

      const data = await response.json();
      const perms = data.permissoes || [];
      console.log('%c[usePermissoes] Permissões carregadas com sucesso:', 'color: green; font-weight: bold;', {
        total: perms.length,
        papel: user.papel,
        permissoes: perms.map(p => ({
          codigo: p.recurso_codigo,
          nome: p.recurso_nome,
          visualizar: p.pode_visualizar,
          criar: p.pode_criar,
          editar: p.pode_editar,
          excluir: p.pode_excluir,
          empresa_id: p.empresa_id,
          papel_empresa_id: p.papel_empresa_id,
        })),
      });
      setPermissoes(perms);
    } catch (err) {
      console.error('[usePermissoes] Erro ao buscar permissões:', err);
      setError('Erro ao carregar permissões');
      setPermissoes([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.papel]);

  React.useEffect(() => {
    fetchPermissoes();
  }, [fetchPermissoes]);

  const temPermissao = React.useCallback(
    (recursoCodigo: string, acao: 'visualizar' | 'criar' | 'editar' | 'excluir' = 'visualizar'): boolean => {
      // Admin sempre tem permissão total
      if (user?.papel === 'admin') {
        console.log(`[temPermissao] Admin detectado - permissão ${acao} para ${recursoCodigo}: true`);
        return true;
      }

      const permissao = permissoes.find((p) => p.recurso_codigo === recursoCodigo);
      if (!permissao) {
        console.log(`[temPermissao] Recurso ${recursoCodigo} não encontrado nas permissões`);
        return false;
      }

      const temPermis = permissao[`pode_${acao}`] === true;
      console.log(`[temPermissao] ${recursoCodigo} - ${acao}: ${temPermis}`, { 
        papel: user?.papel,
        empresa_id: permissao.empresa_id,
        papel_empresa_id: permissao.papel_empresa_id
      });
      
      return temPermis;
    },
    [permissoes, user?.papel]
  );

  const getPermissao = React.useCallback(
    (recursoCodigo: string): PermissaoCompleta | undefined => {
      return permissoes.find((p) => p.recurso_codigo === recursoCodigo);
    },
    [permissoes]
  );

  return {
    permissoes,
    isLoading,
    error,
    temPermissao,
    getPermissao,
    refetch: fetchPermissoes,
  };
}
