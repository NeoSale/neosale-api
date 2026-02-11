-- Migration: Remove evolution API columns from notification_settings
-- These columns are no longer needed because WhatsApp config comes from the agent (notification_agent_id)

ALTER TABLE notification_settings
  DROP COLUMN IF EXISTS evolution_api_base_url,
  DROP COLUMN IF EXISTS evolution_api_key,
  DROP COLUMN IF EXISTS evolution_instance_name;
