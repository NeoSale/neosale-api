-- Migration: 019_create_evolution_api.sql
-- Description: Criar tabela evolution_api para gerenciar instâncias da Evolution API

-- Criar tabela evolution_api
CREATE TABLE IF NOT EXISTS evolution_api (
    id UUID PRIMARY KEY,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    instance_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_evolution_api_cliente_id ON evolution_api(cliente_id);
CREATE INDEX IF NOT EXISTS idx_evolution_api_instance_name ON evolution_api(instance_name);
CREATE INDEX IF NOT EXISTS idx_evolution_api_created_at ON evolution_api(created_at);

-- Add trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_evolution_api_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_evolution_api_updated_at
    BEFORE UPDATE ON evolution_api
    FOR EACH ROW
    EXECUTE FUNCTION update_evolution_api_updated_at();