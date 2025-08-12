-- Migration: 013_create_controle_envios_diarios
-- Description: Create controle_envios_diarios table
-- Dependencies: 004_create_clientes

CREATE TABLE IF NOT EXISTS controle_envios_diarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data date NOT NULL,
  quantidade_enviada integer NOT NULL DEFAULT 0,
  limite_diario integer NOT NULL DEFAULT 100,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE, -- referência ao cliente proprietário
  embedding vector(1536), -- campo para embedding da LLM
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_controle_envios_data ON controle_envios_diarios(data);
CREATE INDEX IF NOT EXISTS idx_controle_envios_cliente_id ON controle_envios_diarios(cliente_id);
CREATE INDEX IF NOT EXISTS idx_controle_envios_embedding ON controle_envios_diarios USING ivfflat (embedding vector_cosine_ops);

-- Create unique constraint for data and cliente_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_controle_envios_data_cliente_unique ON controle_envios_diarios(data, cliente_id);