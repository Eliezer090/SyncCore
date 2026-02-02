-- Migration: Separar horários de sábado e domingo em manhã e tarde
-- Data: 2026-02-02
-- Descrição: Adiciona campos para manhã e tarde separados em sábado e domingo

-- Renomear colunas existentes de sábado para manhã
ALTER TABLE expediente_profissional 
  RENAME COLUMN sabado_inicio TO sabado_manha_inicio;
ALTER TABLE expediente_profissional 
  RENAME COLUMN sabado_fim TO sabado_manha_fim;

-- Adicionar colunas de tarde para sábado
ALTER TABLE expediente_profissional 
  ADD COLUMN IF NOT EXISTS sabado_tarde_inicio TIME NULL;
ALTER TABLE expediente_profissional 
  ADD COLUMN IF NOT EXISTS sabado_tarde_fim TIME NULL;

-- Renomear colunas existentes de domingo para manhã
ALTER TABLE expediente_profissional 
  RENAME COLUMN domingo_inicio TO domingo_manha_inicio;
ALTER TABLE expediente_profissional 
  RENAME COLUMN domingo_fim TO domingo_manha_fim;

-- Adicionar colunas de tarde para domingo
ALTER TABLE expediente_profissional 
  ADD COLUMN IF NOT EXISTS domingo_tarde_inicio TIME NULL;
ALTER TABLE expediente_profissional 
  ADD COLUMN IF NOT EXISTS domingo_tarde_fim TIME NULL;

-- Comentário explicativo
COMMENT ON COLUMN expediente_profissional.sabado_manha_inicio IS 'Horário de início da manhã no sábado';
COMMENT ON COLUMN expediente_profissional.sabado_manha_fim IS 'Horário de fim da manhã no sábado';
COMMENT ON COLUMN expediente_profissional.sabado_tarde_inicio IS 'Horário de início da tarde no sábado';
COMMENT ON COLUMN expediente_profissional.sabado_tarde_fim IS 'Horário de fim da tarde no sábado';
COMMENT ON COLUMN expediente_profissional.domingo_manha_inicio IS 'Horário de início da manhã no domingo';
COMMENT ON COLUMN expediente_profissional.domingo_manha_fim IS 'Horário de fim da manhã no domingo';
COMMENT ON COLUMN expediente_profissional.domingo_tarde_inicio IS 'Horário de início da tarde no domingo';
COMMENT ON COLUMN expediente_profissional.domingo_tarde_fim IS 'Horário de fim da tarde no domingo';
