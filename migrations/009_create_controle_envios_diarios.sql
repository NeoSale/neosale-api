-- Migration: 009_create_controle_envios_diarios
-- Description: Create controle_envios_diarios table
-- Dependencies: none

CREATE TABLE IF NOT EXISTS controle_envios_diarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data date NOT NULL UNIQUE, -- uma linha por dia
  quantidade_enviada integer DEFAULT 0,
  limite_diario integer NOT NULL,
  created_at timestamp DEFAULT now()
);

-- Create index on data field for better performance
CREATE INDEX IF NOT EXISTS idx_controle_envios_data ON controle_envios_diarios(data);