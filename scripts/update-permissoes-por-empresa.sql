-- =====================================================
-- ATUALIZAÇÃO DO SISTEMA DE PERMISSÕES
-- Permissões por empresa + Papéis customizados
-- =====================================================

-- 1. Criar tabela de papéis customizados por empresa
CREATE TABLE IF NOT EXISTS papeis_empresa (
    id SERIAL PRIMARY KEY,
    empresa_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,          -- Ex: 'supervisor', 'caixa', 'estoquista'
    nome VARCHAR(100) NOT NULL,           -- Nome amigável
    descricao TEXT,
    cor VARCHAR(20) DEFAULT 'default',    -- Cor para exibição (primary, secondary, etc)
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(empresa_id, codigo)
);

-- 2. Adicionar empresa_id na tabela de permissões (nullable para permissões globais)
-- Primeiro verificar se a coluna já existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'permissoes' AND column_name = 'empresa_id') THEN
        ALTER TABLE permissoes ADD COLUMN empresa_id INT REFERENCES empresas(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Adicionar papel_empresa_id para vincular a papéis customizados
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'permissoes' AND column_name = 'papel_empresa_id') THEN
        ALTER TABLE permissoes ADD COLUMN papel_empresa_id INT REFERENCES papeis_empresa(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Remover constraint unique antiga e criar nova
ALTER TABLE permissoes DROP CONSTRAINT IF EXISTS permissoes_papel_recurso_id_key;
ALTER TABLE permissoes ADD CONSTRAINT permissoes_unique_key 
    UNIQUE NULLS NOT DISTINCT (papel, recurso_id, empresa_id, papel_empresa_id);

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_permissoes_empresa ON permissoes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_permissoes_papel_empresa ON permissoes(papel_empresa_id);
CREATE INDEX IF NOT EXISTS idx_papeis_empresa_empresa ON papeis_empresa(empresa_id);

-- 6. Adicionar papel_empresa_id na tabela usuarios (para papéis customizados)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'papel_empresa_id') THEN
        ALTER TABLE usuarios ADD COLUMN papel_empresa_id INT REFERENCES papeis_empresa(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 7. Atualizar/Criar view de permissões completas
DROP VIEW IF EXISTS vw_permissoes_completas;
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
ORDER BY r.ordem;

-- 8. Função para copiar permissões padrão para uma nova empresa
CREATE OR REPLACE FUNCTION copiar_permissoes_para_empresa(p_empresa_id INT, p_papel VARCHAR(50)) 
RETURNS void AS $$
DECLARE
    r RECORD;
    perm RECORD;
BEGIN
    -- Para cada recurso, copiar permissões do papel padrão (onde empresa_id IS NULL)
    FOR r IN SELECT id FROM recursos WHERE ativo = true LOOP
        -- Buscar permissão padrão deste papel
        SELECT * INTO perm FROM permissoes 
        WHERE papel = p_papel 
        AND recurso_id = r.id 
        AND empresa_id IS NULL
        AND papel_empresa_id IS NULL
        LIMIT 1;
        
        IF FOUND THEN
            -- Inserir permissão para a empresa
            INSERT INTO permissoes (papel, recurso_id, empresa_id, pode_visualizar, pode_criar, pode_editar, pode_excluir)
            VALUES (p_papel, r.id, p_empresa_id, perm.pode_visualizar, perm.pode_criar, perm.pode_editar, perm.pode_excluir)
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 9. Função para criar permissões para um papel customizado
CREATE OR REPLACE FUNCTION criar_permissoes_papel_customizado(p_papel_empresa_id INT, p_base_papel VARCHAR(50) DEFAULT 'atendente') 
RETURNS void AS $$
DECLARE
    r RECORD;
    perm RECORD;
    v_empresa_id INT;
BEGIN
    -- Buscar empresa_id do papel customizado
    SELECT empresa_id INTO v_empresa_id FROM papeis_empresa WHERE id = p_papel_empresa_id;
    
    IF v_empresa_id IS NULL THEN
        RAISE EXCEPTION 'Papel customizado não encontrado';
    END IF;
    
    -- Para cada recurso, criar permissão baseada no papel base
    FOR r IN SELECT id FROM recursos WHERE ativo = true LOOP
        -- Buscar permissão do papel base (da empresa ou padrão)
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
            -- Se não encontrou, criar sem permissões
            INSERT INTO permissoes (papel_empresa_id, recurso_id, empresa_id, pode_visualizar, pode_criar, pode_editar, pode_excluir)
            VALUES (p_papel_empresa_id, r.id, v_empresa_id, false, false, false, false)
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 10. Atualizar as permissões padrão (globais, sem empresa_id)
-- Garantir que permissões globais existam para papéis do sistema
CREATE OR REPLACE FUNCTION atualizar_permissoes_sistema() RETURNS void AS $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id, codigo FROM recursos WHERE ativo = true LOOP
        -- ADMIN - acesso total a TUDO (incluindo empresas)
        INSERT INTO permissoes (papel, recurso_id, empresa_id, pode_visualizar, pode_criar, pode_editar, pode_excluir)
        VALUES ('admin', r.id, NULL, true, true, true, true)
        ON CONFLICT (papel, recurso_id, empresa_id, papel_empresa_id) DO UPDATE SET
            pode_visualizar = true, pode_criar = true, pode_editar = true, pode_excluir = true;

        -- GERENTE - acesso a tudo EXCETO empresas (pode gerenciar permissões da sua empresa)
        INSERT INTO permissoes (papel, recurso_id, empresa_id, pode_visualizar, pode_criar, pode_editar, pode_excluir)
        VALUES ('gerente', r.id, NULL,
            r.codigo != 'empresas',
            r.codigo != 'empresas',
            r.codigo != 'empresas',
            r.codigo != 'empresas'
        )
        ON CONFLICT (papel, recurso_id, empresa_id, papel_empresa_id) DO UPDATE SET
            pode_visualizar = r.codigo != 'empresas',
            pode_criar = r.codigo != 'empresas',
            pode_editar = r.codigo != 'empresas',
            pode_excluir = r.codigo != 'empresas';

        -- PROFISSIONAL - acesso limitado
        INSERT INTO permissoes (papel, recurso_id, empresa_id, pode_visualizar, pode_criar, pode_editar, pode_excluir)
        VALUES ('profissional', r.id, NULL,
            r.codigo IN ('dashboard', 'agendamentos', 'minha-conta', 'clientes'),
            r.codigo IN ('agendamentos'),
            r.codigo IN ('agendamentos', 'minha-conta'),
            false
        )
        ON CONFLICT (papel, recurso_id, empresa_id, papel_empresa_id) DO UPDATE SET
            pode_visualizar = r.codigo IN ('dashboard', 'agendamentos', 'minha-conta', 'clientes'),
            pode_criar = r.codigo IN ('agendamentos'),
            pode_editar = r.codigo IN ('agendamentos', 'minha-conta'),
            pode_excluir = false;

        -- ATENDENTE - acesso básico
        INSERT INTO permissoes (papel, recurso_id, empresa_id, pode_visualizar, pode_criar, pode_editar, pode_excluir)
        VALUES ('atendente', r.id, NULL,
            r.codigo IN ('dashboard', 'clientes', 'pedidos', 'agendamentos', 'historico-conversas', 'minha-conta'),
            r.codigo IN ('clientes', 'pedidos', 'agendamentos'),
            r.codigo IN ('clientes', 'pedidos', 'agendamentos', 'minha-conta'),
            false
        )
        ON CONFLICT (papel, recurso_id, empresa_id, papel_empresa_id) DO UPDATE SET
            pode_visualizar = r.codigo IN ('dashboard', 'clientes', 'pedidos', 'agendamentos', 'historico-conversas', 'minha-conta'),
            pode_criar = r.codigo IN ('clientes', 'pedidos', 'agendamentos'),
            pode_editar = r.codigo IN ('clientes', 'pedidos', 'agendamentos', 'minha-conta'),
            pode_excluir = false;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Executar atualização
SELECT atualizar_permissoes_sistema();

-- 11. Remover papéis antigos que não existem mais
DELETE FROM permissoes WHERE papel = 'admin_global';

-- 12. Criar view para listar papéis disponíveis por empresa
CREATE OR REPLACE VIEW vw_papeis_disponiveis AS
SELECT 
    'admin' as codigo,
    'Administrador' as nome,
    'Acesso total ao sistema' as descricao,
    'primary' as cor,
    NULL::INT as empresa_id,
    true as is_sistema
UNION ALL
SELECT 
    'gerente' as codigo,
    'Gerente' as nome,
    'Gerencia a empresa (exceto cadastro de empresas)' as descricao,
    'secondary' as cor,
    NULL::INT as empresa_id,
    true as is_sistema
UNION ALL
SELECT 
    'profissional' as codigo,
    'Profissional' as nome,
    'Acesso à agenda e clientes' as descricao,
    'success' as cor,
    NULL::INT as empresa_id,
    true as is_sistema
UNION ALL
SELECT 
    'atendente' as codigo,
    'Atendente' as nome,
    'Acesso básico para atendimento' as descricao,
    'warning' as cor,
    NULL::INT as empresa_id,
    true as is_sistema
UNION ALL
SELECT 
    pe.codigo,
    pe.nome,
    pe.descricao,
    pe.cor,
    pe.empresa_id,
    false as is_sistema
FROM papeis_empresa pe
WHERE pe.ativo = true;

COMMIT;
