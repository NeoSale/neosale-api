-- Migration: 015_create_configuracoes_followup
-- Description: Create configuracoes_followup table and insert initial data
-- Dependencies: 004_create_clientes

CREATE TABLE IF NOT EXISTS configuracoes_followup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  horario_inicio time NOT NULL DEFAULT '08:00:00',
  horario_fim time NOT NULL DEFAULT '18:00:00',
  qtd_envio_diario integer NOT NULL DEFAULT 30,
  somente_dias_uteis boolean NOT NULL DEFAULT true,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE, -- referência ao cliente proprietário
  embedding vector(1536), -- campo para embedding da LLM
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_configuracoes_followup_horarios ON configuracoes_followup(horario_inicio, horario_fim);
CREATE INDEX IF NOT EXISTS idx_configuracoes_followup_cliente_id ON configuracoes_followup(cliente_id);
CREATE INDEX IF NOT EXISTS idx_configuracoes_followup_embedding ON configuracoes_followup USING ivfflat (embedding vector_cosine_ops);

-- Insert default configuration values
INSERT INTO configuracoes_followup (horario_inicio, horario_fim, qtd_envio_diario, somente_dias_uteis) VALUES
  ('08:00:00', '18:00:00', 30, true)
ON CONFLICT DO NOTHING;