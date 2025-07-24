-- Migration: 005_create_qualificacao
-- Description: Create qualificacao table and insert initial data
-- Dependencies: none

CREATE TABLE IF NOT EXISTS qualificacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE
);

-- Insert initial data
INSERT INTO qualificacao (nome) VALUES
  ('Desafios'),
  ('Urgência'),
  ('Decisor')
ON CONFLICT (nome) DO NOTHING;