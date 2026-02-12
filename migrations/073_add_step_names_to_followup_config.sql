-- Migration 073: Add step_names column to followup_config
-- Allows each follow-up step to have a custom display name

ALTER TABLE followup_config ADD COLUMN IF NOT EXISTS step_names JSONB DEFAULT '[]';

COMMENT ON COLUMN followup_config.step_names IS 'JSON array of step names. Index 0 = step 1, etc.';

-- Reload PostgREST schema cache so the new column is recognized
NOTIFY pgrst, 'reload schema';
