const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: '72.60.48.193',
  port: 578,
  database: 'postgres',
  user: 'postgres',
  password: '08f0c0e4720bac6b3634',
});

async function run() {
  const client = await pool.connect();
  try {
    // Gerar hash da senha
    const senhaHash = bcrypt.hashSync('admin123', 10);
    
    // Verificar se já existe
    const exists = await client.query(
      'SELECT id FROM usuarios WHERE email = $1', 
      ['admin@sistema.com']
    );
    
    if (exists.rows.length > 0) {
      // Atualizar para admin
      await client.query(
        'UPDATE usuarios SET papel = $1, empresa_id = NULL, senha_hash = $2 WHERE email = $3',
        ['admin', senhaHash, 'admin@sistema.com']
      );
      console.log('Usuario admin atualizado!');
    } else {
      // Criar novo
      await client.query(
        'INSERT INTO usuarios (empresa_id, nome, email, senha_hash, papel, ativo) VALUES (NULL, $1, $2, $3, $4, $5)',
        ['Administrador', 'admin@sistema.com', senhaHash, 'admin', true]
      );
      console.log('Usuario admin criado!');
    }
    
    console.log('Email: admin@sistema.com');
    console.log('Senha: admin123');
  } catch (err) {
    console.error('Erro:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

run();
