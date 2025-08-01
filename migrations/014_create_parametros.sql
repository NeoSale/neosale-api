-- Migration: 014_create_parametros
-- Description: Create parametros table and insert initial data
-- Dependencies: 004_create_clientes

CREATE TABLE IF NOT EXISTS parametros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chave varchar(255) NOT NULL,
  valor text,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE, -- referência ao cliente proprietário
  embedding vector(1536), -- campo para embedding da LLM
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parametros_cliente_id ON parametros(cliente_id);
CREATE INDEX IF NOT EXISTS idx_parametros_embedding ON parametros USING ivfflat (embedding vector_cosine_ops);

-- Create unique constraint for chave and cliente_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_parametros_chave_cliente_unique ON parametros(chave, cliente_id);

-- Insert initial configuration data
INSERT INTO parametros (chave, valor) VALUES
  ('limite_envios_diarios', '50'),
  ('horario_inicio_envios', '08:00'),
  ('horario_fim_envios', '18:00'),
  ('envia_somente_dias_uteis', 'true'),
  ('webhook_url', 'https://project-neosale-n8n.lkqho4.easypanel.host/webhook'),

ON CONFLICT DO NOTHING;