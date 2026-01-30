#!/usr/bin/env node
/**
 * Script para atualizar view de permissões para considerar empresa_id
 * 
 * Uso: node scripts/fix-permissoes-view.js
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

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('🔄 Iniciando atualização da view de permissões...');
    
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'fix-permissoes-view.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Executar o SQL completo
    await client.query(sql);
    
    console.log('✅ View vw_permissoes_completas atualizada com sucesso!');
    console.log('✅ Function get_permissoes_usuario criada com sucesso!');
    console.log('\n📋 Agora as permissões consideram:');
    console.log('   1. Permissões específicas do papel customizado da empresa (papel_empresa_id)');
    console.log('   2. Permissões do papel padrão na empresa (empresa_id)');
    console.log('   3. Permissões globais do papel (sistema)');
    
    console.log('\n✨ Migração concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);
