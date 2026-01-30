const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || '72.60.48.193',
  port: process.env.DB_PORT || 578,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '08f0c0e4720bac6b3634',
});

async function createPasswordResetTable() {
  const client = await pool.connect();
  
  try {
    console.log('Conectado ao banco de dados...');
    
    // Criar tabela de tokens de reset
    await client.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('✓ Tabela password_reset_tokens criada');
    
    // Criar índices
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token 
      ON password_reset_tokens(token);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_usuario_id 
      ON password_reset_tokens(usuario_id);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at 
      ON password_reset_tokens(expires_at);
    `);
    
    console.log('✓ Índices criados');
    
    // Adicionar comentários
    await client.query(`
      COMMENT ON TABLE password_reset_tokens IS 'Armazena tokens temporários para recuperação de senha'
    `);
    
    console.log('✓ Setup completo!');
    
  } catch (error) {
    console.error('Erro ao criar tabela:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createPasswordResetTable()
  .then(() => {
    console.log('\nTabela de reset de senha configurada com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nErro:', error.message);
    process.exit(1);
  });
