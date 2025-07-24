-- Migration: 007_create_leads
-- Description: Create leads table with all foreign key references
-- Dependencies: 001_create_origens_leads, 002_create_mensagens, 003_create_etapas_funil, 004_create_status_negociacao, 005_create_qualificacao, 006_create_followup

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text,
  telefone text,
  email text,
  empresa text,
  cargo text,
  contador text,
  escritorio text,
  responsavel text,
  cnpj text,
  observacao text,
  segmento text,
  erp_atual text,
  origem_id uuid REFERENCES origens_leads(id),
  status_agendamento boolean DEFAULT false,
  mensagem_id uuid REFERENCES mensagens(id),
  etapa_funil_id uuid REFERENCES etapas_funil(id),
  status_negociacao_id uuid REFERENCES status_negociacao(id),
  qualificacao_id uuid REFERENCES qualificacao(id),
  followup_id uuid REFERENCES followup(id),
  deletado boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- Add foreign key constraint to followup table for id_lead
ALTER TABLE followup 
ADD CONSTRAINT IF NOT EXISTS fk_followup_lead 
FOREIGN KEY (id_lead) REFERENCES leads(id);