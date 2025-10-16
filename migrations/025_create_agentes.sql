-- Migration: 025_create_agentes
-- Description: Create agentes table for AI agents
-- Dependencies: 024_create_tipo_agentes

CREATE TABLE IF NOT EXISTS agentes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar(100) NOT NULL,
  cliente_id uuid NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo_agente_id uuid NOT NULL REFERENCES tipo_agentes(id) ON DELETE RESTRICT,
  prompt text,
  agendamento boolean NOT NULL DEFAULT false,
  prompt_agendamento text,
  prompt_seguranca text,
  base_id jsonb, -- lista de IDs de bases associadas
  ativo boolean NOT NULL DEFAULT true,
  deletado boolean NOT NULL DEFAULT false,
  embedding vector(1536), -- campo para embedding da LLM
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agentes_nome ON agentes(nome);
CREATE INDEX IF NOT EXISTS idx_agentes_cliente_id ON agentes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_agentes_tipo_agente_id ON agentes(tipo_agente_id);
CREATE INDEX IF NOT EXISTS idx_agentes_ativo ON agentes(ativo);
CREATE INDEX IF NOT EXISTS idx_agentes_agendamento ON agentes(agendamento);
CREATE INDEX IF NOT EXISTS idx_agentes_base_id_jsonb ON agentes USING gin (base_id);
CREATE INDEX IF NOT EXISTS idx_agentes_embedding ON agentes USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);