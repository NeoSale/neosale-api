-- Migration 071: Add step_templates column to followup_config
-- Allows each follow-up step to have a message template for the LLM

ALTER TABLE followup_config ADD COLUMN IF NOT EXISTS step_templates JSONB DEFAULT '[]';

COMMENT ON COLUMN followup_config.step_templates IS 'JSON array of message templates per step. Index 0 = step 1, etc.';

-- Reload PostgREST schema cache so the new column is recognized
NOTIFY pgrst, 'reload schema';
