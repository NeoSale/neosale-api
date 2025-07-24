-- Migration: 003_create_etapas_funil
-- Description: Create etapas_funil table and insert initial data
-- Dependencies: none

CREATE TABLE IF NOT EXISTS etapas_funil (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE
);

-- Insert initial data
INSERT INTO etapas_funil (id, nome) VALUES
  (gen_random_uuid(), 'lead'),
  (gen_random_uuid(), 'qualificacao'),
  (gen_random_uuid(), 'reuniao'),
  (gen_random_uuid(), 'apresentacao'),
  (gen_random_uuid(), 'negociacao'),
  (gen_random_uuid(), 'fechamento')
ON CONFLICT (nome) DO NOTHING;