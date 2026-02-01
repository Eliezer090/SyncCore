/**
 * Utilitário para tratamento de erros de banco de dados
 * Converte erros técnicos em mensagens amigáveis para o usuário
 */

interface PostgresError {
  code?: string;
  detail?: string;
  constraint?: string;
  column?: string;
  table?: string;
}

// Mapeamento de constraints para mensagens amigáveis
const constraintMessages: Record<string, string> = {
  // Usuários
  'usuarios_email_key': 'Este email já está cadastrado no sistema',
  'usuarios_empresa_id_fkey': 'A empresa selecionada não existe',
  
  // Empresas
  'empresas_pkey': 'Esta empresa já existe',
  'empresas_cnpj_key': 'Este CNPJ já está cadastrado',
  'empresas_whatsapp_vinculado_key': 'Este WhatsApp Vinculado já está em uso por outra empresa',
  
  // Clientes
  'clientes_telefone_key': 'Este telefone já está cadastrado',
  'clientes_email_key': 'Este email de cliente já está cadastrado',
  'clientes_cpf_key': 'Este CPF já está cadastrado',
  'clientes_empresa_id_fkey': 'A empresa selecionada não existe',
  
  // Produtos
  'produtos_empresa_id_fkey': 'A empresa selecionada não existe',
  'produtos_categoria_id_fkey': 'A categoria selecionada não existe',
  'produtos_codigo_key': 'Este código de produto já existe',
  
  // Categorias
  'categorias_produto_empresa_id_fkey': 'A empresa selecionada não existe',
  'categorias_produto_nome_empresa_id_key': 'Já existe uma categoria com este nome',
  
  // Serviços
  'servicos_empresa_id_fkey': 'A empresa selecionada não existe',
  'servicos_nome_empresa_id_key': 'Já existe um serviço com este nome',
  
  // Profissionais (tabela removida - agora usa usuarios com papel='profissional')
  // Constraints antigas mantidas para compatibilidade
  'agendamentos_usuario_id_fkey': 'O profissional selecionado não existe',
  
  // Pedidos
  'pedidos_cliente_id_fkey': 'O cliente selecionado não existe',
  'pedidos_empresa_id_fkey': 'A empresa selecionada não existe',
  
  // Agendamentos
  'agendamentos_cliente_id_fkey': 'O cliente selecionado não existe',
  'agendamentos_servico_id_fkey': 'O serviço selecionado não existe',
  
  // Permissões
  'permissoes_recurso_id_fkey': 'O recurso selecionado não existe',  'permissoes_papel_recurso_ukey': 'Já existe uma permissão para este papel e recurso',
  'idx_permissoes_papel_recurso_global': 'Já existe uma permissão global para este papel e recurso',  'papeis_empresa_empresa_id_codigo_key': 'Já existe um papel com este código nesta empresa',
  'permissoes_papel_recurso_empresa_key': 'Já existe uma permissão para este papel e recurso',
};

// Mapeamento de códigos de erro PostgreSQL
const errorCodeMessages: Record<string, string> = {
  '23505': 'Registro duplicado', // unique_violation
  '23503': 'Este registro está sendo usado por outros dados', // foreign_key_violation
  '23502': 'Campo obrigatório não preenchido', // not_null_violation
  '23514': 'Valor inválido para o campo', // check_violation
  '22001': 'Texto muito longo para o campo', // string_data_right_truncation
  '22P02': 'Formato de dados inválido', // invalid_text_representation
  '42P01': 'Tabela não encontrada', // undefined_table
  '42703': 'Campo não encontrado', // undefined_column
};

/**
 * Extrai o nome do campo do detalhe do erro PostgreSQL
 */
function extractFieldFromDetail(detail: string): string | null {
  // Exemplo: "Key (email)=(test@test.com) already exists."
  const match = detail.match(/Key \(([^)]+)\)/);
  return match ? match[1] : null;
}

/**
 * Extrai o valor do detalhe do erro PostgreSQL
 */
function extractValueFromDetail(detail: string): string | null {
  // Exemplo: "Key (email)=(test@test.com) already exists."
  const match = detail.match(/\)=\(([^)]+)\)/);
  return match ? match[1] : null;
}

/**
 * Traduz nomes de campos para português
 */
const fieldTranslations: Record<string, string> = {
  'email': 'email',
  'nome': 'nome',
  'telefone': 'telefone',
  'empresa_id': 'empresa',
  'cliente_id': 'cliente',
  'usuario_id': 'usuário/profissional',
  'whatsapp_vinculado': 'WhatsApp Vinculado',
  'categoria_id': 'categoria',
  'produto_id': 'produto',
  'servico_id': 'serviço',
  'pedido_id': 'pedido',
  'agendamento_id': 'agendamento',
  'codigo': 'código',
  'cpf': 'CPF',
  'cnpj': 'CNPJ',
};

/**
 * Converte um erro de banco de dados em uma mensagem amigável
 */
export function formatDatabaseError(error: unknown): string {
  const pgError = error as PostgresError;
  
  // Verificar se tem constraint específica
  if (pgError.constraint && constraintMessages[pgError.constraint]) {
    return constraintMessages[pgError.constraint];
  }
  
  // Tratar por código de erro
  if (pgError.code) {
    // Erro de duplicidade (unique violation)
    if (pgError.code === '23505' && pgError.detail) {
      const field = extractFieldFromDetail(pgError.detail);
      const value = extractValueFromDetail(pgError.detail);
      const fieldName = field ? (fieldTranslations[field] || field) : 'registro';
      
      if (value) {
        return `Já existe um registro com ${fieldName} "${value}"`;
      }
      return `Este ${fieldName} já está em uso`;
    }
    
    // Erro de chave estrangeira (foreign key violation)
    if (pgError.code === '23503' && pgError.detail) {
      const field = extractFieldFromDetail(pgError.detail);
      const fieldName = field ? (fieldTranslations[field] || field) : 'registro';
      
      if (pgError.detail.includes('still referenced')) {
        return `Não é possível excluir: existem registros vinculados a este ${fieldName}`;
      }
      return `O ${fieldName} selecionado não existe ou foi removido`;
    }
    
    // Erro de campo obrigatório
    if (pgError.code === '23502') {
      const fieldName = pgError.column ? (fieldTranslations[pgError.column] || pgError.column) : 'campo';
      return `O campo ${fieldName} é obrigatório`;
    }
    
    // Outros erros conhecidos
    if (errorCodeMessages[pgError.code]) {
      return errorCodeMessages[pgError.code];
    }
  }
  
  // Erro genérico
  if (error instanceof Error) {
    // Não expor detalhes técnicos, mas logar para debug
    console.error('Erro não tratado:', error.message);
  }
  
  return 'Ocorreu um erro ao processar a solicitação. Tente novamente.';
}

/**
 * Verifica se é um erro de duplicidade
 */
export function isDuplicateError(error: unknown): boolean {
  return (error as PostgresError).code === '23505';
}

/**
 * Verifica se é um erro de chave estrangeira
 */
export function isForeignKeyError(error: unknown): boolean {
  return (error as PostgresError).code === '23503';
}

/**
 * Verifica se é um erro de campo obrigatório
 */
export function isNotNullError(error: unknown): boolean {
  return (error as PostgresError).code === '23502';
}
