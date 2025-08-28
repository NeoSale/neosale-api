-- Migration: 018_create_configuracoes
-- Description: Create configuracoes table and insert initial data
-- Dependencies: 004_create_clientes

CREATE TABLE IF NOT EXISTS configuracoes (
  cliente_id UUID PRIMARY KEY REFERENCES clientes(id) ON DELETE CASCADE, -- referência ao cliente proprietário (chave primária)
  horario_inicio integer NOT NULL DEFAULT 8,
  horario_fim integer NOT NULL DEFAULT 18,
  qtd_envio_diario integer NOT NULL DEFAULT 50,
  somente_dias_uteis boolean NOT NULL DEFAULT true,
  apiKeyOpenAI text,
  PromptSDR text,
  PromptCalendar text,
  UsaCalendar boolean NOT NULL DEFAULT false,
  embedding vector(1536), -- campo para embedding da LLM
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_configuracoes_horarios ON configuracoes(horario_inicio, horario_fim);
CREATE INDEX IF NOT EXISTS idx_configuracoes_embedding ON configuracoes USING ivfflat (embedding vector_cosine_ops);