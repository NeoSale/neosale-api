-- =====================================================
-- Migration 051: Tabelas de Prospecção Ativa (NeoHunter)
-- =====================================================

-- 1. Tabela principal de prospects do LinkedIn
CREATE TABLE IF NOT EXISTS linkedin_prospects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  linkedin_id VARCHAR(255) UNIQUE,
  nome VARCHAR(255) NOT NULL,
  cargo VARCHAR(255),
  empresa VARCHAR(255),
  setor VARCHAR(100), -- 'clinicas', 'energia_solar', 'imobiliarias'
  tamanho_empresa VARCHAR(50), -- 'pequena', 'media', 'grande'
  url_perfil VARCHAR(500),

  -- Status do funil
  status VARCHAR(50) DEFAULT 'novo',
  -- Valores: novo, contato_enviado, conexao_aceita, respondeu, qualificado, em_negociacao, cliente, descqualificado

  -- Lead Scoring (0-100)
  lead_score INTEGER DEFAULT 0,
  score_breakdown JSONB DEFAULT '{}',
  -- Ex: {"setor_match": 20, "cargo_seniority": 20, "company_size": 15, "engagement": 10}

  -- Tracking de engajamento
  conexao_aceita BOOLEAN DEFAULT false,
  aceita_at TIMESTAMPTZ,
  primeira_msg_enviada BOOLEAN DEFAULT false,
  primeira_msg_at TIMESTAMPTZ,
  respondeu BOOLEAN DEFAULT false,
  respondeu_at TIMESTAMPTZ,
  ultima_resposta_texto TEXT,

  -- WhatsApp / SDR Maya
  whatsapp_enviado BOOLEAN DEFAULT false,
  whatsapp_enviado_at TIMESTAMPTZ,
  sdm_maya_conversando BOOLEAN DEFAULT false,
  whatsapp_number VARCHAR(20),

  -- Sequencia de prospecção usada
  sequencia_name VARCHAR(255),
  sequencia_step INTEGER DEFAULT 0,

  -- Notas livres
  notas TEXT,

  -- Metadata
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  touched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes para performance
CREATE INDEX IF NOT EXISTS idx_lp_status ON linkedin_prospects(status);
CREATE INDEX IF NOT EXISTS idx_lp_setor ON linkedin_prospects(setor);
CREATE INDEX IF NOT EXISTS idx_lp_lead_score ON linkedin_prospects(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_lp_touched_at ON linkedin_prospects(touched_at DESC);
CREATE INDEX IF NOT EXISTS idx_lp_created_at ON linkedin_prospects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lp_status_setor ON linkedin_prospects(status, setor);

-- Trigger para auto-update de updated_at e touched_at
CREATE OR REPLACE FUNCTION update_prospect_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.touched_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prospect_timestamps
BEFORE UPDATE ON linkedin_prospects
FOR EACH ROW EXECUTE FUNCTION update_prospect_timestamps();

-- 2. Tabela de sequencias de prospecção (templates de mensagens)
CREATE TABLE IF NOT EXISTS prospection_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  setor VARCHAR(100) NOT NULL, -- 'clinicas', 'energia_solar', 'imobiliarias'
  tipo VARCHAR(50) NOT NULL DEFAULT 'conexao', -- 'conexao', 'dms', 'whatsapp'
  messages JSONB NOT NULL DEFAULT '[]',
  -- Ex: [{"step": 1, "message": "Oi...", "delay_days": 0}, {"step": 2, "message": "Follow up...", "delay_days": 3}]
  performance_metrics JSONB DEFAULT '{}',
  -- Ex: {"aceitacao_pct": 25, "resposta_pct": 15, "conversao_pct": 5}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ps_setor ON prospection_sequences(setor);
CREATE INDEX IF NOT EXISTS idx_ps_active ON prospection_sequences(is_active) WHERE is_active = true;

-- Trigger para auto-update de updated_at
CREATE TRIGGER trg_sequence_timestamps
BEFORE UPDATE ON prospection_sequences
FOR EACH ROW EXECUTE FUNCTION update_prospect_timestamps();

-- 3. Tabela de atividades de prospecção (log/audit)
CREATE TABLE IF NOT EXISTS prospection_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prospect_id UUID REFERENCES linkedin_prospects(id) ON DELETE CASCADE,
  acao VARCHAR(100) NOT NULL,
  -- Valores: conexao_enviada, conexao_aceita, dms_enviada, resposta_recebida,
  --          qualificacao_executada, whatsapp_enviado, status_alterado, nota_adicionada
  detalhes TEXT,
  criado_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pa_prospect ON prospection_activities(prospect_id);
CREATE INDEX IF NOT EXISTS idx_pa_acao ON prospection_activities(acao);
CREATE INDEX IF NOT EXISTS idx_pa_criado ON prospection_activities(criado_at DESC);

-- =====================================================
-- SEED DATA: Sequencias iniciais de prospecção
-- =====================================================

INSERT INTO prospection_sequences (name, setor, tipo, messages, is_active) VALUES
(
  'Clinicas - Abordagem Inicial',
  'clinicas',
  'conexao',
  '[
    {"step": 1, "delay_days": 0, "message": "Oi [NOME]! Vi que voce atua na area de saude. Trabalho com automacao de atendimento via WhatsApp para clinicas - pacientes conseguem agendar consultas em segundos, mesmo fora do horario comercial. Posso te mostrar como funciona?"},
    {"step": 2, "delay_days": 3, "message": "Oi [NOME], tudo bem? Mandei uma mensagem alguns dias atras sobre automacao de agendamento para clinicas. Clinicas que usam nosso sistema aumentaram os agendamentos em 40%. Se fizer sentido, posso mostrar em 15 minutos como funciona pro seu caso."},
    {"step": 3, "delay_days": 7, "message": "[NOME], ultima tentativa! Sei que a rotina e corrida. Se em algum momento quiser ver como automatizar o atendimento da clinica pelo WhatsApp (resposta em 30s, 24/7), estou por aqui. Sem compromisso."}
  ]'::jsonb,
  true
),
(
  'Energia Solar - Abordagem Inicial',
  'energia_solar',
  'conexao',
  '[
    {"step": 1, "delay_days": 0, "message": "Oi [NOME]! Vi que voce atua no setor de energia solar. Empresas do setor que demoram mais de 2h para responder leads perdem 60% dos orcamentos pro concorrente. Criei uma IA que qualifica leads e agenda visitas tecnicas em minutos. Posso te mostrar?"},
    {"step": 2, "delay_days": 3, "message": "Oi [NOME]! Sobre a automacao de atendimento para energia solar - nossos clientes reduziram o tempo de resposta de horas para 30 segundos e aumentaram as visitas agendadas em 40%. Tem 15 minutos para uma demo rapida?"},
    {"step": 3, "delay_days": 7, "message": "[NOME], sei que o mercado de energia solar esta aquecido e cada lead conta. Se quiser ver como automatizar a qualificacao e agendamento de visitas pelo WhatsApp, estou a disposicao."}
  ]'::jsonb,
  true
),
(
  'Imobiliarias - Abordagem Inicial',
  'imobiliarias',
  'conexao',
  '[
    {"step": 1, "delay_days": 0, "message": "Oi [NOME]! Vi que voce trabalha com imoveis. Corretores que respondem leads em menos de 5 minutos tem 21x mais chances de qualificar. Criei uma IA que responde, qualifica e agenda visitas pelo WhatsApp automaticamente. Quer ver como funciona?"},
    {"step": 2, "delay_days": 3, "message": "Oi [NOME]! Sobre automacao de atendimento imobiliario - imagine seus leads recebendo resposta instantanea, sendo qualificados e agendando visita, tudo pelo WhatsApp, 24/7. Imobiliarias usando nosso sistema aumentaram agendamentos em 40%."},
    {"step": 3, "delay_days": 7, "message": "[NOME], se em algum momento quiser explorar como automatizar o atendimento de leads imobiliarios (resposta em 30s, qualificacao e agendamento automatico), me manda uma mensagem. Sem compromisso."}
  ]'::jsonb,
  true
);
