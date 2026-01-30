'use client';

import * as React from 'react';
import { setupPermissoesDebug } from '@/lib/debug-permissoes';

export function DebugPermissoes(): React.JSX.Element | null {
  React.useEffect(() => {
    setupPermissoesDebug();
    console.log('%c✅ Debug de Permissões Iniciado', 'color: green; font-size: 16px; font-weight: bold;');
    console.log('%cUse window.debugPermissoes() para ver informações do usuário e permissões', 'color: blue; font-size: 12px;');
  }, []);

  return null;
}
