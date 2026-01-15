-- Migration: 030_rename_followup_to_automatic_messages
-- Description: Rename followup table to automatic_messages
-- Dependencies: 011_create_followup

-- =====================================================
-- STEP 1: Rename the table
-- =====================================================
ALTER TABLE IF EXISTS followup RENAME TO automatic_messages;

-- =====================================================
-- STEP 2: Rename indexes to match new table name
-- =====================================================
ALTER INDEX IF EXISTS idx_followup_mensagem RENAME TO idx_automatic_messages_mensagem;
ALTER INDEX IF EXISTS idx_followup_lead RENAME TO idx_automatic_messages_lead;
ALTER INDEX IF EXISTS idx_followup_status RENAME TO idx_automatic_messages_status;
ALTER INDEX IF EXISTS idx_followup_cliente_id RENAME TO idx_automatic_messages_cliente_id;
ALTER INDEX IF EXISTS idx_followup_embedding RENAME TO idx_automatic_messages_embedding;
ALTER INDEX IF EXISTS idx_followup_lead_status RENAME TO idx_automatic_messages_lead_status;

-- =====================================================
-- STEP 3: Rename buscar_leads_para_followup function
-- to buscar_leads_para_automatic_messages
-- =====================================================
DROP FUNCTION IF EXISTS buscar_leads_para_followup(uuid, integer) CASCADE;

CREATE OR REPLACE FUNCTION buscar_leads_para_automatic_messages(
    p_cliente_id uuid,
    p_limite integer
)
RETURNS TABLE (
    lead_id uuid,
    lead_nome text,
    lead_telefone text,
    lead_email text,
    lead_created_at timestamp,
    lead_ai_habilitada boolean,
    mensagem_id uuid,
    mensagem_nome text,
    mensagem_texto text,
    mensagem_ordem integer,
    mensagem_created_at timestamp,
    tem_automatic_messages_anterior boolean,
    prioridade integer
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH leads_com_ultimo_followup AS (
        -- Buscar o último registro de cada lead com informações da próxima mensagem ativa
        SELECT DISTINCT ON (am.id_lead)
            am.id_lead,
            am.id_mensagem,
            am.created_at as ultimo_envio,
            m.ordem as ultima_ordem,
            m_proxima.intervalo_numero,
            m_proxima.intervalo_tipo,
            m_proxima.id as proxima_mensagem_id,
            m_proxima.ordem as proxima_ordem
        FROM automatic_messages am
        INNER JOIN mensagens m ON am.id_mensagem = m.id
        LEFT JOIN (
            SELECT DISTINCT ON (m1.id) 
                m1.id as mensagem_atual_id,
                m1.ordem as ordem_atual,
                m2.id,
                m2.ordem,
                m2.intervalo_numero,
                m2.intervalo_tipo,
                m2.cliente_id
            FROM mensagens m1
            LEFT JOIN mensagens m2 ON m2.cliente_id = m1.cliente_id 
                AND m2.ordem > m1.ordem 
                AND m2.ativo = true
            WHERE m1.cliente_id = p_cliente_id
            ORDER BY m1.id, m2.ordem ASC
        ) m_proxima ON m_proxima.mensagem_atual_id = m.id
        WHERE am.status = 'sucesso'
            AND am.cliente_id = p_cliente_id
        ORDER BY am.id_lead, am.created_at DESC
    ),
    leads_prontos_proxima_mensagem AS (
        -- Leads que estão no prazo para receber a próxima mensagem
        SELECT 
            l.id as lead_id,
            l.nome as lead_nome,
            l.telefone as lead_telefone,
            l.email as lead_email,
            l.created_at as lead_created_at,
            l.ai_habilitada as lead_ai_habilitada,
            luf.proxima_mensagem_id as mensagem_id,
            m_proxima.nome as mensagem_nome,
            m_proxima.texto_mensagem as mensagem_texto,
            luf.proxima_ordem as mensagem_ordem,
            m_proxima.created_at as mensagem_created_at,
            true as tem_automatic_messages_anterior,
            1 as prioridade,
            luf.ultimo_envio
        FROM leads l
        INNER JOIN leads_com_ultimo_followup luf ON l.id = luf.id_lead
        INNER JOIN mensagens m_proxima ON m_proxima.id = luf.proxima_mensagem_id
        WHERE l.cliente_id = p_cliente_id
            AND l.deletado = false
            AND luf.proxima_mensagem_id IS NOT NULL
            AND luf.intervalo_numero IS NOT NULL
            AND luf.intervalo_tipo IS NOT NULL
            AND (
                -- Verificar se já passou o tempo necessário para próxima mensagem
                CASE luf.intervalo_tipo
                    WHEN 'minutos' THEN luf.ultimo_envio + (luf.intervalo_numero || ' minutes')::interval
                    WHEN 'horas' THEN luf.ultimo_envio + (luf.intervalo_numero || ' hours')::interval
                    WHEN 'dias' THEN luf.ultimo_envio + (luf.intervalo_numero || ' days')::interval
                    ELSE luf.ultimo_envio
                END <= NOW()
            )
    ),
    leads_sem_followup AS (
        -- Leads que nunca receberam mensagem (primeira mensagem ativa disponível)
        SELECT 
            l.id as lead_id,
            l.nome as lead_nome,
            l.telefone as lead_telefone,
            l.email as lead_email,
            l.created_at as lead_created_at,
            l.ai_habilitada as lead_ai_habilitada,
            m.id as mensagem_id,
            m.nome as mensagem_nome,
            m.texto_mensagem as mensagem_texto,
            m.ordem as mensagem_ordem,
            m.created_at as mensagem_created_at,
            false as tem_automatic_messages_anterior,
            2 as prioridade,
            l.created_at as ultimo_envio
        FROM leads l
        INNER JOIN (
            SELECT DISTINCT ON (cliente_id) 
                id, nome, texto_mensagem, ordem, created_at, cliente_id
            FROM mensagens 
            WHERE ativo = true 
            ORDER BY cliente_id, ordem ASC
        ) m ON m.cliente_id = p_cliente_id
        WHERE l.cliente_id = p_cliente_id
            AND l.deletado = false
            AND NOT EXISTS (
                SELECT 1 FROM automatic_messages am 
                WHERE am.id_lead = l.id
            )
    )
    SELECT 
        resultado.lead_id::uuid,
        resultado.lead_nome::text,
        resultado.lead_telefone::text,
        resultado.lead_email::text,
        resultado.lead_created_at::timestamp,
        resultado.lead_ai_habilitada::boolean,
        resultado.mensagem_id::uuid,
        resultado.mensagem_nome::text,
        resultado.mensagem_texto::text,
        resultado.mensagem_ordem::integer,
        resultado.mensagem_created_at::timestamp,
        resultado.tem_automatic_messages_anterior::boolean,
        resultado.prioridade::integer
    FROM (
        SELECT * FROM leads_prontos_proxima_mensagem
        UNION ALL
        SELECT * FROM leads_sem_followup
    ) AS resultado
    ORDER BY resultado.prioridade ASC, resultado.ultimo_envio DESC
    LIMIT p_limite;
END;
$$;

-- Comment explaining the function
COMMENT ON FUNCTION buscar_leads_para_automatic_messages(uuid, integer) IS 
'Função consolidada para buscar leads para envio de mensagens automáticas com priorização. Retorna ai_habilitada para cada lead. Usa tabela automatic_messages.';

-- =====================================================
-- STEP 4: Recreate indexes on new table name (if needed)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_automatic_messages_lead_status ON automatic_messages(id_lead, status);
