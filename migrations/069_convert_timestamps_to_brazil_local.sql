-- Migration 069: Convert timestamp columns to TIMESTAMP WITHOUT TIME ZONE (Brazil local time)
--
-- PROBLEM: TIMESTAMP WITH TIME ZONE always stores/displays UTC internally (+00 suffix).
-- The user expects to see Brazil time (America/Sao_Paulo, UTC-3) in the database.
--
-- SOLUTION: Convert to TIMESTAMP WITHOUT TIME ZONE and store Brazil local time.
-- The USING clause converts existing UTC values to Brazil time during the type change.
-- The dequeue_event() function uses CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'
-- which returns a naive timestamp in Brazil time — matching the column type.

-- ============================================
-- event_queue
-- ============================================
ALTER TABLE event_queue
  ALTER COLUMN scheduled_at TYPE TIMESTAMP WITHOUT TIME ZONE
    USING scheduled_at AT TIME ZONE 'America/Sao_Paulo',
  ALTER COLUMN started_at TYPE TIMESTAMP WITHOUT TIME ZONE
    USING started_at AT TIME ZONE 'America/Sao_Paulo',
  ALTER COLUMN completed_at TYPE TIMESTAMP WITHOUT TIME ZONE
    USING completed_at AT TIME ZONE 'America/Sao_Paulo',
  ALTER COLUMN created_at TYPE TIMESTAMP WITHOUT TIME ZONE
    USING created_at AT TIME ZONE 'America/Sao_Paulo';

ALTER TABLE event_queue
  ALTER COLUMN scheduled_at SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  ALTER COLUMN created_at SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo');

-- ============================================
-- followup_config
-- ============================================
ALTER TABLE followup_config
  ALTER COLUMN created_at TYPE TIMESTAMP WITHOUT TIME ZONE
    USING created_at AT TIME ZONE 'America/Sao_Paulo',
  ALTER COLUMN updated_at TYPE TIMESTAMP WITHOUT TIME ZONE
    USING updated_at AT TIME ZONE 'America/Sao_Paulo';

ALTER TABLE followup_config
  ALTER COLUMN created_at SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  ALTER COLUMN updated_at SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo');

-- ============================================
-- followup_tracking
-- ============================================
ALTER TABLE followup_tracking
  ALTER COLUMN next_send_at TYPE TIMESTAMP WITHOUT TIME ZONE
    USING next_send_at AT TIME ZONE 'America/Sao_Paulo',
  ALTER COLUMN last_ai_message_at TYPE TIMESTAMP WITHOUT TIME ZONE
    USING last_ai_message_at AT TIME ZONE 'America/Sao_Paulo',
  ALTER COLUMN last_lead_message_at TYPE TIMESTAMP WITHOUT TIME ZONE
    USING last_lead_message_at AT TIME ZONE 'America/Sao_Paulo',
  ALTER COLUMN created_at TYPE TIMESTAMP WITHOUT TIME ZONE
    USING created_at AT TIME ZONE 'America/Sao_Paulo',
  ALTER COLUMN updated_at TYPE TIMESTAMP WITHOUT TIME ZONE
    USING updated_at AT TIME ZONE 'America/Sao_Paulo';

ALTER TABLE followup_tracking
  ALTER COLUMN created_at SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  ALTER COLUMN updated_at SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo');

-- ============================================
-- followup_log
-- ============================================
ALTER TABLE followup_log
  ALTER COLUMN created_at TYPE TIMESTAMP WITHOUT TIME ZONE
    USING created_at AT TIME ZONE 'America/Sao_Paulo';

ALTER TABLE followup_log
  ALTER COLUMN created_at SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo');

-- ============================================
-- Update dequeue_event() function
-- Now both scheduled_at (naive Brazil time) and
-- CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo' (naive Brazil time)
-- are the same type → comparison is correct.
-- ============================================
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
