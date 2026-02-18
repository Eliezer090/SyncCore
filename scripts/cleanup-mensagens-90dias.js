// Script de limpeza: Remove mensagens com mais de 90 dias
// Uso: node scripts/cleanup-mensagens-90dias.js
// Recomendado: executar via cron diariamente (ex: 0 3 * * *)

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'sistema_whats',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function cleanup() {
  const client = await pool.connect();
  try {
    console.log('🧹 Iniciando limpeza de mensagens com mais de 90 dias...\n');

    // Deletar mensagens antigas
    const msgResult = await client.query(
      `DELETE FROM mensagens_chat WHERE criado_em < NOW() - INTERVAL '90 days'`
    );
    console.log(`✅ ${msgResult.rowCount} mensagens removidas`);

    // Deletar contatos sem mensagens
    const ctResult = await client.query(
      `DELETE FROM chat_contatos c
       WHERE NOT EXISTS (
         SELECT 1 FROM mensagens_chat m
         WHERE m.empresa_id = c.empresa_id AND m.remote_jid = c.remote_jid
       )`
    );
    console.log(`✅ ${ctResult.rowCount} contatos vazios removidos`);

    console.log('\n🎉 Limpeza concluída!');
  } catch (err) {
    console.error('❌ Erro na limpeza:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanup();
