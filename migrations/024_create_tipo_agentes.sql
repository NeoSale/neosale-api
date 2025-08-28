-- Migration: 024_create_tipo_agentes
-- Description: Create tipo_agentes table for agent types
-- Dependencies: none

CREATE TABLE IF NOT EXISTS tipo_agentes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar(50) NOT NULL UNIQUE,
  ativo boolean NOT NULL DEFAULT true,
  embedding vector(1536), -- campo para embedding da LLM
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tipo_agentes_nome ON tipo_agentes(nome);
CREATE INDEX IF NOT EXISTS idx_tipo_agentes_ativo ON tipo_agentes(ativo);
CREATE INDEX IF NOT EXISTS idx_tipo_agentes_embedding ON tipo_agentes USING ivfflat (embedding vector_cosine_ops);

-- Insert default tipo_agentes
INSERT INTO tipo_agentes (nome) VALUES 
  ('SDR'),
  ('Atendimento'),
  ('Closer')
ON CONFLICT (nome) DO NOTHING;