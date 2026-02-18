-- Script de limpeza: Remove mensagens com mais de 90 dias
-- Executar periodicamente via cron ou agendador
-- Uso: psql -d sistema_whats -f scripts/cleanup-mensagens-90dias.sql

-- Deletar mensagens antigas
DELETE FROM mensagens_chat
WHERE criado_em < NOW() - INTERVAL '90 days';

-- Deletar contatos sem mensagens (conversas vazias após limpeza)
DELETE FROM chat_contatos c
WHERE NOT EXISTS (
    SELECT 1 FROM mensagens_chat m
    WHERE m.empresa_id = c.empresa_id AND m.remote_jid = c.remote_jid
);

-- Atualizar estatísticas das tabelas após deleção em massa
VACUUM ANALYZE mensagens_chat;
VACUUM ANALYZE chat_contatos;
