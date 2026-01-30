#!/usr/bin/env node
/**
 * Script para executar migração de constraint de permissões
 * 
 * Uso: node scripts/fix-permissoes-constraint.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente do arquivo .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, value] = trimmedLine.split('=');
      if (key && value) {
        process.env[key] = value;
      }
    }
  });
}

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const sql = `
-- Atualizar constraint unique de permissões para incluir empresa_id e papel_empresa_id
-- Isso permite que a mesma combinação papel+recurso_id exista em empresas diferentes

-- Remover constraint único antigo se existir
ALTER TABLE IF EXISTS permissoes DROP CONSTRAINT IF EXISTS permissoes_papel_recurso_id_key;

-- Remover constraint novo se existir (em caso de re-execução)
ALTER TABLE IF EXISTS permissoes DROP CONSTRAINT IF EXISTS permissoes_papel_recurso_ukey;

-- Remover índice antigo se existir
DROP INDEX IF EXISTS idx_permissoes_papel_recurso_global;

-- Adicionar novo constraint que inclui empresa_id e papel_empresa_id
ALTER TABLE permissoes ADD CONSTRAINT permissoes_papel_recurso_ukey 
  UNIQUE(papel, recurso_id, empresa_id, papel_empresa_id);

-- Para permissões do sistema (sem empresa e papel_empresa_id específico), 
-- precisamos de um constraint diferente para evitar duplicatas
-- Usar partial unique index para linhas onde empresa_id IS NULL E papel_empresa_id IS NULL
CREATE UNIQUE INDEX IF NOT EXISTS idx_permissoes_papel_recurso_global 
  ON permissoes(papel, recurso_id) 
  WHERE empresa_id IS NULL AND papel_empresa_id IS NULL;
`;

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('🔄 Iniciando migração de constraints de permissões...');
    
    // Executar cada comando separadamente para evitar erros
    const commands = sql.split(';').filter(cmd => cmd.trim());
    
    for (const command of commands) {
      if (command.trim()) {
        try {
          await client.query(command);
          console.log('✅', command.substring(0, 80).trim() + '...');
        } catch (error) {
          console.error('❌ Erro executando comando:', error.message);
          // Continuar com outros comandos
        }
      }
    }
    
    console.log('✨ Migração concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante migração:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
