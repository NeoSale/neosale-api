-- Migration: 031_alter_qualificacao_remove_cliente_id
-- Description: Remove cliente_id column and add tipo_agente and descricao columns to qualificacao table
-- Dependencies: 010_create_qualificacao

-- Remove foreign key constraint if exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'qualificacao_cliente_id_fkey' 
        AND table_name = 'qualificacao'
    ) THEN
        ALTER TABLE qualificacao DROP CONSTRAINT qualificacao_cliente_id_fkey;
    END IF;
END $$;

-- Add new columns if they don't exist
ALTER TABLE qualificacao 
ADD COLUMN IF NOT EXISTS tipo_agente jsonb NOT NULL DEFAULT '["Todos"]',
ADD COLUMN IF NOT EXISTS descricao text NOT NULL DEFAULT '';

-- Remove cliente_id column if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'qualificacao' 
        AND column_name = 'cliente_id'
    ) THEN
        ALTER TABLE qualificacao DROP COLUMN cliente_id;
    END IF;
END $$;

-- Create index for tipo_agente if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_qualificacao_tipo_agente ON qualificacao USING gin(tipo_agente);

-- Update existing records to have proper values
UPDATE qualificacao 
SET 
    tipo_agente = CASE 
        WHEN nome IN ('Novo') THEN '["Todos"]'::jsonb
        WHEN nome IN ('Curioso', 'Indeciso', 'Engajado', 'Decidido', 'Desinteressado') THEN '["SDR", "Closer"]'::jsonb
        WHEN nome IN ('Frustrado') THEN '["SDR", "Closer", "Atendimento"]'::jsonb
        WHEN nome IN ('Atendimento', 'Problema', 'Satisfeito') THEN '["Atendimento"]'::jsonb
        ELSE '["Todos"]'::jsonb
    END,
    descricao = CASE 
        WHEN nome = 'Novo' THEN 'Lead ou cliente entrou, mas não interagiu'
        WHEN nome = 'Curioso' THEN 'Forneceu dados básicos, início da conversa'
        WHEN nome = 'Indeciso' THEN 'Identificou problema, mas não sabe se vai agir'
        WHEN nome = 'Engajado' THEN 'Entende impacto do problema, conversa avançando'
        WHEN nome = 'Decidido' THEN 'Quer resolver o problema; pronto para fechamento'
        WHEN nome = 'Frustrado' THEN 'Demonstrou insatisfação com atendimento ou processo'
        WHEN nome = 'Desinteressado' THEN 'Fora do perfil ou desistente'
        WHEN nome = 'Atendimento' THEN 'Está em conversa com equipe de suporte ou pré-venda'
        WHEN nome = 'Problema' THEN 'Cliente relatou um problema (ticket técnico, SAC, etc.)'
        WHEN nome = 'Satisfeito' THEN 'Cliente validou a solução ou finalizou a compra com sucesso'
        ELSE 'Descrição não definida'
    END
WHERE descricao = '' OR descricao IS NULL;

-- Remove the default values after updating existing records
ALTER TABLE qualificacao 
ALTER COLUMN tipo_agente DROP DEFAULT,
ALTER COLUMN descricao DROP DEFAULT;