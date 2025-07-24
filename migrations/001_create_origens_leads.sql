-- Migration: 001_create_origens_leads
-- Description: Create origens_leads table and insert initial data
-- Dependencies: none

CREATE TABLE IF NOT EXISTS origens_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE
);

-- Insert initial data
INSERT INTO origens_leads (id, nome) VALUES
  (gen_random_uuid(), 'inbound'),
  (gen_random_uuid(), 'outbound')
ON CONFLICT (nome) DO NOTHING;