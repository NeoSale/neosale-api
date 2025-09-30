-- Migration: 031_create_google_calendar_integracoes
-- Description: Create google-calendar-integracoes table for storing Google Calendar API integrations
-- Dependencies: 004_create_clientes

CREATE TABLE IF NOT EXISTS google_calendar_integracoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  nome text NOT NULL,
  client_id text NOT NULL,
  client_secret text NOT NULL,
  redirect_uri text,
  scope text DEFAULT 'https://www.googleapis.com/auth/calendar',
  access_token text,
  refresh_token text,
  token_expiry TIMESTAMP WITH TIME ZONE,
  ativo boolean DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_google_calendar_integracoes_cliente_id ON google_calendar_integracoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_google_calendar_integracoes_ativo ON google_calendar_integracoes(ativo);

-- Adiciona restrição única para cliente_id (um cliente pode ter apenas uma integração ativa)
ALTER TABLE google_calendar_integracoes 
ADD CONSTRAINT unique_cliente_integracao_ativa 
UNIQUE (cliente_id, ativo) 
DEFERRABLE INITIALLY DEFERRED;

-- Comentários nas colunas
COMMENT ON TABLE google_calendar_integracoes IS 'Integrações do Google Calendar API por cliente';
COMMENT ON COLUMN google_calendar_integracoes.cliente_id IS 'Referência ao cliente proprietário da integração';
COMMENT ON COLUMN google_calendar_integracoes.nome IS 'Nome identificador da integração';
COMMENT ON COLUMN google_calendar_integracoes.client_id IS 'Client ID do Google Calendar API';
COMMENT ON COLUMN google_calendar_integracoes.client_secret IS 'Client Secret do Google Calendar API';
COMMENT ON COLUMN google_calendar_integracoes.redirect_uri IS 'URI de redirecionamento para OAuth';
COMMENT ON COLUMN google_calendar_integracoes.scope IS 'Escopo de permissões do Google Calendar';
COMMENT ON COLUMN google_calendar_integracoes.access_token IS 'Token de acesso atual';
COMMENT ON COLUMN google_calendar_integracoes.refresh_token IS 'Token de refresh para renovação';
COMMENT ON COLUMN google_calendar_integracoes.token_expiry IS 'Data de expiração do access_token';
COMMENT ON COLUMN google_calendar_integracoes.ativo IS 'Indica se a integração está ativa';