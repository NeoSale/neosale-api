-- Migration: Create n8n_chat_histories table
-- Description: Tabela para armazenar histórico de conversas do chat
-- Author: System
-- Date: 2024

CREATE TABLE IF NOT EXISTS n8n_chat_histories (
    id SERIAL PRIMARY KEY,
    session_id character varying NOT NULL,
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    message JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_session_id ON n8n_chat_histories(session_id);
CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_cliente_id ON n8n_chat_histories(cliente_id);
CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_created_at ON n8n_chat_histories(created_at);

-- Função para buscar cliente_id pelo session_id
CREATE OR REPLACE FUNCTION set_cliente_id_from_lead()
RETURNS TRIGGER AS $$
BEGIN
    -- Busca o cliente_id na tabela leads pelo session_id
    -- Converte session_id (character varying) para UUID para comparação
    SELECT cliente_id INTO NEW.cliente_id
    FROM leads
    WHERE id = NEW.session_id::UUID;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para definir cliente_id automaticamente na inserção
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trigger_set_cliente_id_n8n_chat_histories'
    ) THEN
        CREATE TRIGGER trigger_set_cliente_id_n8n_chat_histories
            BEFORE INSERT ON n8n_chat_histories
            FOR EACH ROW
            EXECUTE FUNCTION set_cliente_id_from_lead();
    END IF;
END $$;

-- Comentários na tabela e colunas
COMMENT ON TABLE n8n_chat_histories IS 'Histórico de conversas do chat N8N';
COMMENT ON COLUMN n8n_chat_histories.id IS 'Identificador único da mensagem';
COMMENT ON COLUMN n8n_chat_histories.session_id IS 'ID da sessão (referencia o ID do lead)';
COMMENT ON COLUMN n8n_chat_histories.cliente_id IS 'ID do cliente (preenchido automaticamente via trigger)';
COMMENT ON COLUMN n8n_chat_histories.message IS 'Conteúdo da mensagem em formato JSON';
COMMENT ON COLUMN n8n_chat_histories.created_at IS 'Data e hora de criação';