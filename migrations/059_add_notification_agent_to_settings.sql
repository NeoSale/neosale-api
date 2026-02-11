-- Migration: 059_add_notification_agent_to_settings.sql
-- Description: Add notification_agent_id to notification_settings for WhatsApp agent selection
-- Date: 2026-02-10

ALTER TABLE notification_settings
  ADD COLUMN IF NOT EXISTS notification_agent_id UUID REFERENCES agentes(id) ON DELETE SET NULL;

-- Log migration
INSERT INTO migrations (name, executed_at)
VALUES ('059_add_notification_agent_to_settings', NOW())
ON CONFLICT (name) DO NOTHING;
