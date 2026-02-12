-- Migration 069: Convert timestamp columns to TIMESTAMP WITHOUT TIME ZONE (Brazil time)
--
-- PROBLEM: TIMESTAMPTZ columns store UTC internally. Supabase Dashboard always shows UTC (+00),
-- confusing users who expect Brazil time. Additionally, the dequeue_event() comparison
-- between TIMESTAMPTZ and naive timestamps caused a 3h processing delay.
--
-- FIX: Convert to TIMESTAMP WITHOUT TIME ZONE and store Brazil time explicitly.
-- The dequeue_event() function compares naive Brazil timestamps correctly.
-- The application code uses toBrazilTimestamp() helper to format dates.

-- ============================================================
-- 1. Convert event_queue columns
-- ============================================================
ALTER TABLE event_queue
  ALTER COLUMN scheduled_at TYPE TIMESTAMP WITHOUT TIME ZONE
  USING scheduled_at AT TIME ZONE 'America/Sao_Paulo';

ALTER TABLE event_queue
  ALTER COLUMN started_at TYPE TIMESTAMP WITHOUT TIME ZONE
  USING started_at AT TIME ZONE 'America/Sao_Paulo';

ALTER TABLE event_queue
  ALTER COLUMN completed_at TYPE TIMESTAMP WITHOUT TIME ZONE
  USING completed_at AT TIME ZONE 'America/Sao_Paulo';

ALTER TABLE event_queue
  ALTER COLUMN created_at TYPE TIMESTAMP WITHOUT TIME ZONE
  USING created_at AT TIME ZONE 'America/Sao_Paulo';

-- Update defaults to Brazil time
ALTER TABLE event_queue
  ALTER COLUMN scheduled_at SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo');
ALTER TABLE event_queue
  ALTER COLUMN created_at SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo');

-- ============================================================
-- 2. Fix dequeue_event() to compare naive Brazil timestamps
-- ============================================================
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

-- ============================================================
-- 3. Convert followup_config columns
-- ============================================================
ALTER TABLE followup_config
  ALTER COLUMN created_at TYPE TIMESTAMP WITHOUT TIME ZONE
  USING created_at AT TIME ZONE 'America/Sao_Paulo';

ALTER TABLE followup_config
  ALTER COLUMN updated_at TYPE TIMESTAMP WITHOUT TIME ZONE
  USING updated_at AT TIME ZONE 'America/Sao_Paulo';

ALTER TABLE followup_config
  ALTER COLUMN created_at SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo');
ALTER TABLE followup_config
  ALTER COLUMN updated_at SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo');

-- ============================================================
-- 4. Convert followup_tracking columns
-- ============================================================
ALTER TABLE followup_tracking
  ALTER COLUMN next_send_at TYPE TIMESTAMP WITHOUT TIME ZONE
  USING next_send_at AT TIME ZONE 'America/Sao_Paulo';

ALTER TABLE followup_tracking
  ALTER COLUMN last_ai_message_at TYPE TIMESTAMP WITHOUT TIME ZONE
  USING last_ai_message_at AT TIME ZONE 'America/Sao_Paulo';

ALTER TABLE followup_tracking
  ALTER COLUMN last_lead_message_at TYPE TIMESTAMP WITHOUT TIME ZONE
  USING last_lead_message_at AT TIME ZONE 'America/Sao_Paulo';

ALTER TABLE followup_tracking
  ALTER COLUMN created_at TYPE TIMESTAMP WITHOUT TIME ZONE
  USING created_at AT TIME ZONE 'America/Sao_Paulo';

ALTER TABLE followup_tracking
  ALTER COLUMN updated_at TYPE TIMESTAMP WITHOUT TIME ZONE
  USING updated_at AT TIME ZONE 'America/Sao_Paulo';

ALTER TABLE followup_tracking
  ALTER COLUMN created_at SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo');
ALTER TABLE followup_tracking
  ALTER COLUMN updated_at SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo');

-- ============================================================
-- 5. Convert followup_log columns
-- ============================================================
ALTER TABLE followup_log
  ALTER COLUMN created_at TYPE TIMESTAMP WITHOUT TIME ZONE
  USING created_at AT TIME ZONE 'America/Sao_Paulo';

ALTER TABLE followup_log
  ALTER COLUMN created_at SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo');
