-- Migration: 007_create_mensagens
-- Description: Create mensagens table and insert initial data
-- Dependencies: 004_create_clientes

CREATE TABLE IF NOT EXISTS mensagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  intervalo_numero integer NOT NULL DEFAULT 1,
  intervalo_tipo varchar(20) NOT NULL DEFAULT 'minutos' CHECK (intervalo_tipo IN ('segundos', 'minutos', 'horas', 'dias')),
  texto_mensagem text NOT NULL,
  ordem integer NOT NULL DEFAULT 1,
  ativo boolean NOT NULL DEFAULT true,
  deletado boolean NOT NULL DEFAULT false,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE, -- referência ao cliente proprietário (nullable para mensagens padrão)
  embedding vector(1536), -- campo para embedding da LLM
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
);

-- Alter existing table to allow NULL in cliente_id if it exists
ALTER TABLE mensagens ALTER COLUMN cliente_id DROP NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mensagens_ordem ON mensagens(ordem);
CREATE INDEX IF NOT EXISTS idx_mensagens_ativo ON mensagens(ativo);
CREATE INDEX IF NOT EXISTS idx_mensagens_deletado ON mensagens(deletado);
CREATE INDEX IF NOT EXISTS idx_mensagens_cliente_id ON mensagens(cliente_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_embedding ON mensagens USING ivfflat (embedding vector_cosine_ops);
