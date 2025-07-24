-- Migration: 002_create_mensagens
-- Description: Create mensagens table with ordem field and insert initial data
-- Dependencies: none

CREATE TABLE IF NOT EXISTS mensagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text,
  intervalo_numero integer NOT NULL, -- quantidade de tempo
  intervalo_tipo text NOT NULL CHECK (intervalo_tipo IN ('minutos', 'horas', 'dias')),
  texto_mensagem text NOT NULL,
  ordem integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true, -- status da mensagem (ativa/inativa)
  embedding vector(1536), -- campo para embedding da LLM
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create index on ordem field
CREATE INDEX IF NOT EXISTS idx_mensagens_ordem ON mensagens(ordem);

-- Create index on ativo field
CREATE INDEX IF NOT EXISTS idx_mensagens_ativo ON mensagens(ativo);

-- Insert initial data
INSERT INTO mensagens (nome, intervalo_numero, intervalo_tipo, texto_mensagem, ordem) VALUES
  ('Primeira Abordagem', 30, 'minutos', 'Olá! Obrigado pelo seu interesse em nossos serviços. Gostaria de agendar uma conversa?', 1),
  ('Follow-up 2h', 2, 'horas', 'Ainda tem interesse em conhecer nossa solução? Estamos aqui para ajudar!', 2),
  ('Última Tentativa', 1, 'dias', 'Esta é nossa última tentativa de contato. Caso tenha interesse, entre em contato conosco.', 3),
  ('Follow-up Qualificados', 15, 'minutos', 'Mensagem de follow-up personalizada para leads qualificados.', 4),
  ('Reengajamento', 4, 'horas', 'Mensagem de reengajamento para leads inativos.', 5)
ON CONFLICT (nome) DO NOTHING;