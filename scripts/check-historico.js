const { Pool } = require('pg');

const pool = new Pool({
  host: '72.60.48.193',
  port: 578,
  database: 'postgres',
  user: 'postgres',
  password: '08f0c0e4720bac6b3634'
});

async function checkTable() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'historico_conversas' 
      ORDER BY ordinal_position
    `);
    console.log('Colunas da tabela historico_conversas:');
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkTable();
