-- Migration: 032_create_google_calendar
-- Description: Create google-calendar table for storing calendar appointments
-- Dependencies: 004_create_clientes, 031_create_google_calendar_configuracoes

CREATE TABLE IF NOT EXISTS google_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  configuracao_id UUID REFERENCES google_calendar_configuracoes(id) ON DELETE SET NULL,
  google_event_id text,
  titulo text NOT NULL,
  descricao text,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone text DEFAULT 'America/Sao_Paulo',
  localizacao text,
  participantes text[], -- array de emails dos participantes
  status text DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'tentative', 'cancelled')),
  visibilidade text DEFAULT 'default' CHECK (visibilidade IN ('default', 'public', 'private', 'confidential')),
  lembrete_minutos integer DEFAULT 15,
  recorrencia text, -- regra de recorrência (RRULE)
  link_meet text, -- link do Google Meet se gerado
  criado_por text, -- email do criador
  sincronizado boolean DEFAULT false,
  sincronizado_em TIMESTAMP WITH TIME ZONE,
  erro_sincronizacao text,
  deletado boolean DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_google_calendar_cliente_id ON google_calendar(cliente_id);
CREATE INDEX IF NOT EXISTS idx_google_calendar_configuracao_id ON google_calendar(configuracao_id);
CREATE INDEX IF NOT EXISTS idx_google_calendar_google_event_id ON google_calendar(google_event_id);
CREATE INDEX IF NOT EXISTS idx_google_calendar_data_inicio ON google_calendar(data_inicio);
CREATE INDEX IF NOT EXISTS idx_google_calendar_data_fim ON google_calendar(data_fim);
CREATE INDEX IF NOT EXISTS idx_google_calendar_status ON google_calendar(status);
CREATE INDEX IF NOT EXISTS idx_google_calendar_sincronizado ON google_calendar(sincronizado);
CREATE INDEX IF NOT EXISTS idx_google_calendar_deletado ON google_calendar(deletado);

-- Adiciona restrição única para google_event_id quando não for nulo
CREATE UNIQUE INDEX IF NOT EXISTS unique_google_event_id 
ON google_calendar(google_event_id) 
WHERE google_event_id IS NOT NULL;

-- Adiciona constraint para validar que data_fim seja posterior a data_inicio
ALTER TABLE google_calendar 
ADD CONSTRAINT check_data_fim_posterior 
CHECK (data_fim > data_inicio);

-- Comentários nas colunas
COMMENT ON TABLE google_calendar IS 'Agendamentos do Google Calendar';
COMMENT ON COLUMN google_calendar.cliente_id IS 'Referência ao cliente proprietário do agendamento';
COMMENT ON COLUMN google_calendar.configuracao_id IS 'Referência à configuração do Google Calendar utilizada';
COMMENT ON COLUMN google_calendar.google_event_id IS 'ID do evento no Google Calendar';
COMMENT ON COLUMN google_calendar.titulo IS 'Título do agendamento';
COMMENT ON COLUMN google_calendar.descricao IS 'Descrição detalhada do agendamento';
COMMENT ON COLUMN google_calendar.data_inicio IS 'Data e hora de início do agendamento';
COMMENT ON COLUMN google_calendar.data_fim IS 'Data e hora de fim do agendamento';
COMMENT ON COLUMN google_calendar.timezone IS 'Fuso horário do agendamento';
COMMENT ON COLUMN google_calendar.localizacao IS 'Local do agendamento';
COMMENT ON COLUMN google_calendar.participantes IS 'Lista de emails dos participantes';
COMMENT ON COLUMN google_calendar.status IS 'Status do agendamento (confirmed, tentative, cancelled)';
COMMENT ON COLUMN google_calendar.visibilidade IS 'Visibilidade do evento (default, public, private, confidential)';
COMMENT ON COLUMN google_calendar.lembrete_minutos IS 'Minutos antes do evento para lembrete';
COMMENT ON COLUMN google_calendar.recorrencia IS 'Regra de recorrência do evento (formato RRULE)';
COMMENT ON COLUMN google_calendar.link_meet IS 'Link do Google Meet se disponível';
COMMENT ON COLUMN google_calendar.criado_por IS 'Email do usuário que criou o agendamento';
COMMENT ON COLUMN google_calendar.sincronizado IS 'Indica se o evento foi sincronizado com o Google Calendar';
COMMENT ON COLUMN google_calendar.sincronizado_em IS 'Data da última sincronização';
COMMENT ON COLUMN google_calendar.erro_sincronizacao IS 'Mensagem de erro da última tentativa de sincronização';
COMMENT ON COLUMN google_calendar.deletado IS 'Soft delete - indica se o agendamento foi excluído';