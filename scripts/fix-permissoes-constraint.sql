-- Atualizar constraint unique de permissões para incluir empresa_id e papel_empresa_id
-- Isso permite que a mesma combinação papel+recurso_id exista em empresas diferentes

-- Remover constraint único antigo
ALTER TABLE permissoes DROP CONSTRAINT IF EXISTS permissoes_papel_recurso_id_key;

-- Adicionar novo constraint que inclui empresa_id e papel_empresa_id
ALTER TABLE permissoes ADD CONSTRAINT permissoes_papel_recurso_ukey 
  UNIQUE(papel, recurso_id, empresa_id, papel_empresa_id);

-- Para permissões do sistema (sem empresa e papel_empresa_id específico), 
-- precisamos de um constraint diferente para evitar duplicatas
-- Usar partial unique index para linhas onde empresa_id IS NULL E papel_empresa_id IS NULL
CREATE UNIQUE INDEX IF NOT EXISTS idx_permissoes_papel_recurso_global 
  ON permissoes(papel, recurso_id) 
  WHERE empresa_id IS NULL AND papel_empresa_id IS NULL;
