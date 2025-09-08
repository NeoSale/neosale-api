-- Migration: 027_create_chat
-- Description: Tabela para armazenar mensagens de chat entre leads e AI
-- Dependencies: 012_create_leads, 004_create_clientes, 016_create_evolution_api

CREATE TABLE IF NOT EXISTS chat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  cliente_id uuid NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo character varying(10) NOT NULL CHECK (tipo IN ('human', 'ai')),
  mensagem text NOT NULL,
  source text,
  status character varying(10) DEFAULT 'sucesso' CHECK (status IN ('sucesso', 'erro')),
  erro text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_chat_lead_id ON chat(lead_id);
CREATE INDEX IF NOT EXISTS idx_chat_cliente_id ON chat(cliente_id);
CREATE INDEX IF NOT EXISTS idx_chat_tipo ON chat(tipo);
CREATE INDEX IF NOT EXISTS idx_chat_status ON chat(status);
CREATE INDEX IF NOT EXISTS idx_chat_created_at ON chat(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_lead_created_at ON chat(lead_id, created_at);

-- Comentários nas colunas
COMMENT ON TABLE chat IS 'Tabela para armazenar mensagens de chat entre leads e AI';
COMMENT ON COLUMN chat.id IS 'Identificador único da mensagem';
COMMENT ON COLUMN chat.lead_id IS 'Referência ao lead que enviou/recebeu a mensagem';
COMMENT ON COLUMN chat.cliente_id IS 'Referência ao cliente proprietário do lead';
COMMENT ON COLUMN chat.tipo IS 'Tipo da mensagem: human (usuário) ou ai (inteligência artificial)';
COMMENT ON COLUMN chat.mensagem IS 'Conteúdo da mensagem';
COMMENT ON COLUMN chat.source IS 'Origem da mensagem';
COMMENT ON COLUMN chat.status IS 'Status da mensagem: sucesso ou erro';
COMMENT ON COLUMN chat.erro IS 'Descrição do erro, caso status seja erro';
COMMENT ON COLUMN chat.created_at IS 'Data e hora de criação da mensagem';