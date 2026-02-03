-- Migração para adicionar suporte a variações e adicionais no controle de estoque
-- Execução: psql -h localhost -U postgres -d synccore -f scripts/add-variacao-estoque.sql

-- Adicionar colunas opcionais para variação e adicional na tabela de movimentações
ALTER TABLE estoque_movimentacoes 
ADD COLUMN IF NOT EXISTS variacao_id INTEGER REFERENCES produto_variacoes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS adicional_id INTEGER REFERENCES produto_adicionais(id) ON DELETE SET NULL;

-- Criar índices para melhor performance nas consultas
CREATE INDEX IF NOT EXISTS idx_estoque_movimentacoes_variacao_id ON estoque_movimentacoes(variacao_id);
CREATE INDEX IF NOT EXISTS idx_estoque_movimentacoes_adicional_id ON estoque_movimentacoes(adicional_id);

-- Adicionar coluna de controle de estoque nas variações e adicionais
ALTER TABLE produto_variacoes 
ADD COLUMN IF NOT EXISTS controla_estoque BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS estoque_atual INTEGER DEFAULT 0;

ALTER TABLE produto_adicionais 
ADD COLUMN IF NOT EXISTS controla_estoque BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS estoque_atual INTEGER DEFAULT 0;

-- Comentários explicativos
COMMENT ON COLUMN estoque_movimentacoes.variacao_id IS 'Referência à variação do produto (ex: tamanho M, cor preta)';
COMMENT ON COLUMN estoque_movimentacoes.adicional_id IS 'Referência ao adicional do produto (ex: cinto, acessório extra)';
COMMENT ON COLUMN produto_variacoes.controla_estoque IS 'Se true, o estoque é controlado por variação';
COMMENT ON COLUMN produto_variacoes.estoque_atual IS 'Quantidade atual em estoque para esta variação';
COMMENT ON COLUMN produto_adicionais.controla_estoque IS 'Se true, o estoque do adicional é controlado';
COMMENT ON COLUMN produto_adicionais.estoque_atual IS 'Quantidade atual em estoque para este adicional';
