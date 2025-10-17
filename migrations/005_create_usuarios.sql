-- Migration: 005_create_usuarios
-- Description: Create usuarios table
-- Dependencies: 001_create_provedores, 002_create_tipos_acesso, 003_create_revendedores, 004_create_clientes

CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar(255) NOT NULL,
  email varchar(255) NOT NULL UNIQUE,
  telefone varchar(20),
  senha varchar(255), -- hash da senha (bcrypt)
  provedor_id uuid,
  tipo_acesso_id uuid,
  revendedor_id uuid,
  cliente_id UUID, -- referência ao cliente proprietário
  ativo boolean NOT NULL DEFAULT true,
  embedding vector(1536), -- campo para embedding da LLM
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
);

-- Add columns if they don't exist
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS provedor_id uuid;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS tipo_acesso_id uuid;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS revendedor_id uuid;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cliente_id UUID;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS senha varchar(255);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo');
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo');

-- Add foreign key constraints if they don't exist
DO $add_constraints$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'usuarios_provedor_id_fkey'
    ) THEN
        ALTER TABLE usuarios ADD CONSTRAINT usuarios_provedor_id_fkey 
        FOREIGN KEY (provedor_id) REFERENCES provedores(id) ON DELETE RESTRICT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'usuarios_tipo_acesso_id_fkey'
    ) THEN
        ALTER TABLE usuarios ADD CONSTRAINT usuarios_tipo_acesso_id_fkey 
        FOREIGN KEY (tipo_acesso_id) REFERENCES tipos_acesso(id) ON DELETE RESTRICT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'usuarios_revendedor_id_fkey'
    ) THEN
        ALTER TABLE usuarios ADD CONSTRAINT usuarios_revendedor_id_fkey 
        FOREIGN KEY (revendedor_id) REFERENCES revendedores(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'usuarios_cliente_id_fkey'
    ) THEN
        ALTER TABLE usuarios ADD CONSTRAINT usuarios_cliente_id_fkey 
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE;
    END IF;
END $add_constraints$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_telefone ON usuarios(telefone) WHERE telefone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_usuarios_senha ON usuarios(senha) WHERE senha IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_usuarios_provedor ON usuarios(provedor_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo_acesso ON usuarios(tipo_acesso_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_revendedor ON usuarios(revendedor_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_cliente_id ON usuarios(cliente_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);
CREATE INDEX IF NOT EXISTS idx_usuarios_embedding ON usuarios USING ivfflat (embedding vector_cosine_ops);