-- Migration 065: Create event_queue table for event-driven architecture
CREATE TABLE IF NOT EXISTS event_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL
    DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
);

-- Index for polling: pending events ordered by priority and schedule
CREATE INDEX IF NOT EXISTS idx_event_queue_polling ON event_queue (status, scheduled_at, priority)
  WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_event_queue_cliente ON event_queue (cliente_id);
CREATE INDEX IF NOT EXISTS idx_event_queue_type ON event_queue (event_type);
CREATE INDEX IF NOT EXISTS idx_event_queue_payload_lead ON event_queue ((payload->>'lead_id'))
  WHERE payload->>'lead_id' IS NOT NULL;

ALTER TABLE event_queue DISABLE ROW LEVEL SECURITY;

-- PostgreSQL function for dequeue with FOR UPDATE SKIP LOCKED
CREATE OR REPLACE FUNCTION dequeue_event()
RETURNS SETOF event_queue
LANGUAGE plpgsql
AS $$
DECLARE
  v_event event_queue;
BEGIN
  SELECT * INTO v_event
  FROM event_queue
  WHERE status = 'pending'
    AND scheduled_at <= (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
  ORDER BY priority ASC, scheduled_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_event.id IS NOT NULL THEN
    UPDATE event_queue
    SET status = 'processing',
        started_at = (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
    WHERE id = v_event.id;

    v_event.status := 'processing';
    RETURN NEXT v_event;
  END IF;
  RETURN;
END;
$$;
