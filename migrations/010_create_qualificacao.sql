-- Migration: 010_create_qualificacao
-- Description: Create qualificacao table and insert initial data
-- Dependencies: none

CREATE TABLE IF NOT EXISTS qualificacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE,
  embedding vector(1536) -- campo para embedding da LLM
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_qualificacao_nome ON qualificacao(nome);
CREATE INDEX IF NOT EXISTS idx_qualificacao_embedding ON qualificacao USING ivfflat (embedding vector_cosine_ops);

-- Insert initial data
INSERT INTO qualificacao (nome) VALUES
  ('Desafios'),
  ('Urgência'),
  ('Decisor')
ON CONFLICT (nome) DO NOTHING;