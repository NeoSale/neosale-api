-- Migration: 002_create_tipos_acesso
-- Description: Create tipos_acesso table for access types
-- Dependencies: none

CREATE TABLE IF NOT EXISTS tipos_acesso (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar(50) NOT NULL UNIQUE,
  descricao text,
  ativo boolean NOT NULL DEFAULT true,
  embedding vector(1536), -- campo para embedding da LLM
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tipos_acesso_nome ON tipos_acesso(nome);
CREATE INDEX IF NOT EXISTS idx_tipos_acesso_ativo ON tipos_acesso(ativo);
CREATE INDEX IF NOT EXISTS idx_tipos_acesso_embedding ON tipos_acesso USING ivfflat (embedding vector_cosine_ops);

-- Insert default tipos_acesso
INSERT INTO tipos_acesso (nome, descricao) VALUES 
  ('admin', 'Administrador do sistema'),
  ('revendedor', 'Usuário revendedor'),
  ('cliente', 'Usuário cliente')
ON CONFLICT (nome) DO NOTHING;