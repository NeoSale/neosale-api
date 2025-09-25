-- Migration: 010_create_qualificacao
-- Description: Create qualificacao table and insert initial data
-- Dependencies: 004_create_clientes

CREATE TABLE IF NOT EXISTS qualificacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  embedding vector(1536), -- campo para embedding da LLM
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_qualificacao_nome ON qualificacao(nome);
CREATE INDEX IF NOT EXISTS idx_qualificacao_cliente_id ON qualificacao(cliente_id);
CREATE INDEX IF NOT EXISTS idx_qualificacao_embedding ON qualificacao USING ivfflat (embedding vector_cosine_ops);

-- Create unique constraint for nome and cliente_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_qualificacao_nome_cliente_unique ON qualificacao(nome, cliente_id);