-- Migration: 042_add_senha_to_usuarios
-- Description: Add senha (password hash) field to usuarios table
-- Dependencies: 005_create_usuarios

-- Add senha column
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS senha varchar(255);

-- Add index for better performance on authentication queries
CREATE INDEX IF NOT EXISTS idx_usuarios_senha ON usuarios(senha) WHERE senha IS NOT NULL;

COMMENT ON COLUMN usuarios.senha IS 'Hash da senha do usuário (bcrypt)';
