-- =====================================================
-- ATUALIZAÇÃO DA VIEW DE PERMISSÕES PARA CONSIDERAR EMPRESA
-- =====================================================

-- Esta view agora retorna permissões específicas da empresa quando disponível,
-- caso contrário retorna permissões globais (sistema)

DROP VIEW IF EXISTS vw_permissoes_completas CASCADE;

CREATE OR REPLACE VIEW vw_permissoes_completas AS
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
ORDER BY p.papel, r.ordem;

-- =====================================================
-- FUNCTION PARA BUSCAR PERMISSÕES CONSIDERANDO EMPRESA
-- =====================================================

-- Remover função antiga se existir
DROP FUNCTION IF EXISTS get_permissoes_usuario(VARCHAR, INTEGER, INTEGER);

-- Esta função retorna as permissões corretas baseado na hierarquia:
-- 1. Permissões específicas da empresa (empresa_id e papel_empresa_id)
-- 2. Permissões específicas do papel na empresa (empresa_id, sem papel_empresa_id)
-- 3. Permissões globais do papel (sem empresa_id e sem papel_empresa_id)

CREATE OR REPLACE FUNCTION get_permissoes_usuario(
    p_papel VARCHAR(50),
    p_empresa_id INTEGER DEFAULT NULL,
    p_papel_empresa_id INTEGER DEFAULT NULL
)
RETURNS TABLE (
    id INTEGER,
    papel VARCHAR(50),
    empresa_id INTEGER,
    papel_empresa_id INTEGER,
    papel_customizado_codigo VARCHAR(50),
    papel_customizado_nome VARCHAR(100),
    recurso_id INTEGER,
    recurso_codigo VARCHAR(100),
    recurso_nome VARCHAR(255),
    recurso_descricao TEXT,
    recurso_grupo VARCHAR(100),
    recurso_icone VARCHAR(50),
    recurso_rota VARCHAR(255),
    ordem INTEGER,
    pode_visualizar BOOLEAN,
    pode_criar BOOLEAN,
    pode_editar BOOLEAN,
    pode_excluir BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH permissoes_ordenadas AS (
        SELECT DISTINCT ON (r.id)
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
            -- Ordem de prioridade:
            -- 1. Permissões com papel_empresa_id específico (mais específica)
            -- 2. Permissões com empresa_id mas sem papel_empresa_id
            -- 3. Permissões globais (sem empresa_id e sem papel_empresa_id)
            CASE 
                WHEN p.papel_empresa_id = p_papel_empresa_id AND p.papel_empresa_id IS NOT NULL THEN 1
                WHEN p.empresa_id = p_empresa_id AND p.papel_empresa_id IS NULL THEN 2
                WHEN p.empresa_id IS NULL AND p.papel_empresa_id IS NULL THEN 3
                ELSE 4
            END as prioridade
        FROM permissoes p
        JOIN recursos r ON p.recurso_id = r.id
        LEFT JOIN papeis_empresa pe ON p.papel_empresa_id = pe.id
        WHERE r.ativo = true
            AND p.papel = p_papel
            AND (
                -- Permissão específica do papel customizado da empresa
                (p.papel_empresa_id = p_papel_empresa_id AND p.papel_empresa_id IS NOT NULL)
                OR
                -- Permissão do papel padrão na empresa específica
                (p.empresa_id = p_empresa_id AND p.papel_empresa_id IS NULL)
                OR
                -- Permissão global do papel (sistema)
                (p.empresa_id IS NULL AND p.papel_empresa_id IS NULL)
            )
        ORDER BY r.id, prioridade ASC
    )
    SELECT 
        po.id,
        po.papel,
        po.empresa_id,
        po.papel_empresa_id,
        po.papel_customizado_codigo,
        po.papel_customizado_nome,
        po.recurso_id,
        po.recurso_codigo,
        po.recurso_nome,
        po.recurso_descricao,
        po.recurso_grupo,
        po.recurso_icone,
        po.recurso_rota,
        po.ordem,
        po.pode_visualizar,
        po.pode_criar,
        po.pode_editar,
        po.pode_excluir
    FROM permissoes_ordenadas po
    ORDER BY po.ordem;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- EXEMPLOS DE USO
-- =====================================================

-- Buscar permissões de um profissional da empresa 1
-- SELECT * FROM get_permissoes_usuario('profissional', 1, NULL);

-- Buscar permissões de um papel customizado
-- SELECT * FROM get_permissoes_usuario('vendedor', 1, 5);

-- Buscar permissões globais de gerente
-- SELECT * FROM get_permissoes_usuario('gerente', NULL, NULL);
