-- Add apikey column to evolution_api_v2 table
ALTER TABLE evolution_api_v2
  ADD COLUMN IF NOT EXISTS apikey TEXT;
