-- Migration 066: Create ai_agent_log table for AI usage tracking
CREATE TABLE IF NOT EXISTS ai_agent_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  context VARCHAR(50) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  latency_ms INTEGER,
  estimated_cost NUMERIC(10,6),
  status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'error')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
);

CREATE INDEX IF NOT EXISTS idx_ai_agent_log_cliente ON ai_agent_log(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_log_lead ON ai_agent_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_log_context ON ai_agent_log(context);
CREATE INDEX IF NOT EXISTS idx_ai_agent_log_created ON ai_agent_log(created_at);

ALTER TABLE ai_agent_log DISABLE ROW LEVEL SECURITY;
