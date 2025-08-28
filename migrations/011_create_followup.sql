-- Migration: 011_create_followup
-- Description: Create followup table with foreign key to leads
-- Dependencies: 007_create_mensagens, 004_create_clientes, 012_create_leads

CREATE TABLE IF NOT EXISTS followup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_lead uuid REFERENCES leads(id), -- Foreign key reference to leads table
  id_mensagem uuid REFERENCES mensagens(id) NOT NULL,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE, -- referência ao cliente proprietário
  status varchar(20) CHECK (status IN ('sucesso', 'erro')) NOT NULL,
  erro text,
  mensagem_enviada text NOT NULL,
  embedding vector(1536), -- campo para embedding da LLM
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_followup_mensagem ON followup(id_mensagem);
CREATE INDEX IF NOT EXISTS idx_followup_lead ON followup(id_lead);
CREATE INDEX IF NOT EXISTS idx_followup_status ON followup(status);
CREATE INDEX IF NOT EXISTS idx_followup_cliente_id ON followup(cliente_id);
CREATE INDEX IF NOT EXISTS idx_followup_embedding ON followup USING ivfflat (embedding vector_cosine_ops);