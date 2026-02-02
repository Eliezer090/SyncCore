-- Migration: Adicionar coluna url_foto na tabela clientes (se não existir)
-- Data: 2026-02-02
-- Descrição: Adiciona campo para foto de perfil do cliente

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'clientes' 
        AND column_name = 'url_foto'
    ) THEN
        ALTER TABLE clientes ADD COLUMN url_foto VARCHAR(500) NULL;
        RAISE NOTICE 'Coluna url_foto adicionada à tabela clientes';
    ELSE
        RAISE NOTICE 'Coluna url_foto já existe na tabela clientes';
    END IF;
END $$;
