-- Migration: 014_create_configuracoes
-- Description: Create configuracoes table and insert initial data
-- Dependencies: 004_create_clientes

CREATE TABLE IF NOT EXISTS configuracoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chave varchar(255) NOT NULL,
  valor text,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE, -- referência ao cliente proprietário
  embedding vector(1536), -- campo para embedding da LLM
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_configuracoes_cliente_id ON configuracoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_configuracoes_embedding ON configuracoes USING ivfflat (embedding vector_cosine_ops);

-- Create unique constraint for chave and cliente_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_configuracoes_chave_cliente_unique ON configuracoes(chave, cliente_id);

-- Insert initial configuration data
INSERT INTO configuracoes (chave, valor) VALUES
  ('limite_envios_diarios', '100'),
  ('horario_inicio_envios', '08:00'),
  ('horario_fim_envios', '18:00'),
  ('intervalo_entre_mensagens', '60'),
  ('webhook_url', ''),
  ('api_key_evolution', ''),
  ('instancia_evolution', '')
ON CONFLICT DO NOTHING;