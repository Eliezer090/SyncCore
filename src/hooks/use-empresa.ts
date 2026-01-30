'use client';

import * as React from 'react';
import { useUser } from './use-user';

export interface UseEmpresaReturn {
  empresaId: number | null;
  isAdminGlobal: boolean;
  isLoading: boolean;
  canSelectEmpresa: boolean;
  refreshKey: number; // Muda quando empresa é alterada
}

/**
 * Hook para obter a empresa_id correta para formulários e APIs
 * - Para admin: retorna null (deve selecionar) ou empresaAtiva.id se selecionou
 * - Para outros usuários: retorna a empresa vinculada ao usuário
 */
export function useEmpresa(): UseEmpresaReturn {
  const { user, isLoading, refreshKey } = useUser();

  const isAdminGlobal = user?.papel === 'admin';
  
  // Admin global pode escolher, outros usam a empresa do usuário
  const empresaId = React.useMemo(() => {
    if (!user) return null;
    
    // Se é admin_global, usa a empresa ativa (se selecionou) ou null
    if (isAdminGlobal) {
      return user.empresaAtiva?.id || null;
    }
    
    // Para outros usuários, sempre usa a empresa vinculada
    return user.empresa?.id || user.empresaAtiva?.id || null;
  }, [user, isAdminGlobal]);

  return {
    empresaId,
    isAdminGlobal,
    isLoading,
    canSelectEmpresa: isAdminGlobal,
    refreshKey: refreshKey || 0,
  };
}
