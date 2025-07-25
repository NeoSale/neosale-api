-- Migration: 012_create_configuracoes_followup
-- Description: Create configuracoes_followup table for follow-up specific configurations
-- Dependencies: none

CREATE TABLE IF NOT EXISTS configuracoes_followup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  horario_inicio time NOT NULL DEFAULT '08:00:00',
  horario_fim time NOT NULL DEFAULT '18:00:00',
  qtd_envio_diario integer NOT NULL DEFAULT 30,
  somente_dias_uteis boolean NOT NULL DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_configuracoes_followup_horarios ON configuracoes_followup(horario_inicio, horario_fim);

-- Insert default configuration values
INSERT INTO configuracoes_followup (horario_inicio, horario_fim, qtd_envio_diario, somente_dias_uteis) VALUES 
  ('08:00:00', '18:00:00', 30, true)
ON CONFLICT DO NOTHING;