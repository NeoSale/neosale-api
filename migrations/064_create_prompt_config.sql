-- Migration 064: Create prompt_config and prompt_history tables for per-client prompt management
CREATE TABLE IF NOT EXISTS prompt_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  context VARCHAR(50) NOT NULL
    CHECK (context IN ('follow_up', 'prospeccao', 'google_calendar')),
  prompt TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  UNIQUE(cliente_id, context)
);

CREATE TABLE IF NOT EXISTS prompt_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_config_id UUID NOT NULL REFERENCES prompt_config(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  previous_prompt TEXT NOT NULL,
  changed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
);

CREATE INDEX IF NOT EXISTS idx_prompt_config_cliente ON prompt_config(cliente_id);
CREATE INDEX IF NOT EXISTS idx_prompt_config_context ON prompt_config(cliente_id, context);
CREATE INDEX IF NOT EXISTS idx_prompt_history_config ON prompt_history(prompt_config_id);

ALTER TABLE prompt_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_history DISABLE ROW LEVEL SECURITY;
