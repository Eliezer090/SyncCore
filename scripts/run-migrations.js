// Script para executar migrações no banco de dados
// Uso: node scripts/run-migrations.js

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'sistema_whats',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Iniciando migrações...\n');

    // Migration 1: Adicionar url_foto em clientes
    console.log('📋 Migration 1: Adicionar url_foto em clientes');
    try {
      const checkColumn = await client.query(`
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'url_foto'
      `);
      
      if (checkColumn.rows.length === 0) {
        await client.query(`ALTER TABLE clientes ADD COLUMN url_foto VARCHAR(500) NULL`);
        console.log('   ✅ Coluna url_foto adicionada à tabela clientes\n');
      } else {
        console.log('   ℹ️  Coluna url_foto já existe na tabela clientes\n');
      }
    } catch (err) {
      console.log('   ❌ Erro:', err.message, '\n');
    }

    // Migration 2: Separar sábado/domingo em manhã e tarde
    console.log('📋 Migration 2: Separar horários de sábado/domingo em manhã e tarde');
    
    try {
      // Verificar se a coluna antiga existe
      const checkOldColumn = await client.query(`
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'expediente_profissional' AND column_name = 'sabado_inicio'
      `);
      
      if (checkOldColumn.rows.length > 0) {
        // Renomear colunas de sábado
        await client.query(`ALTER TABLE expediente_profissional RENAME COLUMN sabado_inicio TO sabado_manha_inicio`);
        await client.query(`ALTER TABLE expediente_profissional RENAME COLUMN sabado_fim TO sabado_manha_fim`);
        console.log('   ✅ Colunas de sábado renomeadas para manhã');
        
        // Renomear colunas de domingo
        await client.query(`ALTER TABLE expediente_profissional RENAME COLUMN domingo_inicio TO domingo_manha_inicio`);
        await client.query(`ALTER TABLE expediente_profissional RENAME COLUMN domingo_fim TO domingo_manha_fim`);
        console.log('   ✅ Colunas de domingo renomeadas para manhã');
      } else {
        console.log('   ℹ️  Colunas já foram renomeadas anteriormente');
      }
      
      // Adicionar colunas de tarde (se não existirem)
      const checkTardeColumn = await client.query(`
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'expediente_profissional' AND column_name = 'sabado_tarde_inicio'
      `);
      
      if (checkTardeColumn.rows.length === 0) {
        await client.query(`ALTER TABLE expediente_profissional ADD COLUMN sabado_tarde_inicio TIME NULL`);
        await client.query(`ALTER TABLE expediente_profissional ADD COLUMN sabado_tarde_fim TIME NULL`);
        await client.query(`ALTER TABLE expediente_profissional ADD COLUMN domingo_tarde_inicio TIME NULL`);
        await client.query(`ALTER TABLE expediente_profissional ADD COLUMN domingo_tarde_fim TIME NULL`);
        console.log('   ✅ Colunas de tarde adicionadas\n');
      } else {
        console.log('   ℹ️  Colunas de tarde já existem\n');
      }
    } catch (err) {
      console.log('   ❌ Erro:', err.message, '\n');
    }

    console.log('🎉 Migrações concluídas!');
    
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch(console.error);
