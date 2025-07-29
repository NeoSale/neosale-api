-- Migration: 005_create_usuarios
-- Description: Create usuarios table
-- Dependencies: 001_create_provedores, 002_create_tipos_acesso, 003_create_revendedores, 004_create_clientes

CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar(255) NOT NULL,
  email varchar(255) NOT NULL UNIQUE,
  telefone varchar(20),
  provedor_id uuid REFERENCES provedores(id) ON DELETE RESTRICT,
  tipo_acesso_id uuid REFERENCES tipos_acesso(id) ON DELETE RESTRICT,
  revendedor_id uuid REFERENCES revendedores(id) ON DELETE SET NULL,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE, -- referência ao cliente proprietário
  ativo boolean NOT NULL DEFAULT true,
  embedding vector(1536), -- campo para embedding da LLM
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_provedor ON usuarios(provedor_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo_acesso ON usuarios(tipo_acesso_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_revendedor ON usuarios(revendedor_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_cliente_id ON usuarios(cliente_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);
CREATE INDEX IF NOT EXISTS idx_usuarios_embedding ON usuarios USING ivfflat (embedding vector_cosine_ops);