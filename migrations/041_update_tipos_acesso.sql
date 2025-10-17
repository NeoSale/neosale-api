-- Migration: 041_update_tipos_acesso
-- Description: Add new access types for authentication
-- Dependencies: 002_create_tipos_acesso

INSERT INTO tipos_acesso (nome, descricao) VALUES 
  ('usuario', 'Usuário padrão do sistema'),
  ('convidado', 'Usuário convidado com acesso limitado')
ON CONFLICT (nome) DO NOTHING;
