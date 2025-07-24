-- Migration: 011_add_ativo_to_mensagens.sql
-- Adiciona coluna 'ativo' na tabela mensagens
-- Data: 2024

-- Adicionar coluna ativo com valor padrão true
ALTER TABLE mensagens 
ADD COLUMN IF NOT EXISTS ativo boolean NOT NULL DEFAULT true;

-- Criar índice para otimizar consultas por status ativo
CREATE INDEX IF NOT EXISTS idx_mensagens_ativo ON mensagens(ativo);

-- Atualizar registros existentes para garantir que todos tenham ativo = true
UPDATE mensagens SET ativo = true WHERE ativo IS NULL;

-- Verificar se a coluna foi adicionada corretamente
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'mensagens' 
AND column_name = 'ativo';

-- Exibir algumas mensagens para verificar
SELECT id, nome, ativo, created_at 
FROM mensagens 
ORDER BY ordem 
LIMIT 5;