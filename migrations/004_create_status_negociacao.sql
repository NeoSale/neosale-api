-- Migration: 004_create_status_negociacao
-- Description: Create status_negociacao table and insert initial data
-- Dependencies: none

CREATE TABLE IF NOT EXISTS status_negociacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE
);

-- Insert initial data
INSERT INTO status_negociacao (id, nome) VALUES
  (gen_random_uuid(), 'em_aberto'),
  (gen_random_uuid(), 'em_andamento'),
  (gen_random_uuid(), 'perdido'),
  (gen_random_uuid(), 'fechado')
ON CONFLICT (nome) DO NOTHING;