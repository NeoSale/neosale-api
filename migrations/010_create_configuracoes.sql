-- Migration: 010_create_configuracoes
-- Description: Create configuracoes table and insert initial configuration data
-- Dependencies: none

CREATE TABLE IF NOT EXISTS configuracoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chave text,
  valor text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create unique index on chave field
CREATE UNIQUE INDEX IF NOT EXISTS idx_configuracoes_chave ON configuracoes(chave);

-- Insert default configuration values
INSERT INTO configuracoes (chave, valor) VALUES 
  ('horario_inicio', '08:00:00'),
  ('horario_fim', '18:00:00'),
  ('quantidade_diaria_maxima', '30'),
  ('envia_somente_dias_uteis', 'true')
ON CONFLICT (chave) DO NOTHING;