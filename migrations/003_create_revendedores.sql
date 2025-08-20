-- Migration: 003_create_revendedores
-- Description: Create revendedores table
-- Dependencies: none

CREATE TABLE IF NOT EXISTS revendedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar(255) NOT NULL,
  email varchar(255) NOT NULL UNIQUE,
  telefone varchar(20),
  nickname varchar(100) UNIQUE,
  status varchar(50) NOT NULL DEFAULT 'ativo',
  embedding vector(1536), -- campo para embedding da LLM
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_revendedores_email ON revendedores(email);
CREATE INDEX IF NOT EXISTS idx_revendedores_nickname ON revendedores(nickname);
CREATE INDEX IF NOT EXISTS idx_revendedores_status ON revendedores(status);
CREATE INDEX IF NOT EXISTS idx_revendedores_embedding ON revendedores USING ivfflat (embedding vector_cosine_ops);