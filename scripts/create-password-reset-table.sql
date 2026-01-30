-- Tabela para armazenar tokens de reset de senha
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para melhorar performance de consultas por token
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);

-- Índice para melhorar performance de consultas por usuário
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_usuario_id ON password_reset_tokens(usuario_id);

-- Índice para melhorar performance de limpeza de tokens expirados
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

COMMENT ON TABLE password_reset_tokens IS 'Armazena tokens temporários para recuperação de senha';
COMMENT ON COLUMN password_reset_tokens.token IS 'Token único e aleatório para validar o reset';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Data/hora de expiração do token (geralmente 1 hora)';
COMMENT ON COLUMN password_reset_tokens.used IS 'Indica se o token já foi utilizado';
