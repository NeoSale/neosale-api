-- Migration: 018_create_configuracoes
-- Description: Create configuracoes table and insert initial data
-- Dependencies: 004_create_clientes

CREATE TABLE IF NOT EXISTS configuracoes (
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
CREATE INDEX IF NOT EXISTS idx_configuracoes_horarios ON configuracoes(horario_inicio, horario_fim);
CREATE INDEX IF NOT EXISTS idx_configuracoes_cliente_id ON configuracoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_configuracoes_embedding ON configuracoes USING ivfflat (embedding vector_cosine_ops);

-- Insert default configuration values
INSERT INTO configuracoes (horario_inicio, horario_fim, qtd_envio_diario, somente_dias_uteis) VALUES
  ('08:00:00', '18:00:00', 50, true)
ON CONFLICT DO NOTHING;