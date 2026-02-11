-- Migration: 057_fix_lead_atribuicoes_fk.sql
-- Description: Change lead_atribuicoes.vendedor_id FK from usuarios to profiles
-- Date: 2026-02-10

-- Drop old FK referencing usuarios
ALTER TABLE lead_atribuicoes
  DROP CONSTRAINT IF EXISTS lead_atribuicoes_vendedor_id_fkey;

-- Add new FK referencing profiles
ALTER TABLE lead_atribuicoes
  ADD CONSTRAINT lead_atribuicoes_vendedor_id_fkey
  FOREIGN KEY (vendedor_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Also fix vendedor_contador_leads FK
ALTER TABLE vendedor_contador_leads
  DROP CONSTRAINT IF EXISTS vendedor_contador_leads_vendedor_id_fkey;

ALTER TABLE vendedor_contador_leads
  ADD CONSTRAINT vendedor_contador_leads_vendedor_id_fkey
  FOREIGN KEY (vendedor_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Log migration
INSERT INTO migrations (name, executed_at)
VALUES ('057_fix_lead_atribuicoes_fk', NOW())
ON CONFLICT (name) DO NOTHING;
