-- Migration: 008_create_etapas_funil
-- Description: Create etapas_funil table and insert initial data
-- Dependencies: none

CREATE TABLE IF NOT EXISTS etapas_funil (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE,
  embedding vector(1536) -- campo para embedding da LLM
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_etapas_funil_nome ON etapas_funil(nome);
CREATE INDEX IF NOT EXISTS idx_etapas_funil_embedding ON etapas_funil USING ivfflat (embedding vector_cosine_ops);

-- Insert initial data
INSERT INTO etapas_funil (id, nome) VALUES
  (gen_random_uuid(), 'lead'),
  (gen_random_uuid(), 'qualificacao'),
  (gen_random_uuid(), 'reuniao'),
  (gen_random_uuid(), 'apresentacao'),
  (gen_random_uuid(), 'negociacao'),
  (gen_random_uuid(), 'fechamento')
ON CONFLICT (nome) DO NOTHING;