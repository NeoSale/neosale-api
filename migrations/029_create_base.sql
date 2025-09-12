-- Migration: 030_create_base
-- Description: Create base table for storing client base data
-- Dependencies: 004_create_clientes

CREATE TABLE IF NOT EXISTS base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar(255) NOT NULL,
  descricao text,
  cliente_id uuid NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_base_cliente_id ON base(cliente_id);
CREATE INDEX IF NOT EXISTS idx_base_nome ON base(nome);
CREATE INDEX IF NOT EXISTS idx_base_created_at ON base(created_at);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_base_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_base_updated_at
    BEFORE UPDATE ON base
    FOR EACH ROW
    EXECUTE FUNCTION update_base_updated_at();