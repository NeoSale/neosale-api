-- Migration: Otimização de consultas do chat
-- Adiciona índices e funções SQL para melhorar performance das consultas de chat

-- Índices para otimizar consultas de chat
CREATE INDEX IF NOT EXISTS idx_chat_cliente_id_lead_id ON chat(cliente_id, lead_id);
CREATE INDEX IF NOT EXISTS idx_chat_lead_id_created_at ON chat(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_cliente_id_created_at ON chat(cliente_id, created_at DESC);

-- Índices para otimizar consultas de leads
CREATE INDEX IF NOT EXISTS idx_leads_cliente_id_deletado_nome ON leads(cliente_id, deletado, nome);
CREATE INDEX IF NOT EXISTS idx_leads_nome_cliente_id ON leads(nome, cliente_id) WHERE deletado = false;

-- Função para buscar leads únicos com última mensagem (otimizada)
CREATE OR REPLACE FUNCTION get_leads_with_last_message(
    p_cliente_id UUID,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
    id UUID,
    nome TEXT,
    profile_picture_url TEXT,
    telefone TEXT,
    ultima_mensagem TEXT,
    data_ultima_mensagem TIMESTAMPTZ
) 
LANGUAGE SQL
STABLE
AS $$
    WITH ranked_messages AS (
        SELECT 
            c.lead_id,
            c.mensagem,
            c.created_at,
            ROW_NUMBER() OVER (PARTITION BY c.lead_id ORDER BY c.created_at DESC) as rn
        FROM chat c
        WHERE c.cliente_id = p_cliente_id
    ),
    latest_messages AS (
        SELECT 
            lead_id,
            mensagem as ultima_mensagem,
            created_at as data_ultima_mensagem
        FROM ranked_messages
        WHERE rn = 1
    ),
    unique_leads AS (
        SELECT DISTINCT ON (l.nome)
            l.id,
            l.nome,
            l.profile_picture_url,
            l.telefone,
            lm.ultima_mensagem,
            lm.data_ultima_mensagem
        FROM leads l
        INNER JOIN latest_messages lm ON l.id = lm.lead_id
        WHERE l.cliente_id = p_cliente_id 
            AND l.deletado = false
        ORDER BY l.nome, lm.data_ultima_mensagem DESC
    )
    SELECT 
        ul.id,
        ul.nome,
        ul.profile_picture_url,
        ul.telefone,
        ul.ultima_mensagem,
        ul.data_ultima_mensagem
    FROM unique_leads ul
    ORDER BY ul.data_ultima_mensagem DESC NULLS LAST
    OFFSET p_offset;
$$;

-- Função para contar leads únicos com mensagens
CREATE OR REPLACE FUNCTION count_unique_leads_with_messages(
    p_cliente_id UUID
)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
    WITH latest_messages AS (
        SELECT DISTINCT lead_id
        FROM chat
        WHERE cliente_id = p_cliente_id
    )
    SELECT COUNT(DISTINCT l.nome)::INTEGER
    FROM leads l
    INNER JOIN latest_messages lm ON l.id = lm.lead_id
    WHERE l.cliente_id = p_cliente_id 
        AND l.deletado = false;
$$;

-- Nota: A função execute_sql já existe na migration 000_create_execute_sql_function.sql
-- Utilizaremos a função execute_sql_query existente para consultas com retorno

-- Comentários para documentação
COMMENT ON INDEX idx_chat_cliente_id_lead_id IS 'Índice composto para otimizar consultas de chat por cliente e lead';
COMMENT ON INDEX idx_chat_lead_id_created_at IS 'Índice para otimizar busca da última mensagem por lead';
COMMENT ON INDEX idx_chat_cliente_id_created_at IS 'Índice para otimizar consultas de chat ordenadas por data';
COMMENT ON INDEX idx_leads_cliente_id_deletado_nome IS 'Índice composto para otimizar consultas de leads ativos por cliente';
COMMENT ON INDEX idx_leads_nome_cliente_id IS 'Índice para otimizar agrupamento de leads por nome';

COMMENT ON FUNCTION get_leads_with_last_message IS 'Função otimizada para buscar leads únicos com última mensagem, evitando N+1 queries';
COMMENT ON FUNCTION count_unique_leads_with_messages IS 'Função para contar leads únicos que possuem mensagens';