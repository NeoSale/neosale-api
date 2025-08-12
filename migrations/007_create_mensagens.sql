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
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE, -- referência ao cliente proprietário (nullable para mensagens padrão)
  embedding vector(1536), -- campo para embedding da LLM
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Alter existing table to allow NULL in cliente_id if it exists
ALTER TABLE mensagens ALTER COLUMN cliente_id DROP NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mensagens_ordem ON mensagens(ordem);
CREATE INDEX IF NOT EXISTS idx_mensagens_ativo ON mensagens(ativo);
CREATE INDEX IF NOT EXISTS idx_mensagens_cliente_id ON mensagens(cliente_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_embedding ON mensagens USING ivfflat (embedding vector_cosine_ops);

-- Insert initial data (template messages without specific client)
INSERT INTO mensagens (nome, intervalo_numero, intervalo_tipo, texto_mensagem, ordem, ativo, cliente_id) VALUES
  ('Primeira mensagem', 1, 'minutos', 'Olá! Esta é a primeira mensagem do follow-up.', 1, true, NULL),
  ('Segunda mensagem', 5, 'minutos', 'Esta é a segunda mensagem, enviada 5 minutos após a primeira.', 2, true, NULL),
  ('Terceira mensagem', 1, 'horas', 'Esta é a terceira mensagem, enviada 1 hora após a segunda.', 3, true, NULL)
ON CONFLICT DO NOTHING;