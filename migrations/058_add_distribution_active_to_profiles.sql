-- Migration: 058_add_distribution_active_to_profiles.sql
-- Description: Add distribution_active column to profiles for vendor toggle
-- Date: 2026-02-10

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS distribution_active BOOLEAN DEFAULT TRUE;

-- Log migration
INSERT INTO migrations (name, executed_at)
VALUES ('058_add_distribution_active_to_profiles', NOW())
ON CONFLICT (name) DO NOTHING;
