-- Migration: 004_create_clientes
-- Description: Create clientes table
-- Dependencies: 003_create_revendedores

CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar(255) NOT NULL,
  email varchar(255) NOT NULL UNIQUE,
  telefone varchar(20) NOT NULL,
  nickname varchar(100) UNIQUE,
  status varchar(50) NOT NULL DEFAULT 'ativo',
  revendedor_id uuid REFERENCES revendedores(id) ON DELETE SET NULL,
  embedding vector(1536), -- campo para embedding da LLM
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_nickname ON clientes(nickname);
CREATE INDEX IF NOT EXISTS idx_clientes_status ON clientes(status);
CREATE INDEX IF NOT EXISTS idx_clientes_revendedor ON clientes(revendedor_id);
CREATE INDEX IF NOT EXISTS idx_clientes_embedding ON clientes USING ivfflat (embedding vector_cosine_ops);