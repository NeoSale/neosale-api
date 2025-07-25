-- Migration: 013_create_user_management_tables
-- Description: Create user management tables (revendedores, clientes, usuarios) with relationship tables
-- Dependencies: none

-- Create provedores table for authentication providers
CREATE TABLE IF NOT EXISTS provedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar(50) NOT NULL UNIQUE,
  descricao text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create tipos_acesso table for access types
CREATE TABLE IF NOT EXISTS tipos_acesso (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar(50) NOT NULL UNIQUE,
  descricao text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create revendedores table
CREATE TABLE IF NOT EXISTS revendedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar(255) NOT NULL,
  email varchar(255) NOT NULL UNIQUE,
  telefone varchar(20),
  status varchar(50) NOT NULL DEFAULT 'ativo',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create clientes table
CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar(255) NOT NULL,
  email varchar(255) NOT NULL UNIQUE,
  telefone varchar(20),
  status varchar(50) NOT NULL DEFAULT 'ativo',
  revendedor_id uuid REFERENCES revendedores(id) ON DELETE SET NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create usuarios table
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar(255) NOT NULL,
  email varchar(255) NOT NULL UNIQUE,
  telefone varchar(20),
  provedor_id uuid REFERENCES provedores(id) ON DELETE RESTRICT,
  tipo_acesso_id uuid REFERENCES tipos_acesso(id) ON DELETE RESTRICT,
  revendedor_id uuid REFERENCES revendedores(id) ON DELETE SET NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_revendedores_email ON revendedores(email);
CREATE INDEX IF NOT EXISTS idx_revendedores_status ON revendedores(status);

CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_status ON clientes(status);
CREATE INDEX IF NOT EXISTS idx_clientes_revendedor ON clientes(revendedor_id);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_provedor ON usuarios(provedor_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo_acesso ON usuarios(tipo_acesso_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_revendedor ON usuarios(revendedor_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);

-- Insert default provedores
INSERT INTO provedores (nome, descricao) VALUES 
  ('email', 'Autenticação por email e senha'),
  ('whatsapp', 'Autenticação via WhatsApp'),
  ('google', 'Autenticação via Google OAuth'),
  ('apple', 'Autenticação via Apple ID'),
  ('microsoft', 'Autenticação via Microsoft Account')
ON CONFLICT (nome) DO NOTHING;

-- Insert default tipos_acesso
INSERT INTO tipos_acesso (nome, descricao) VALUES 
  ('admin', 'Administrador do sistema'),
  ('revendedor', 'Usuário revendedor'),
  ('cliente', 'Usuário cliente')
ON CONFLICT (nome) DO NOTHING;