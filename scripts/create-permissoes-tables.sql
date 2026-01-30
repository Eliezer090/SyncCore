-- =====================================================
-- SISTEMA DE PERMISSÕES DINÂMICAS
-- Execute este script no banco de dados PostgreSQL
-- =====================================================

-- Tabela de recursos (menus/funcionalidades do sistema)
CREATE TABLE IF NOT EXISTS recursos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(100) NOT NULL UNIQUE,  -- Ex: 'clientes', 'produtos', 'pedidos'
    nome VARCHAR(200) NOT NULL,           -- Ex: 'Clientes', 'Produtos', 'Pedidos'
    descricao TEXT,
    grupo VARCHAR(100),                    -- Ex: 'Geral', 'Produtos & Pedidos', 'Serviços'
    icone VARCHAR(50),                     -- Ícone do menu
    rota VARCHAR(200),                     -- Rota do frontend
    ordem INT DEFAULT 0,                   -- Ordem de exibição no menu
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de permissões (papel + recurso + ações)
CREATE TABLE IF NOT EXISTS permissoes (
    id SERIAL PRIMARY KEY,
    papel VARCHAR(50) NOT NULL,           -- 'admin_global', 'admin', 'gerente', 'profissional', 'atendente'
    recurso_id INT NOT NULL REFERENCES recursos(id) ON DELETE CASCADE,
    pode_visualizar BOOLEAN DEFAULT false,
    pode_criar BOOLEAN DEFAULT false,
    pode_editar BOOLEAN DEFAULT false,
    pode_excluir BOOLEAN DEFAULT false,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(papel, recurso_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_permissoes_papel ON permissoes(papel);
CREATE INDEX IF NOT EXISTS idx_permissoes_recurso ON permissoes(recurso_id);
CREATE INDEX IF NOT EXISTS idx_recursos_codigo ON recursos(codigo);
CREATE INDEX IF NOT EXISTS idx_recursos_grupo ON recursos(grupo);

-- =====================================================
-- INSERIR RECURSOS DO SISTEMA
-- =====================================================

INSERT INTO recursos (codigo, nome, descricao, grupo, icone, rota, ordem) VALUES
-- Geral
('dashboard', 'Dashboard', 'Painel principal com visão geral', 'Geral', 'chart-pie', '/dashboard', 1),
('empresas', 'Empresas', 'Gerenciamento de empresas', 'Geral', 'buildings', '/dashboard/empresas', 2),
('clientes', 'Clientes', 'Gerenciamento de clientes', 'Geral', 'users-four', '/dashboard/clientes', 3),
('usuarios', 'Usuários', 'Gerenciamento de usuários do sistema', 'Geral', 'user-circle', '/dashboard/usuarios', 4),
('enderecos', 'Endereços', 'Gerenciamento de endereços', 'Geral', 'map-pin', '/dashboard/enderecos', 5),
('horarios-empresa', 'Horários Empresa', 'Configuração de horários de funcionamento', 'Geral', 'clock', '/dashboard/horarios-empresa', 6),

-- Catálogo de Produtos
('categorias-produto', 'Categorias de Produto', 'Categorias para organizar produtos', 'Produtos & Pedidos', 'list-bullets', '/dashboard/categorias-produto', 10),
('produtos', 'Produtos', 'Cadastro de produtos', 'Produtos & Pedidos', 'cube', '/dashboard/produtos', 11),
('produto-variacoes', 'Variações de Produto', 'Variações de produtos (tamanho, cor, etc)', 'Produtos & Pedidos', 'cube', '/dashboard/produto-variacoes', 12),
('produto-adicionais', 'Adicionais de Produto', 'Itens adicionais para produtos', 'Produtos & Pedidos', 'cube', '/dashboard/produto-adicionais', 13),
('estoque', 'Estoque', 'Controle de estoque', 'Produtos & Pedidos', 'warehouse', '/dashboard/estoque', 14),

-- Vendas
('pedidos', 'Pedidos', 'Gerenciamento de pedidos', 'Produtos & Pedidos', 'shopping-cart', '/dashboard/pedidos', 20),
('pedido-itens', 'Itens do Pedido', 'Detalhes dos itens de pedidos', 'Produtos & Pedidos', 'shopping-cart', '/dashboard/pedido-itens', 21),
('pedido-item-adicionais', 'Adicionais do Item', 'Adicionais dos itens de pedidos', 'Produtos & Pedidos', 'shopping-cart', '/dashboard/pedido-item-adicionais', 22),
('pagamentos', 'Pagamentos', 'Gerenciamento de pagamentos', 'Produtos & Pedidos', 'credit-card', '/dashboard/pagamentos', 23),

-- Serviços
('servicos', 'Serviços', 'Cadastro de serviços', 'Serviços & Agenda', 'scissors', '/dashboard/servicos', 30),
('profissionais', 'Profissionais', 'Cadastro de profissionais', 'Serviços & Agenda', 'users', '/dashboard/profissionais', 31),
('servicos-profissional', 'Serviços do Profissional', 'Associar serviços aos profissionais', 'Serviços & Agenda', 'scissors', '/dashboard/servicos-profissional', 32),
('expediente-profissional', 'Expediente', 'Horários de trabalho dos profissionais', 'Serviços & Agenda', 'clock', '/dashboard/expediente-profissional', 33),
('bloqueios-profissional', 'Bloqueios', 'Bloqueios de agenda dos profissionais', 'Serviços & Agenda', 'prohibit', '/dashboard/bloqueios-profissional', 34),

-- Agenda
('agendamentos', 'Agendamentos', 'Gerenciamento de agendamentos', 'Serviços & Agenda', 'calendar', '/dashboard/agendamentos', 40),
('agendamento-servicos', 'Serviços do Agendamento', 'Serviços associados aos agendamentos', 'Serviços & Agenda', 'calendar', '/dashboard/agendamento-servicos', 41),

-- Comunicação
('historico-conversas', 'Histórico de Conversas', 'Histórico de conversas do WhatsApp', 'Comunicação', 'chat-circle', '/dashboard/historico-conversas', 50),

-- Configurações
('configuracoes', 'Configurações', 'Configurações do sistema', 'Configurações', 'gear-six', '/dashboard/settings', 60),
('minha-conta', 'Minha Conta', 'Perfil do usuário', 'Configurações', 'user', '/dashboard/account', 61),
('permissoes', 'Permissões', 'Gerenciamento de permissões', 'Configurações', 'shield-check', '/dashboard/permissoes', 62)

ON CONFLICT (codigo) DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    grupo = EXCLUDED.grupo,
    icone = EXCLUDED.icone,
    rota = EXCLUDED.rota,
    ordem = EXCLUDED.ordem;

-- =====================================================
-- PERMISSÕES PADRÃO POR PAPEL
-- =====================================================

-- Função para inserir permissões padrão
CREATE OR REPLACE FUNCTION inserir_permissoes_padrao() RETURNS void AS $$
DECLARE
    r RECORD;
BEGIN
    -- Para cada recurso, criar permissões para cada papel
    FOR r IN SELECT id, codigo FROM recursos LOOP
        -- ADMIN_GLOBAL - acesso total a tudo
        INSERT INTO permissoes (papel, recurso_id, pode_visualizar, pode_criar, pode_editar, pode_excluir)
        VALUES ('admin_global', r.id, true, true, true, true)
        ON CONFLICT (papel, recurso_id) DO NOTHING;

        -- ADMIN - acesso total exceto empresas e permissões
        INSERT INTO permissoes (papel, recurso_id, pode_visualizar, pode_criar, pode_editar, pode_excluir)
        VALUES ('admin', r.id, 
            r.codigo NOT IN ('empresas', 'permissoes'),
            r.codigo NOT IN ('empresas', 'permissoes'),
            r.codigo NOT IN ('empresas', 'permissoes'),
            r.codigo NOT IN ('empresas', 'permissoes')
        )
        ON CONFLICT (papel, recurso_id) DO NOTHING;

        -- GERENTE - acesso intermediário
        INSERT INTO permissoes (papel, recurso_id, pode_visualizar, pode_criar, pode_editar, pode_excluir)
        VALUES ('gerente', r.id,
            r.codigo NOT IN ('empresas', 'permissoes', 'usuarios'),
            r.codigo NOT IN ('empresas', 'permissoes', 'usuarios', 'configuracoes'),
            r.codigo NOT IN ('empresas', 'permissoes', 'usuarios', 'configuracoes'),
            r.codigo NOT IN ('empresas', 'permissoes', 'usuarios', 'configuracoes', 'produtos', 'servicos')
        )
        ON CONFLICT (papel, recurso_id) DO NOTHING;

        -- PROFISSIONAL - acesso limitado
        INSERT INTO permissoes (papel, recurso_id, pode_visualizar, pode_criar, pode_editar, pode_excluir)
        VALUES ('profissional', r.id,
            r.codigo IN ('dashboard', 'agendamentos', 'minha-conta', 'clientes'),
            r.codigo IN ('agendamentos'),
            r.codigo IN ('agendamentos', 'minha-conta'),
            false
        )
        ON CONFLICT (papel, recurso_id) DO NOTHING;

        -- ATENDENTE - acesso básico
        INSERT INTO permissoes (papel, recurso_id, pode_visualizar, pode_criar, pode_editar, pode_excluir)
        VALUES ('atendente', r.id,
            r.codigo IN ('dashboard', 'clientes', 'pedidos', 'agendamentos', 'historico-conversas', 'minha-conta'),
            r.codigo IN ('clientes', 'pedidos', 'agendamentos'),
            r.codigo IN ('clientes', 'pedidos', 'agendamentos', 'minha-conta'),
            false
        )
        ON CONFLICT (papel, recurso_id) DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Executar a função
SELECT inserir_permissoes_padrao();

-- =====================================================
-- VIEW PARA CONSULTA FÁCIL DE PERMISSÕES
-- =====================================================
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
ORDER BY p.papel, r.ordem;

-- =====================================================
-- TRIGGER PARA ATUALIZAR TIMESTAMP
-- =====================================================
CREATE OR REPLACE FUNCTION update_permissoes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_permissoes_timestamp ON permissoes;
CREATE TRIGGER trigger_update_permissoes_timestamp
    BEFORE UPDATE ON permissoes
    FOR EACH ROW
    EXECUTE FUNCTION update_permissoes_timestamp();

-- Verificar dados inseridos
SELECT papel, COUNT(*) as total_permissoes FROM permissoes GROUP BY papel ORDER BY papel;
