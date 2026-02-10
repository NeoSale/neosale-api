-- Migration: 056_add_phone_to_profiles.sql
-- Description: Add phone column to profiles table
-- Date: 2026-02-08

-- Add phone column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Create index for phone lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- Update salesperson profiles for Riseon
UPDATE profiles SET phone = '47984763793', role = 'salesperson'
WHERE email = 'bruno@riseon.com.br' AND cliente_id = '7b719c80-20c7-400d-8f2b-5140768fc9ae';

UPDATE profiles SET phone = '47999941850', role = 'salesperson'
WHERE email = 'aline@riseon.com.br' AND cliente_id = '7b719c80-20c7-400d-8f2b-5140768fc9ae';

UPDATE profiles SET phone = '47988820526', role = 'salesperson'
WHERE email = 'raissa@riseon.com.br' AND cliente_id = '7b719c80-20c7-400d-8f2b-5140768fc9ae';

UPDATE profiles SET phone = '47999941765', role = 'salesperson'
WHERE email = 'carol@riseon.com.br' AND cliente_id = '7b719c80-20c7-400d-8f2b-5140768fc9ae';

-- Log migration
INSERT INTO migrations (name, executed_at)
VALUES ('056_add_phone_to_profiles', NOW())
ON CONFLICT (name) DO NOTHING;
