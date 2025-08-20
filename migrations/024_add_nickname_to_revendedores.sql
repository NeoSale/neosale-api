-- Migration: 024_add_nickname_to_revendedores
-- Description: Add nickname column to revendedores table
-- Dependencies: 003_create_revendedores

-- Add nickname column if it doesn't exist
ALTER TABLE revendedores 
ADD COLUMN IF NOT EXISTS nickname varchar(100) UNIQUE;

-- Create index for nickname if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_revendedores_nickname ON revendedores(nickname);