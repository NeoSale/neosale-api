-- Migration: 043_add_tipo_acesso_to_convites
-- Description: Add tipo_acesso_id field to convites table
-- Dependencies: 037_create_convites, 002_create_tipos_acesso

-- Add tipo_acesso_id column
ALTER TABLE convites ADD COLUMN IF NOT EXISTS tipo_acesso_id uuid REFERENCES tipos_acesso(id) ON DELETE RESTRICT;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_convites_tipo_acesso ON convites(tipo_acesso_id);

COMMENT ON COLUMN convites.tipo_acesso_id IS 'ID do tipo de acesso que será atribuído ao usuário quando aceitar o convite';
