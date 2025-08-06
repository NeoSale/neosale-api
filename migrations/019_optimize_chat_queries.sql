-- Migration: 019_optimize_chat_queries
-- Description: Create optimized functions for chat endpoint performance
-- Dependencies: 012_create_leads, 017_create_n8n_chat_histories

-- Function to get leads with last message optimized
CREATE OR REPLACE FUNCTION get_leads_with_last_message_optimized(
  p_cliente_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  session_id UUID,
  nome TEXT,
  ultima_mensagem TEXT,
  data_ultima_mensagem TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  WITH lead_last_messages AS (
    SELECT DISTINCT ON (l.nome)
      l.id,
      l.id as session_id,
      l.nome,
      ch.message as ultima_mensagem,
      ch.created_at as data_ultima_mensagem,
      ROW_NUMBER() OVER (
        PARTITION BY l.nome 
        ORDER BY ch.created_at DESC NULLS LAST, l.created_at DESC
      ) as rn
    FROM leads l
    LEFT JOIN (
      SELECT DISTINCT ON (session_id)
        session_id,
        message,
        created_at
      FROM n8n_chat_histories
      ORDER BY session_id, created_at DESC
    ) ch ON l.id = ch.session_id
    WHERE l.cliente_id = p_cliente_id
      AND l.deletado = false
    ORDER BY l.nome, ch.created_at DESC NULLS LAST, l.created_at DESC
  )
  SELECT 
    llm.id,
    llm.session_id,
    llm.nome,
    llm.ultima_mensagem,
    llm.data_ultima_mensagem
  FROM lead_last_messages llm
  WHERE llm.rn = 1
  ORDER BY llm.data_ultima_mensagem DESC NULLS LAST
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to count unique leads with messages
CREATE OR REPLACE FUNCTION count_unique_leads_with_messages(
  p_cliente_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  total_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT l.nome)
  INTO total_count
  FROM leads l
  WHERE l.cliente_id = p_cliente_id
    AND l.deletado = false;
    
  RETURN COALESCE(total_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_session_created 
  ON n8n_chat_histories(session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_leads_cliente_nome_deletado 
  ON leads(cliente_id, nome, deletado) 
  WHERE deletado = false;

CREATE INDEX IF NOT EXISTS idx_leads_nome_created_at 
  ON leads(nome, created_at DESC) 
  WHERE deletado = false;

-- Add comment for documentation
COMMENT ON FUNCTION get_leads_with_last_message_optimized IS 
'Optimized function to get unique leads by name with their last chat message. Uses window functions to avoid N+1 queries.';

COMMENT ON FUNCTION count_unique_leads_with_messages IS 
'Count total unique leads by name for pagination purposes.';