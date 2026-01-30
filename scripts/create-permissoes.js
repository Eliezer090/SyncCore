// Script para criar as tabelas de permissões
// Execute com: node scripts/create-permissoes.js

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || '72.60.48.193',
  port: parseInt(process.env.DB_PORT || '578'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '08f0c0e4720bac6b3634',
});

async function run() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Criando tabelas de permissões...\n');

    // Criar tabela de recursos
    await client.query(`
      CREATE TABLE IF NOT EXISTS recursos (
        id SERIAL PRIMARY KEY,
        codigo VARCHAR(100) NOT NULL UNIQUE,
        nome VARCHAR(200) NOT NULL,
        descricao TEXT,
        grupo VARCHAR(100),
        icone VARCHAR(50),
        rota VARCHAR(200),
        ordem INT DEFAULT 0,
        ativo BOOLEAN DEFAULT true,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela recursos criada');

    // Criar tabela de permissões
    await client.query(`
      CREATE TABLE IF NOT EXISTS permissoes (
        id SERIAL PRIMARY KEY,
        papel VARCHAR(50) NOT NULL,
        recurso_id INT NOT NULL REFERENCES recursos(id) ON DELETE CASCADE,
        pode_visualizar BOOLEAN DEFAULT false,
        pode_criar BOOLEAN DEFAULT false,
        pode_editar BOOLEAN DEFAULT false,
        pode_excluir BOOLEAN DEFAULT false,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(papel, recurso_id)
      )
    `);
    console.log('✅ Tabela permissoes criada');

    // Criar índices
    await client.query(`CREATE INDEX IF NOT EXISTS idx_permissoes_papel ON permissoes(papel)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_permissoes_recurso ON permissoes(recurso_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_recursos_codigo ON recursos(codigo)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_recursos_grupo ON recursos(grupo)`);
    console.log('✅ Índices criados');

    // Inserir recursos
    const recursos = [
      // Geral
      ['dashboard', 'Dashboard', 'Painel principal com visão geral', 'Geral', 'chart-pie', '/dashboard', 1],
      ['empresas', 'Empresas', 'Gerenciamento de empresas', 'Geral', 'buildings', '/dashboard/empresas', 2],
      ['clientes', 'Clientes', 'Gerenciamento de clientes', 'Geral', 'users-four', '/dashboard/clientes', 3],
      ['usuarios', 'Usuários', 'Gerenciamento de usuários do sistema', 'Geral', 'user-circle', '/dashboard/usuarios', 4],
      ['enderecos', 'Endereços', 'Gerenciamento de endereços', 'Geral', 'map-pin', '/dashboard/enderecos', 5],
      ['horarios-empresa', 'Horários Empresa', 'Configuração de horários de funcionamento', 'Geral', 'clock', '/dashboard/horarios-empresa', 6],
      
      // Catálogo de Produtos
      ['categorias-produto', 'Categorias de Produto', 'Categorias para organizar produtos', 'Produtos & Pedidos', 'list-bullets', '/dashboard/categorias-produto', 10],
      ['produtos', 'Produtos', 'Cadastro de produtos', 'Produtos & Pedidos', 'cube', '/dashboard/produtos', 11],
      ['produto-variacoes', 'Variações de Produto', 'Variações de produtos', 'Produtos & Pedidos', 'cube', '/dashboard/produto-variacoes', 12],
      ['produto-adicionais', 'Adicionais de Produto', 'Itens adicionais para produtos', 'Produtos & Pedidos', 'cube', '/dashboard/produto-adicionais', 13],
      ['estoque', 'Estoque', 'Controle de estoque', 'Produtos & Pedidos', 'warehouse', '/dashboard/estoque', 14],
      
      // Vendas
      ['pedidos', 'Pedidos', 'Gerenciamento de pedidos', 'Produtos & Pedidos', 'shopping-cart', '/dashboard/pedidos', 20],
      ['pedido-itens', 'Itens do Pedido', 'Detalhes dos itens de pedidos', 'Produtos & Pedidos', 'shopping-cart', '/dashboard/pedido-itens', 21],
      ['pedido-item-adicionais', 'Adicionais do Item', 'Adicionais dos itens de pedidos', 'Produtos & Pedidos', 'shopping-cart', '/dashboard/pedido-item-adicionais', 22],
      ['pagamentos', 'Pagamentos', 'Gerenciamento de pagamentos', 'Produtos & Pedidos', 'credit-card', '/dashboard/pagamentos', 23],
      
      // Serviços
      ['servicos', 'Serviços', 'Cadastro de serviços', 'Serviços & Agenda', 'scissors', '/dashboard/servicos', 30],
      ['profissionais', 'Profissionais', 'Cadastro de profissionais', 'Serviços & Agenda', 'users', '/dashboard/profissionais', 31],
      ['servicos-profissional', 'Serviços do Profissional', 'Associar serviços aos profissionais', 'Serviços & Agenda', 'scissors', '/dashboard/servicos-profissional', 32],
      ['expediente-profissional', 'Expediente', 'Horários de trabalho dos profissionais', 'Serviços & Agenda', 'clock', '/dashboard/expediente-profissional', 33],
      ['bloqueios-profissional', 'Bloqueios', 'Bloqueios de agenda dos profissionais', 'Serviços & Agenda', 'prohibit', '/dashboard/bloqueios-profissional', 34],
      
      // Agenda
      ['agendamentos', 'Agendamentos', 'Gerenciamento de agendamentos', 'Serviços & Agenda', 'calendar', '/dashboard/agendamentos', 40],
      ['agendamento-servicos', 'Serviços do Agendamento', 'Serviços associados aos agendamentos', 'Serviços & Agenda', 'calendar', '/dashboard/agendamento-servicos', 41],
      
      // Comunicação
      ['historico-conversas', 'Histórico de Conversas', 'Histórico de conversas do WhatsApp', 'Comunicação', 'chat-circle', '/dashboard/historico-conversas', 50],
      
      // Configurações
      ['configuracoes', 'Configurações', 'Configurações do sistema', 'Configurações', 'gear-six', '/dashboard/settings', 60],
      ['minha-conta', 'Minha Conta', 'Perfil do usuário', 'Configurações', 'user', '/dashboard/account', 61],
      ['permissoes', 'Permissões', 'Gerenciamento de permissões', 'Configurações', 'shield-check', '/dashboard/permissoes', 62],
    ];

    for (const r of recursos) {
      await client.query(`
        INSERT INTO recursos (codigo, nome, descricao, grupo, icone, rota, ordem)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (codigo) DO UPDATE SET
          nome = EXCLUDED.nome,
          descricao = EXCLUDED.descricao,
          grupo = EXCLUDED.grupo,
          icone = EXCLUDED.icone,
          rota = EXCLUDED.rota,
          ordem = EXCLUDED.ordem
      `, r);
    }
    console.log(`✅ ${recursos.length} recursos inseridos`);

    // Buscar todos os recursos
    const { rows: recursosDb } = await client.query('SELECT id, codigo FROM recursos');
    
    // Definir permissões por papel
    const papeis = ['admin_global', 'admin', 'gerente', 'profissional', 'atendente'];
    
    // Recursos que cada papel NÃO pode acessar
    const restricoes = {
      admin: ['empresas', 'permissoes'],
      gerente: ['empresas', 'permissoes', 'usuarios'],
      profissional: [], // Terá acesso explícito só ao que pode
      atendente: [],    // Terá acesso explícito só ao que pode
    };

    // Recursos que profissional pode acessar
    const profissionalPode = ['dashboard', 'agendamentos', 'minha-conta', 'clientes'];
    
    // Recursos que atendente pode acessar
    const atendentePode = ['dashboard', 'clientes', 'pedidos', 'agendamentos', 'historico-conversas', 'minha-conta'];

    for (const papel of papeis) {
      for (const recurso of recursosDb) {
        let podeVisualizar = true;
        let podeCriar = true;
        let podeEditar = true;
        let podeExcluir = true;

        if (papel === 'admin_global') {
          // Admin global pode tudo
        } else if (papel === 'admin') {
          // Admin não pode empresas nem permissões
          if (restricoes.admin.includes(recurso.codigo)) {
            podeVisualizar = podeCriar = podeEditar = podeExcluir = false;
          }
        } else if (papel === 'gerente') {
          // Gerente não pode empresas, permissões, usuários
          if (restricoes.gerente.includes(recurso.codigo)) {
            podeVisualizar = podeCriar = podeEditar = podeExcluir = false;
          } else {
            // Gerente não pode excluir produtos/serviços
            if (['produtos', 'servicos'].includes(recurso.codigo)) {
              podeExcluir = false;
            }
          }
        } else if (papel === 'profissional') {
          // Profissional só pode o mínimo
          if (profissionalPode.includes(recurso.codigo)) {
            podeVisualizar = true;
            podeCriar = recurso.codigo === 'agendamentos';
            podeEditar = ['agendamentos', 'minha-conta'].includes(recurso.codigo);
            podeExcluir = false;
          } else {
            podeVisualizar = podeCriar = podeEditar = podeExcluir = false;
          }
        } else if (papel === 'atendente') {
          // Atendente pode básico
          if (atendentePode.includes(recurso.codigo)) {
            podeVisualizar = true;
            podeCriar = ['clientes', 'pedidos', 'agendamentos'].includes(recurso.codigo);
            podeEditar = ['clientes', 'pedidos', 'agendamentos', 'minha-conta'].includes(recurso.codigo);
            podeExcluir = false;
          } else {
            podeVisualizar = podeCriar = podeEditar = podeExcluir = false;
          }
        }

        await client.query(`
          INSERT INTO permissoes (papel, recurso_id, pode_visualizar, pode_criar, pode_editar, pode_excluir)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (papel, recurso_id) DO UPDATE SET
            pode_visualizar = EXCLUDED.pode_visualizar,
            pode_criar = EXCLUDED.pode_criar,
            pode_editar = EXCLUDED.pode_editar,
            pode_excluir = EXCLUDED.pode_excluir
        `, [papel, recurso.id, podeVisualizar, podeCriar, podeEditar, podeExcluir]);
      }
      console.log(`✅ Permissões do papel "${papel}" configuradas`);
    }

    // Criar view
    await client.query(`
      CREATE OR REPLACE VIEW vw_permissoes_completas AS
      SELECT 
        p.id,
        p.papel,
        r.codigo as recurso_codigo,
        r.nome as recurso_nome,
        r.grupo as recurso_grupo,
        r.icone as recurso_icone,
        r.rota as recurso_rota,
        r.ordem,
        p.pode_visualizar,
        p.pode_criar,
        p.pode_editar,
        p.pode_excluir
      FROM permissoes p
      JOIN recursos r ON p.recurso_id = r.id
      WHERE r.ativo = true
      ORDER BY p.papel, r.ordem
    `);
    console.log('✅ View vw_permissoes_completas criada');

    // Criar trigger para atualizar timestamp
    await client.query(`
      CREATE OR REPLACE FUNCTION update_permissoes_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.atualizado_em = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS trigger_update_permissoes_timestamp ON permissoes
    `);

    await client.query(`
      CREATE TRIGGER trigger_update_permissoes_timestamp
        BEFORE UPDATE ON permissoes
        FOR EACH ROW
        EXECUTE FUNCTION update_permissoes_timestamp()
    `);
    console.log('✅ Trigger criado');

    // Verificar
    const { rows: stats } = await client.query(`
      SELECT papel, COUNT(*) as total 
      FROM permissoes 
      GROUP BY papel 
      ORDER BY papel
    `);
    
    console.log('\n📊 Resumo das permissões:');
    stats.forEach(s => console.log(`   ${s.papel}: ${s.total} recursos`));

    console.log('\n✨ Sistema de permissões criado com sucesso!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);
