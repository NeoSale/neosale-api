-- Migration: 034_alter_agentes_add_base_id
-- Description: Add base_id field to agentes table
-- Dependencies: 025_create_agentes, 029_create_base

-- Add base_id column to agentes table
ALTER TABLE agentes 
ADD COLUMN IF NOT EXISTS base_id jsonb;

-- Add comment to the column
COMMENT ON COLUMN agentes.base_id IS 'Lista de IDs de bases associadas ao agente';

-- Create GIN index for better JSONB query performance
CREATE INDEX IF NOT EXISTS idx_agentes_base_id_jsonb ON agentes USING gin (base_id);
