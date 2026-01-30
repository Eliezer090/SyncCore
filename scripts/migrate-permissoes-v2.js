const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

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
    console.log('=== ATUALIZANDO SISTEMA DE PERMISSÕES ===\n');

    // 1. Atualizar papel admin_global para admin no banco
    console.log('1. Atualizando papel admin_global para admin nos usuários...');
    const result = await client.query(
      `UPDATE usuarios SET papel = 'admin' WHERE papel = 'admin_global' RETURNING id, email`
    );
    console.log(`   ${result.rowCount} usuário(s) atualizado(s):`);
    result.rows.forEach(u => console.log(`   - ${u.email}`));

    // 2. Criar tabela papeis_empresa se não existir
    console.log('\n2. Criando tabela papeis_empresa...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS papeis_empresa (
        id SERIAL PRIMARY KEY,
        empresa_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
        codigo VARCHAR(50) NOT NULL,
        nome VARCHAR(100) NOT NULL,
        descricao TEXT,
        cor VARCHAR(20) DEFAULT 'default',
        ativo BOOLEAN DEFAULT true,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(empresa_id, codigo)
      )
    `);
    console.log('   Tabela papeis_empresa criada/verificada');

    // 3. Adicionar colunas à tabela permissoes
    console.log('\n3. Adicionando colunas à tabela permissoes...');
    
    try {
      await client.query(`ALTER TABLE permissoes ADD COLUMN empresa_id INT REFERENCES empresas(id) ON DELETE CASCADE`);
      console.log('   Coluna empresa_id adicionada');
    } catch (e) {
      if (e.code === '42701') console.log('   Coluna empresa_id já existe');
      else throw e;
    }

    try {
      await client.query(`ALTER TABLE permissoes ADD COLUMN papel_empresa_id INT REFERENCES papeis_empresa(id) ON DELETE CASCADE`);
      console.log('   Coluna papel_empresa_id adicionada');
    } catch (e) {
      if (e.code === '42701') console.log('   Coluna papel_empresa_id já existe');
      else throw e;
    }

    // 4. Adicionar papel_empresa_id na tabela usuarios
    console.log('\n4. Adicionando coluna papel_empresa_id à tabela usuarios...');
    try {
      await client.query(`ALTER TABLE usuarios ADD COLUMN papel_empresa_id INT REFERENCES papeis_empresa(id) ON DELETE SET NULL`);
      console.log('   Coluna papel_empresa_id adicionada');
    } catch (e) {
      if (e.code === '42701') console.log('   Coluna papel_empresa_id já existe');
      else throw e;
    }

    // 5. Atualizar índices
    console.log('\n5. Criando índices...');
    await client.query(`CREATE INDEX IF NOT EXISTS idx_permissoes_empresa ON permissoes(empresa_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_permissoes_papel_empresa ON permissoes(papel_empresa_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_papeis_empresa_empresa ON papeis_empresa(empresa_id)`);
    console.log('   Índices criados');

    // 6. Remover permissões do admin_global e atualizar para admin
    console.log('\n6. Atualizando permissões admin_global para admin...');
    await client.query(`UPDATE permissoes SET papel = 'admin' WHERE papel = 'admin_global'`);
    console.log('   Permissões atualizadas');

    // 7. Atualizar view de permissões completas
    console.log('\n7. Atualizando view vw_permissoes_completas...');
    await client.query(`DROP VIEW IF EXISTS vw_permissoes_completas`);
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
    console.log('   View atualizada');

    // 8. Atualizar permissões padrão dos papéis do sistema
    console.log('\n8. Atualizando permissões padrão...');
    
    // Admin - acesso total
    await client.query(`
      UPDATE permissoes SET pode_visualizar = true, pode_criar = true, pode_editar = true, pode_excluir = true
      WHERE papel = 'admin' AND empresa_id IS NULL AND papel_empresa_id IS NULL
    `);

    // Gerente - tudo exceto empresas
    const recursos = await client.query(`SELECT id, codigo FROM recursos WHERE ativo = true`);
    for (const r of recursos.rows) {
      const isEmpresas = r.codigo === 'empresas';
      await client.query(`
        INSERT INTO permissoes (papel, recurso_id, empresa_id, pode_visualizar, pode_criar, pode_editar, pode_excluir)
        VALUES ('gerente', $1, NULL, $2, $2, $2, $2)
        ON CONFLICT (papel, recurso_id) WHERE empresa_id IS NULL AND papel_empresa_id IS NULL
        DO UPDATE SET pode_visualizar = $2, pode_criar = $2, pode_editar = $2, pode_excluir = $2
      `, [r.id, !isEmpresas]);
    }
    
    console.log('   Permissões atualizadas para admin e gerente');

    // 9. Criar funções auxiliares
    console.log('\n9. Criando funções auxiliares...');
    
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
    
    console.log('   Funções criadas');

    console.log('\n=== MIGRAÇÃO CONCLUÍDA COM SUCESSO ===');
    console.log('\nResumo das mudanças:');
    console.log('- Papel admin_global renomeado para admin');
    console.log('- Nova tabela papeis_empresa para papéis customizados por empresa');
    console.log('- Permissões agora suportam empresa_id para permissões por empresa');
    console.log('- Gerentes podem criar e gerenciar papéis customizados');
    console.log('- Recurso "Empresas" só aparece para papel admin');

  } catch (err) {
    console.error('\nERRO na migração:', err.message);
    console.error(err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
