// Papéis do sistema (fixos)
export type UserPapelSistema = 'admin' | 'gerente' | 'profissional' | 'atendente';
// Para compatibilidade, incluir string para papéis customizados
export type UserPapel = UserPapelSistema | string;
export type ModeloNegocio = 'produto' | 'servico' | 'ambos';

export interface UserEmpresa {
  id: number;
  nome: string;
  logo: string | null;
  modelo_negocio: ModeloNegocio;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  papel: UserPapel;
  papelEmpresaId?: number;           // ID do papel customizado (se houver)
  empresa: UserEmpresa | null;       // null para admin sem empresa específica
  empresaAtiva?: UserEmpresa | null; // empresa selecionada pelo admin
  // profissionalId removido - agora profissional É o próprio usuario (id)
  avatar?: string;

  [key: string]: unknown;
}
