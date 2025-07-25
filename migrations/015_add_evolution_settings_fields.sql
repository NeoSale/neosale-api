-- Migration: 015_add_evolution_settings_fields
-- Description: Add specific Evolution API settings fields to evolution_instances table
-- Dependencies: 014_create_evolution_instances_table

-- Add specific Evolution API settings fields
ALTER TABLE evolution_instances 
ADD COLUMN IF NOT EXISTS always_online boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS groups_ignore boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS msg_call text,
ADD COLUMN IF NOT EXISTS read_messages boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS read_status boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS reject_call boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sync_full_history boolean DEFAULT false;

-- Create indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_evolution_instances_always_online ON evolution_instances(always_online);
CREATE INDEX IF NOT EXISTS idx_evolution_instances_groups_ignore ON evolution_instances(groups_ignore);
CREATE INDEX IF NOT EXISTS idx_evolution_instances_reject_call ON evolution_instances(reject_call);
CREATE INDEX IF NOT EXISTS idx_evolution_instances_read_messages ON evolution_instances(read_messages);
CREATE INDEX IF NOT EXISTS idx_evolution_instances_read_status ON evolution_instances(read_status);
CREATE INDEX IF NOT EXISTS idx_evolution_instances_sync_full_history ON evolution_instances(sync_full_history);