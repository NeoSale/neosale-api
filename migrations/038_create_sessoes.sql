-- Migration: 038_create_sessoes
-- Description: Create sessoes (sessions) table
-- Dependencies: 005_create_usuarios

CREATE TABLE IF NOT EXISTS sessoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token varchar(500) NOT NULL UNIQUE,
  refresh_token varchar(500) UNIQUE,
  ip_address varchar(45),
  user_agent text,
  dispositivo varchar(255),
  navegador varchar(100),
  sistema_operacional varchar(100),
  expira_em TIMESTAMP WITH TIME ZONE NOT NULL,
  refresh_expira_em TIMESTAMP WITH TIME ZONE,
  ativo boolean NOT NULL DEFAULT true,
  ultimo_acesso TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
);

CREATE INDEX IF NOT EXISTS idx_sessoes_usuario ON sessoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_token ON sessoes(token);
CREATE INDEX IF NOT EXISTS idx_sessoes_refresh_token ON sessoes(refresh_token);
CREATE INDEX IF NOT EXISTS idx_sessoes_ativo ON sessoes(ativo);
CREATE INDEX IF NOT EXISTS idx_sessoes_expira_em ON sessoes(expira_em);

COMMENT ON TABLE sessoes IS 'Sessões ativas de usuários com tokens JWT';
