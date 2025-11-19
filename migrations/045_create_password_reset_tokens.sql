-- Migration: 045_create_password_reset_tokens
-- Descrição: Cria tabela para tokens de reset de senha
-- Data: 2025-01-07

-- Criar tabela de tokens de reset de senha
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expira_em TIMESTAMP WITH TIME ZONE NOT NULL,
  usado BOOLEAN DEFAULT FALSE,
  usado_em TIMESTAMP WITH TIME ZONE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_usuario_id ON password_reset_tokens(usuario_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expira_em ON password_reset_tokens(expira_em);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_usado ON password_reset_tokens(usado);

-- Adicionar comentários
COMMENT ON TABLE password_reset_tokens IS 'Tokens para reset de senha dos usuários';
COMMENT ON COLUMN password_reset_tokens.id IS 'ID único do token';
COMMENT ON COLUMN password_reset_tokens.usuario_id IS 'ID do usuário que solicitou o reset';
COMMENT ON COLUMN password_reset_tokens.token IS 'Token único para validação';
COMMENT ON COLUMN password_reset_tokens.expira_em IS 'Data/hora de expiração do token (1 hora após criação)';
COMMENT ON COLUMN password_reset_tokens.usado IS 'Indica se o token já foi usado';
COMMENT ON COLUMN password_reset_tokens.usado_em IS 'Data/hora em que o token foi usado';
COMMENT ON COLUMN password_reset_tokens.ip_address IS 'IP de origem da solicitação';
COMMENT ON COLUMN password_reset_tokens.user_agent IS 'User agent do navegador';

-- Função para limpar tokens expirados (executar via cron)
CREATE OR REPLACE FUNCTION limpar_tokens_reset_expirados()
RETURNS INTEGER AS $$
DECLARE
  tokens_removidos INTEGER;
BEGIN
  DELETE FROM password_reset_tokens
  WHERE expira_em < NOW() OR usado = TRUE;
  
  GET DIAGNOSTICS tokens_removidos = ROW_COUNT;
  
  RETURN tokens_removidos;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION limpar_tokens_reset_expirados IS 'Remove tokens de reset expirados ou já usados';

-- Registrar migration
INSERT INTO migrations (filename, executed_at)
VALUES ('045_create_password_reset_tokens.sql', NOW())
ON CONFLICT (filename) DO NOTHING;
