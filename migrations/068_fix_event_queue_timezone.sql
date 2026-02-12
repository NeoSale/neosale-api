-- Migration 068: Fix timezone handling in event_queue and followup tables
--
-- PROBLEM: Previous migrations used CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'
-- as column defaults and in the dequeue_event() function. This expression returns a
-- naive timestamp (without timezone), which PostgreSQL then interprets as UTC (Supabase
-- session timezone). This caused a 3-hour offset: events scheduled at 05:08 UTC would
-- only be dequeued when Brazil time >= 05:08 (i.e., 08:08 UTC), creating a 3h delay.
--
-- FIX: Use CURRENT_TIMESTAMP directly (returns TIMESTAMPTZ in UTC), which compares
-- correctly with the scheduled_at TIMESTAMPTZ column that stores UTC values.

-- Fix dequeue_event() function
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
    AND scheduled_at <= CURRENT_TIMESTAMP
  ORDER BY priority ASC, scheduled_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_event.id IS NOT NULL THEN
    UPDATE event_queue
    SET status = 'processing',
        started_at = CURRENT_TIMESTAMP
    WHERE id = v_event.id;

    v_event.status := 'processing';
    RETURN NEXT v_event;
  END IF;
  RETURN;
END;
$$;

-- Fix column defaults on event_queue
ALTER TABLE event_queue ALTER COLUMN scheduled_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE event_queue ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

-- Fix column defaults on followup_config
ALTER TABLE followup_config ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE followup_config ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

-- Fix column defaults on followup_tracking
ALTER TABLE followup_tracking ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE followup_tracking ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

-- Fix column defaults on followup_log
ALTER TABLE followup_log ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
