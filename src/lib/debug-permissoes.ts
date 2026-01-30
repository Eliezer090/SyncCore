/**
 * Utilitário para debug de permissões no console do navegador
 * 
 * Uso: window.debugPermissoes()
 */

export function setupPermissoesDebug() {
  (window as any).debugPermissoes = () => {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.log('%c❌ Token não encontrado', 'color: red; font-size: 14px; font-weight: bold;');
      return;
    }

    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.log('%c❌ Token inválido', 'color: red; font-size: 14px; font-weight: bold;');
        return;
      }

      const decodedPayload = JSON.parse(atob(tokenParts[1]));
      console.log('%c📋 Dados do Token JWT:', 'color: blue; font-size: 14px; font-weight: bold;', {
        userId: decodedPayload.userId,
        email: decodedPayload.email,
        papel: decodedPayload.papel,
        papelEmpresaId: decodedPayload.papelEmpresaId,
        empresaId: decodedPayload.empresaId,
        empresaAtivaId: decodedPayload.empresaAtivaId,
        // profissionalId removido - profissional = usuario com papel 'profissional'
      });
    } catch (error) {
      console.log('%c❌ Erro ao decodificar token:', 'color: red;', error);
    }

    const userData = localStorage.getItem('user-data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('%c👤 Dados do Usuário:', 'color: purple; font-size: 14px; font-weight: bold;', {
          id: user.id,
          nome: user.nome,
          email: user.email,
          papel: user.papel,
          empresaId: user.empresaId,
          empresaAtiva: user.empresaAtiva,
        });
      } catch (error) {
        console.log('%c❌ Erro ao decodificar usuário:', 'color: red;', error);
      }
    }

    console.log('%c🔍 Para ver as permissões carregadas, abra o console e procure por "[usePermissoes]" ou execute:', 'color: green; font-size: 14px;');
    console.log('%cfetch("/api/permissoes?papel=SEU_PAPEL_AQUI", { headers: { Authorization: `Bearer ${localStorage.getItem("custom-auth-token")}` } }).then(r => r.json()).then(d => console.log(d))', 'color: gray; font-family: monospace; background: #f0f0f0; padding: 10px;');
  };
}
