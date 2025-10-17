-- Migration: 039_create_logs_autenticacao
-- Description: Create logs_autenticacao (authentication logs) table
-- Dependencies: 005_create_usuarios

CREATE TABLE IF NOT EXISTS logs_autenticacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  email varchar(255),
  acao varchar(50) NOT NULL,
  provedor varchar(50),
  sucesso boolean NOT NULL,
  mensagem text,
  ip_address varchar(45),
  user_agent text,
  dispositivo varchar(255),
  navegador varchar(100),
  sistema_operacional varchar(100),
  localizacao jsonb,
  metadata jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
);

CREATE INDEX IF NOT EXISTS idx_logs_autenticacao_usuario ON logs_autenticacao(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_autenticacao_email ON logs_autenticacao(email);
CREATE INDEX IF NOT EXISTS idx_logs_autenticacao_acao ON logs_autenticacao(acao);
CREATE INDEX IF NOT EXISTS idx_logs_autenticacao_sucesso ON logs_autenticacao(sucesso);
CREATE INDEX IF NOT EXISTS idx_logs_autenticacao_provedor ON logs_autenticacao(provedor);
CREATE INDEX IF NOT EXISTS idx_logs_autenticacao_created_at ON logs_autenticacao(created_at);

COMMENT ON TABLE logs_autenticacao IS 'Logs de todas as tentativas de autenticação';
COMMENT ON COLUMN logs_autenticacao.acao IS 'Ação realizada: login, logout, login_falhou, registro, verificacao_email, reset_senha';
