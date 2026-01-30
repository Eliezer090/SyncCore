const { Pool } = require('pg');
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
    console.log('Removendo papel admin antigo...');
    await client.query("DELETE FROM permissoes WHERE papel = 'admin'");
    
    console.log('Renomeando admin_global para admin...');
    await client.query("UPDATE permissoes SET papel = 'admin' WHERE papel = 'admin_global'");
    
    const result = await client.query("SELECT DISTINCT papel FROM permissoes");
    console.log('Papéis agora:', result.rows.map(r => r.papel));
    
    // Continuar com o resto da migração
    console.log('\nAtualizando view...');
    await client.query("DROP VIEW IF EXISTS vw_permissoes_completas");
    await client.query(`
      CREATE VIEW vw_permissoes_completas AS
      SELECT 
        p.id,
        p.papel,
        p.empresa_id,
        p.papel_empresa_id,
        pe.codigo as papel_customizado_codigo,
        pe.nome as papel_customizado_nome,
        r.id as recurso_id,
        r.codigo as recurso_codigo,
        r.nome as recurso_nome,
        r.descricao as recurso_descricao,
        r.grupo as recurso_grupo,
        r.icone as recurso_icone,
        r.rota as recurso_rota,
        r.ordem,
        p.pode_visualizar,
        p.pode_criar,
        p.pode_editar,
        p.pode_excluir,
        p.criado_em,
        p.atualizado_em
      FROM permissoes p
      JOIN recursos r ON p.recurso_id = r.id
      LEFT JOIN papeis_empresa pe ON p.papel_empresa_id = pe.id
      WHERE r.ativo = true
      ORDER BY r.ordem
    `);
    console.log('View atualizada!');

    // Atualizar permissões do gerente - tudo exceto empresas
    console.log('\nAtualizando permissões do gerente...');
    const recursos = await client.query("SELECT id, codigo FROM recursos WHERE ativo = true");
    for (const r of recursos.rows) {
      const isEmpresas = r.codigo === 'empresas';
      await client.query(`
        UPDATE permissoes 
        SET pode_visualizar = $2, pode_criar = $2, pode_editar = $2, pode_excluir = $2
        WHERE papel = 'gerente' AND recurso_id = $1 AND empresa_id IS NULL
      `, [r.id, !isEmpresas]);
    }
    console.log('Permissões do gerente atualizadas!');

    // Criar funções auxiliares
    console.log('\nCriando funções auxiliares...');
    await client.query(`
      CREATE OR REPLACE FUNCTION copiar_permissoes_para_empresa(p_empresa_id INT, p_papel VARCHAR(50)) 
      RETURNS void AS $$
      DECLARE
        r RECORD;
        perm RECORD;
      BEGIN
        FOR r IN SELECT id FROM recursos WHERE ativo = true LOOP
          SELECT * INTO perm FROM permissoes 
          WHERE papel = p_papel 
          AND recurso_id = r.id 
          AND empresa_id IS NULL
          AND papel_empresa_id IS NULL
          LIMIT 1;
          
          IF FOUND THEN
            INSERT INTO permissoes (papel, recurso_id, empresa_id, pode_visualizar, pode_criar, pode_editar, pode_excluir)
            VALUES (p_papel, r.id, p_empresa_id, perm.pode_visualizar, perm.pode_criar, perm.pode_editar, perm.pode_excluir)
            ON CONFLICT DO NOTHING;
          END IF;
        END LOOP;
      END;
      $$ LANGUAGE plpgsql
    `);

    await client.query(`
      CREATE OR REPLACE FUNCTION criar_permissoes_papel_customizado(p_papel_empresa_id INT, p_base_papel VARCHAR(50) DEFAULT 'atendente') 
      RETURNS void AS $$
      DECLARE
        r RECORD;
        perm RECORD;
        v_empresa_id INT;
      BEGIN
        SELECT empresa_id INTO v_empresa_id FROM papeis_empresa WHERE id = p_papel_empresa_id;
        
        IF v_empresa_id IS NULL THEN
          RAISE EXCEPTION 'Papel customizado não encontrado';
        END IF;
        
        FOR r IN SELECT id FROM recursos WHERE ativo = true LOOP
          SELECT * INTO perm FROM permissoes 
          WHERE papel = p_base_papel 
          AND recurso_id = r.id 
          AND (empresa_id = v_empresa_id OR empresa_id IS NULL)
          ORDER BY empresa_id NULLS LAST
          LIMIT 1;
          
          IF FOUND THEN
            INSERT INTO permissoes (papel_empresa_id, recurso_id, empresa_id, pode_visualizar, pode_criar, pode_editar, pode_excluir)
            VALUES (p_papel_empresa_id, r.id, v_empresa_id, perm.pode_visualizar, perm.pode_criar, perm.pode_editar, perm.pode_excluir)
            ON CONFLICT DO NOTHING;
          ELSE
            INSERT INTO permissoes (papel_empresa_id, recurso_id, empresa_id, pode_visualizar, pode_criar, pode_editar, pode_excluir)
            VALUES (p_papel_empresa_id, r.id, v_empresa_id, false, false, false, false)
            ON CONFLICT DO NOTHING;
          END IF;
        END LOOP;
      END;
      $$ LANGUAGE plpgsql
    `);
    console.log('Funções criadas!');

    console.log('\n=== MIGRAÇÃO CONCLUÍDA ===');
    
  } catch (err) {
    console.error('Erro:', err.message);
    console.error(err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
