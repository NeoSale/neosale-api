-- Migration 067: Create followup_config, followup_tracking, and followup_log tables

CREATE TABLE IF NOT EXISTS followup_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT false,
  max_attempts INTEGER DEFAULT 3 CHECK (max_attempts >= 1 AND max_attempts <= 10),
  intervals JSONB DEFAULT '[30, 240, 1440]',
  sending_schedule JSONB DEFAULT '{"segunda":"08:00-18:00","terca":"08:00-18:00","quarta":"08:00-18:00","quinta":"08:00-18:00","sexta":"08:00-18:00","sabado":"fechado","domingo":"fechado"}',
  daily_send_limit INTEGER DEFAULT 50 CHECK (daily_send_limit >= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  UNIQUE(cliente_id)
);

CREATE TABLE IF NOT EXISTS followup_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'idle'
    CHECK (status IN ('idle', 'waiting', 'in_progress', 'responded', 'exhausted', 'cancelled')),
  current_step INTEGER DEFAULT 0,
  next_send_at TIMESTAMP WITH TIME ZONE,
  last_ai_message_at TIMESTAMP WITH TIME ZONE,
  last_lead_message_at TIMESTAMP WITH TIME ZONE,
  cycle_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  UNIQUE(lead_id)
);

CREATE TABLE IF NOT EXISTS followup_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id UUID NOT NULL REFERENCES followup_tracking(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  step INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'cancelled')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
);

CREATE INDEX IF NOT EXISTS idx_followup_config_cliente ON followup_config(cliente_id);
CREATE INDEX IF NOT EXISTS idx_followup_tracking_lead ON followup_tracking(lead_id);
CREATE INDEX IF NOT EXISTS idx_followup_tracking_cliente ON followup_tracking(cliente_id);
CREATE INDEX IF NOT EXISTS idx_followup_tracking_status ON followup_tracking(status);
CREATE INDEX IF NOT EXISTS idx_followup_tracking_next_send ON followup_tracking(next_send_at)
  WHERE status = 'waiting';
CREATE INDEX IF NOT EXISTS idx_followup_log_tracking ON followup_log(tracking_id);
CREATE INDEX IF NOT EXISTS idx_followup_log_cliente ON followup_log(cliente_id);

ALTER TABLE followup_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE followup_tracking DISABLE ROW LEVEL SECURITY;
ALTER TABLE followup_log DISABLE ROW LEVEL SECURITY;
