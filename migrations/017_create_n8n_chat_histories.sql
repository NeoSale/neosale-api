-- Migration: Create n8n_chat_histories table
-- Description: Tabela para armazenar histórico de conversas do chat
-- Author: System
-- Date: 2024

CREATE TABLE IF NOT EXISTS n8n_chat_histories (
    id SERIAL PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    message JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_session_id ON n8n_chat_histories(session_id);
CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_created_at ON n8n_chat_histories(created_at);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_n8n_chat_histories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trigger_update_n8n_chat_histories_updated_at'
    ) THEN
        CREATE TRIGGER trigger_update_n8n_chat_histories_updated_at
            BEFORE UPDATE ON n8n_chat_histories
            FOR EACH ROW
            EXECUTE FUNCTION update_n8n_chat_histories_updated_at();
    END IF;
END $$;

-- Comentários na tabela e colunas
COMMENT ON TABLE n8n_chat_histories IS 'Histórico de conversas do chat N8N';
COMMENT ON COLUMN n8n_chat_histories.id IS 'Identificador único da mensagem';
COMMENT ON COLUMN n8n_chat_histories.session_id IS 'ID da sessão (referencia o ID do lead)';
COMMENT ON COLUMN n8n_chat_histories.message IS 'Conteúdo da mensagem em formato JSON';
COMMENT ON COLUMN n8n_chat_histories.created_at IS 'Data e hora de criação';
COMMENT ON COLUMN n8n_chat_histories.updated_at IS 'Data e hora da última atualização';