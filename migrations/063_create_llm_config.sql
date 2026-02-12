-- Migration 063: Create llm_config table for per-client LLM provider configuration
CREATE TABLE IF NOT EXISTS llm_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL DEFAULT 'openai'
    CHECK (provider IN ('openai', 'anthropic', 'google')),
  model VARCHAR(100) NOT NULL DEFAULT 'gpt-4.1-mini',
  api_key TEXT NOT NULL,
  temperature NUMERIC(3,2) DEFAULT 0.7
    CHECK (temperature >= 0 AND temperature <= 2),
  max_tokens INTEGER DEFAULT 1024
    CHECK (max_tokens > 0 AND max_tokens <= 128000),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  UNIQUE(cliente_id)
);

CREATE INDEX IF NOT EXISTS idx_llm_config_cliente ON llm_config(cliente_id);
ALTER TABLE llm_config DISABLE ROW LEVEL SECURITY;
