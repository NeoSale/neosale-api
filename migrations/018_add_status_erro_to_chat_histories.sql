-- Migration: 018_add_status_erro_to_chat_histories
-- Description: Add status and erro columns to n8n_chat_histories table
-- Dependencies: 017_create_n8n_chat_histories

-- Add status column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'n8n_chat_histories' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE n8n_chat_histories 
        ADD COLUMN status character varying(10) DEFAULT 'sucesso' 
        CHECK (status IN ('sucesso', 'erro'));
        
        COMMENT ON COLUMN n8n_chat_histories.status IS 'Status da mensagem (sucesso ou erro)';
    END IF;
END $$;

-- Add erro column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'n8n_chat_histories' 
        AND column_name = 'erro'
    ) THEN
        ALTER TABLE n8n_chat_histories 
        ADD COLUMN erro TEXT;
        
        COMMENT ON COLUMN n8n_chat_histories.erro IS 'Descrição do erro, se houver';
    END IF;
END $$;