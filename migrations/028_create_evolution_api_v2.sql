-- Migration: 028_create_evolution_api_v2.sql
-- Description: Criar tabela evolution_api_v2 para gerenciar instâncias da Evolution API V2

-- Criar tabela evolution_api_v2
CREATE TABLE IF NOT EXISTS evolution_api_v2 (
    id UUID PRIMARY KEY,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    instance_name VARCHAR(255),
    id_agente UUID REFERENCES agentes(id) ON DELETE SET NULL,
    followup BOOLEAN DEFAULT FALSE,
    qtd_envios_diarios INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_evolution_api_v2_cliente_id ON evolution_api_v2(cliente_id);
CREATE INDEX IF NOT EXISTS idx_evolution_api_v2_instance_name ON evolution_api_v2(instance_name);
CREATE INDEX IF NOT EXISTS idx_evolution_api_v2_id_agente ON evolution_api_v2(id_agente);
CREATE INDEX IF NOT EXISTS idx_evolution_api_v2_created_at ON evolution_api_v2(created_at);

-- Add trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_evolution_api_v2_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_update_evolution_api_v2_updated_at'
        AND event_object_table = 'evolution_api_v2'
    ) THEN
        CREATE TRIGGER trigger_update_evolution_api_v2_updated_at
            BEFORE UPDATE ON evolution_api_v2
            FOR EACH ROW
            EXECUTE FUNCTION update_evolution_api_v2_updated_at();
    END IF;
END $$;