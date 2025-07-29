-- Migration: 001_create_provedores
-- Description: Create provedores table for authentication providers
-- Dependencies: none

CREATE TABLE IF NOT EXISTS provedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar(50) NOT NULL UNIQUE,
  descricao text,
  ativo boolean NOT NULL DEFAULT true,
  embedding vector(1536), -- campo para embedding da LLM
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_provedores_nome ON provedores(nome);
CREATE INDEX IF NOT EXISTS idx_provedores_ativo ON provedores(ativo);
CREATE INDEX IF NOT EXISTS idx_provedores_embedding ON provedores USING ivfflat (embedding vector_cosine_ops);

-- Insert default provedores
INSERT INTO provedores (nome, descricao) VALUES 
  ('email', 'Autenticação por email e senha'),
  ('whatsapp', 'Autenticação via WhatsApp'),
  ('google', 'Autenticação via Google OAuth'),
  ('apple', 'Autenticação via Apple ID'),
  ('microsoft', 'Autenticação via Microsoft Account')
ON CONFLICT (nome) DO NOTHING;