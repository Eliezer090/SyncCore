// ==================== TABELAS INDEPENDENTES ====================

export interface Cliente {
  id: number;
  nome: string | null;
  telefone: string;
  email: string | null;
  criado_em: Date;
  url_foto: string | null;
}

export interface Empresa {
  id: number;
  nome: string;
  tipo_negocio: string;
  ativo: boolean;
  criado_em: Date;
  whatsapp_vinculado: string | null;
  nome_agente: string | null;
  modelo_negocio: 'produto' | 'servico' | 'ambos';
  oferece_delivery: boolean;
  taxa_entrega_padrao: number;
  valor_minimo_entrega_gratis: number | null;
  tempo_cancelamento_minutos: number | null;
  url_logo: string | null;
  descricao_negocio: string | null;
}

export interface HistoricoConversa {
  id: number;
  session_id: string;
  message: Record<string, unknown>;
  empresa_id: number;
}

export interface MensagemRecebida {
  id: number;
  nome: string | null;
  telefone: string;
  sender: string;
  tipo: string | null;
  mensagem: string | null;
  instancia: string | null;
  data_recebimento: Date;
  url_media: string | null;
}

// ==================== TABELAS COM 1 NÍVEL DE DEPENDÊNCIA ====================

export interface CategoriaProduto {
  id: number;
  empresa_id: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  url_imagem: string | null;
}

export interface Endereco {
  id: number;
  cliente_id: number | null;
  empresa_id: number | null;
  logradouro: string;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  cep: string | null;
  referencia: string | null;
  tipo: string;
  criado_em: Date;
}

export interface HorarioEmpresa {
  id: number;
  empresa_id: number;
  dia_semana: number; // 0-6
  abre: string; // time
  fecha: string; // time
}

export interface FechamentoEmpresa {
  id: number;
  empresa_id: number;
  data_inicio: string; // date
  data_fim: string; // date
  tipo: 'fechado' | 'horario_especial';
  abre: string | null; // time - usado quando tipo = 'horario_especial'
  fecha: string | null; // time - usado quando tipo = 'horario_especial'
  motivo: string | null;
  criado_em: Date;
}

export interface Servico {
  id: number;
  empresa_id: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  url_imagem: string | null;
}

export interface Usuario {
  id: number;
  empresa_id: number | null;  // null = admin global
  nome: string;
  email: string;
  senha_hash: string;
  papel: string;
  ativo: boolean;
  criado_em: Date;
  papel_empresa_id: number | null;
  url_foto: string | null;  // Foto de perfil do profissional
}

// ==================== TABELAS COM 2 NÍVEIS DE DEPENDÊNCIA ====================

export interface Produto {
  id: number;
  empresa_id: number;
  categoria_id: number | null;
  nome: string;
  descricao: string | null;
  preco: number;
  controla_estoque: boolean;
  ativo: boolean;
  criado_em: Date;
  url_imagem: string | null;
}

// Profissional foi removido - agora usa tabela usuarios com papel = 'profissional'
// A coluna url_foto foi adicionada em usuarios

export interface Pedido {
  id: number;
  empresa_id: number;
  cliente_id: number;
  tipo: 'produto' | 'servico';
  status: string;
  total: number;
  criado_em: Date;
  observacao: string | null;
  endereco_id: number | null;
  taxa_entrega: number;
}

// ==================== TABELAS COM 3+ NÍVEIS DE DEPENDÊNCIA ====================

export interface EstoqueMovimentacao {
  id: number;
  produto_id: number;
  variacao_id: number | null;
  adicional_id: number | null;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  motivo: string | null;
  criado_em: Date;
}

export interface ProdutoAdicional {
  id: number;
  produto_id: number;
  nome: string;
  preco: number;
  controla_estoque: boolean;
  estoque_atual: number;
}

export interface ProdutoImagem {
  id: number;
  produto_id: number;
  url: string;
  ordem: number;
  is_capa: boolean;
}

export interface ProdutoVariacao {
  id: number;
  produto_id: number;
  nome: string;
  preco_adicional: number;
  controla_estoque: boolean;
  estoque_atual: number;
}

export interface Pagamento {
  id: number;
  pedido_id: number;
  metodo: string;
  valor: number;
  status: string;
  pago_em: Date | null;
  url_comprovante: string | null;
}

export interface PedidoItem {
  id: number;
  pedido_id: number;
  produto_id: number | null;
  servico_id: number | null;
  quantidade: number;
  preco_unitario: number;
  observacoes: string | null;
}

export interface ServicoProfissional {
  id: number;
  usuario_id: number;  // Antes era profissional_id, agora aponta para usuarios
  servico_id: number;
  duracao_minutos: number;
  preco: number | null;
  ativo: boolean;
  antecedencia_minima_minutos: number | null;
}

export interface ServicoImagem {
  id: number;
  servico_id: number;
  url: string;
  ordem: number;
  is_capa: boolean;
}

export interface ExpedienteProfissional {
  id: number;
  usuario_id: number;  // Antes era profissional_id, agora aponta para usuarios
  seg_sex_manha_inicio: string | null;
  seg_sex_manha_fim: string | null;
  seg_sex_tarde_inicio: string | null;
  seg_sex_tarde_fim: string | null;
  trabalha_sabado: boolean;
  sabado_manha_inicio: string | null;
  sabado_manha_fim: string | null;
  sabado_tarde_inicio: string | null;
  sabado_tarde_fim: string | null;
  trabalha_domingo: boolean;
  domingo_manha_inicio: string | null;
  domingo_manha_fim: string | null;
  domingo_tarde_inicio: string | null;
  domingo_tarde_fim: string | null;
}

