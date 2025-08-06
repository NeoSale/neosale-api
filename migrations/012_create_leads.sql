-- Migration: 012_create_leads
-- Description: Create leads table with all foreign key references
-- Dependencies: 006_create_origens_leads, 007_create_mensagens, 008_create_etapas_funil, 009_create_status_negociacao, 010_create_qualificacao, 011_create_followup, 004_create_clientes

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
  ai_habilitada boolean DEFAULT true, -- indica se a IA está habilitada para este lead
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE, -- referência ao cliente proprietário
  profile_picture_url text, -- URL da foto de perfil do lead
  instance_name text, -- nome da instância do Evolution API associada ao lead
  embedding vector(1536), -- campo para embedding da LLM
  created_at timestamp DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_nome ON leads(nome);
CREATE INDEX IF NOT EXISTS idx_leads_telefone ON leads(telefone);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_origem ON leads(origem_id);
CREATE INDEX IF NOT EXISTS idx_leads_etapa_funil ON leads(etapa_funil_id);
CREATE INDEX IF NOT EXISTS idx_leads_status_negociacao ON leads(status_negociacao_id);
CREATE INDEX IF NOT EXISTS idx_leads_qualificacao ON leads(qualificacao_id);
CREATE INDEX IF NOT EXISTS idx_leads_deletado ON leads(deletado);
CREATE INDEX IF NOT EXISTS idx_leads_cliente_id ON leads(cliente_id);
CREATE INDEX IF NOT EXISTS idx_leads_embedding ON leads USING ivfflat (embedding vector_cosine_ops);

-- Add foreign key constraint to followup table for id_lead
ALTER TABLE followup 
ADD CONSTRAINT IF NOT EXISTS fk_followup_lead 
FOREIGN KEY (id_lead) REFERENCES leads(id);