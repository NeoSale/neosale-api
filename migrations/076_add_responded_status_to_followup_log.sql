-- Migration 076: Add 'responded' status to followup_log
-- Allows logging when a lead responds after receiving follow-up messages

ALTER TABLE followup_log
  DROP CONSTRAINT IF EXISTS followup_log_status_check;

ALTER TABLE followup_log
  ADD CONSTRAINT followup_log_status_check
  CHECK (status IN ('sent', 'failed', 'cancelled', 'responded'));