export interface BloqueioProfissional {
  id: number;
  usuario_id: number;  // Antes era profissional_id, agora aponta para usuarios
  inicio: Date;
  fim: Date;
  motivo: string | null;
  dia_semana_recorrente: number | null;
}

export interface Agendamento {
  id: number;
  empresa_id: number;
  cliente_id: number;
  usuario_id: number;  // Antes era profissional_id, agora aponta para usuarios
  inicio: Date;
  fim: Date;
  status: string;
  criado_em: Date;
  observacao: string | null;
  duracao_total_minutos: number | null;
  cancelado_por: string | null;
}

// ==================== TABELAS DE MAIOR COMPLEXIDADE ====================

export interface PedidoItemAdicional {
  id: number;
  pedido_item_id: number;
  adicional_id: number;
  preco: number;
}

export interface AgendamentoServico {
  id: number;
  agendamento_id: number;
  servico_id: number;
  duracao_minutos: number;
  preco: number;
}

// ==================== SISTEMA DE PERMISSÕES ====================

export interface Recurso {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  grupo: string | null;
  icone: string | null;
  rota: string | null;
  ordem: number;
  ativo: boolean;
  criado_em: Date;
}

export interface Permissao {
  id: number;
  papel: string;
  recurso_id: number;
  empresa_id: number | null;
  papel_empresa_id: number | null;
  pode_visualizar: boolean;
  pode_criar: boolean;
  pode_editar: boolean;
  pode_excluir: boolean;
  criado_em: Date;
  atualizado_em: Date;
}

// Papel customizado por empresa
export interface PapelEmpresa {
  id: number;
  empresa_id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  cor: string;
  ativo: boolean;
  criado_em: Date;
  atualizado_em: Date;
}

// View de permissões completas
export interface PermissaoCompleta {
  id: number;
  papel: string | null;
  empresa_id: number | null;
  papel_empresa_id: number | null;
  papel_customizado_codigo: string | null;
  papel_customizado_nome: string | null;
  recurso_id: number;
  recurso_codigo: string;
  recurso_nome: string;
  recurso_descricao: string | null;
  recurso_grupo: string;
  recurso_icone: string | null;
  recurso_rota: string | null;
  ordem: number;
  pode_visualizar: boolean;
  pode_criar: boolean;
  pode_editar: boolean;
  pode_excluir: boolean;
  criado_em: Date;
  atualizado_em: Date;
}

// View de papéis disponíveis
export interface PapelDisponivel {
  codigo: string;
  nome: string;
  descricao: string | null;
  cor: string;
  empresa_id: number | null;
  is_sistema: boolean;
}

// ==================== TIPOS AUXILIARES PARA FORMULÁRIOS ====================

export type ClienteInput = Omit<Cliente, 'id' | 'criado_em'>;
export type EmpresaInput = Omit<Empresa, 'id' | 'criado_em'>;
export type CategoriaProdutoInput = Omit<CategoriaProduto, 'id'>;
export type EnderecoInput = Omit<Endereco, 'id' | 'criado_em'>;
export type HorarioEmpresaInput = Omit<HorarioEmpresa, 'id'>;
export type FechamentoEmpresaInput = Omit<FechamentoEmpresa, 'id' | 'criado_em'>;
export type ServicoInput = Omit<Servico, 'id'>;
export type UsuarioInput = Omit<Usuario, 'id' | 'criado_em'>;
export type ProdutoInput = Omit<Produto, 'id' | 'criado_em'>;
// ProfissionalInput removido - profissional agora é Usuario com papel='profissional'
export type PedidoInput = Omit<Pedido, 'id' | 'criado_em'>;
export type EstoqueMovimentacaoInput = Omit<EstoqueMovimentacao, 'id' | 'criado_em'>;
export type ProdutoAdicionalInput = Omit<ProdutoAdicional, 'id'>;
export type ProdutoImagemInput = Omit<ProdutoImagem, 'id'>;
export type ProdutoVariacaoInput = Omit<ProdutoVariacao, 'id'>;
export type PagamentoInput = Omit<Pagamento, 'id'>;
export type PedidoItemInput = Omit<PedidoItem, 'id'>;
export type ServicoProfissionalInput = Omit<ServicoProfissional, 'id'>;
export type ServicoImagemInput = Omit<ServicoImagem, 'id'>;
export type ExpedienteProfissionalInput = Omit<ExpedienteProfissional, 'id'>;
export type BloqueioProfissionalInput = Omit<BloqueioProfissional, 'id'>;
export type AgendamentoInput = Omit<Agendamento, 'id' | 'criado_em'>;
export type PedidoItemAdicionalInput = Omit<PedidoItemAdicional, 'id'>;
export type AgendamentoServicoInput = Omit<AgendamentoServico, 'id'>;
export type HistoricoConversaInput = Omit<HistoricoConversa, 'id'>;
export type MensagemRecebidaInput = Omit<MensagemRecebida, 'id' | 'data_recebimento'>;

// ==================== NOTIFICAÇÕES ====================

export interface Notificacao {
  id: string; // UUID
  empresa_id: number;
  cliente_id: number;
  tipo: 'atendimento_humano' | 'mensagem_manual' | string;
  mensagem: string | null;
  lida: boolean;
  criada_em: Date;
  // Campos de JOIN
  cliente_nome?: string;
  cliente_telefone?: string;
  empresa_nome?: string;
}

export type NotificacaoInput = Omit<Notificacao, 'id' | 'criada_em' | 'cliente_nome' | 'cliente_telefone' | 'empresa_nome'>;
