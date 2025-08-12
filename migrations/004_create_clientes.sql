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
  nome_responsavel_principal varchar(255),
  cnpj varchar(18),
  cep varchar(10),
  logradouro varchar(255),
  numero varchar(20),
  complemento varchar(100),
  cidade varchar(100),
  estado varchar(50),
  pais varchar(50) DEFAULT 'Brasil',
  espaco_fisico boolean DEFAULT false,
  site_oficial varchar(255),
  redes_sociais jsonb,
  horario_funcionamento jsonb,
  embedding vector(1536), -- campo para embedding da LLM
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_nickname ON clientes(nickname);
CREATE INDEX IF NOT EXISTS idx_clientes_status ON clientes(status);
CREATE INDEX IF NOT EXISTS idx_clientes_revendedor ON clientes(revendedor_id);
CREATE INDEX IF NOT EXISTS idx_clientes_cnpj ON clientes(cnpj);
CREATE INDEX IF NOT EXISTS idx_clientes_cep ON clientes(cep);
CREATE INDEX IF NOT EXISTS idx_clientes_cidade ON clientes(cidade);
CREATE INDEX IF NOT EXISTS idx_clientes_estado ON clientes(estado);
CREATE INDEX IF NOT EXISTS idx_clientes_espaco_fisico ON clientes(espaco_fisico);
CREATE INDEX IF NOT EXISTS idx_clientes_embedding ON clientes USING ivfflat (embedding vector_cosine_ops);

-- Add comments to document the JSON structure
COMMENT ON COLUMN clientes.redes_sociais IS 'JSON com estrutura: {"facebook": "https://facebook.com/empresa", "instagram": "https://instagram.com/empresa", "linkedin": "https://linkedin.com/company/empresa"}';
COMMENT ON COLUMN clientes.horario_funcionamento IS 'JSON com estrutura: {"segunda": "08:00-18:00", "terca": "08:00-18:00", "quarta": "08:00-18:00", "quinta": "08:00-18:00", "sexta": "08:00-18:00", "sabado": "08:00-12:00", "domingo": "fechado"}';