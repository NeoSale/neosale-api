-- Migration: 006_create_origens_leads
-- Description: Create origens_leads table and insert initial data
-- Dependencies: none

CREATE TABLE IF NOT EXISTS origens_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE,
  embedding vector(1536) -- campo para embedding da LLM
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_origens_leads_nome ON origens_leads(nome);
CREATE INDEX IF NOT EXISTS idx_origens_leads_embedding ON origens_leads USING ivfflat (embedding vector_cosine_ops);

-- Insert initial data
INSERT INTO origens_leads (id, nome) VALUES
  (gen_random_uuid(), 'inbound'),
  (gen_random_uuid(), 'outbound')
ON CONFLICT (nome) DO NOTHING;