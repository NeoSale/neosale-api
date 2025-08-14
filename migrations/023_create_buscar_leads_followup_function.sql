-- Migration: 023_create_buscar_leads_followup_function
-- Description: Final consolidated function to search leads for followup with all fixes
-- Dependencies: 011_create_followup, 012_create_leads, 007_create_mensagens

-- Drop function if exists (force recreation)
DROP FUNCTION IF EXISTS buscar_leads_para_followup(uuid, integer) CASCADE;
DROP FUNCTION IF EXISTS buscar_leads_para_followup CASCADE;

CREATE OR REPLACE FUNCTION buscar_leads_para_followup(
    p_cliente_id uuid,
    p_limite integer
)
RETURNS TABLE (
    lead_id uuid,
    lead_nome text,
    lead_telefone text,
    lead_email text,
    lead_created_at timestamp,
    mensagem_id uuid,
    mensagem_nome text,
    mensagem_texto text,
    mensagem_ordem integer,
    mensagem_created_at timestamp,
    tem_followup_anterior boolean,
    prioridade integer
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH leads_com_ultimo_followup AS (
        -- Buscar o último followup de cada lead com informações da próxima mensagem
        SELECT DISTINCT ON (f.id_lead)
            f.id_lead,
            f.id_mensagem,
            f.created_at as ultimo_envio,
            m.ordem as ultima_ordem,
            m_proxima.intervalo_numero,
            m_proxima.intervalo_tipo,
            m_proxima.id as proxima_mensagem_id,
            m_proxima.ordem as proxima_ordem
        FROM followup f
        INNER JOIN mensagens m ON f.id_mensagem = m.id
        LEFT JOIN mensagens m_proxima ON m_proxima.ordem = m.ordem + 1 
            AND m_proxima.ativo = true
            AND (m_proxima.cliente_id = p_cliente_id OR m_proxima.cliente_id IS NULL)
        WHERE f.status = 'sucesso'
            AND f.cliente_id = p_cliente_id
        ORDER BY f.id_lead, f.created_at DESC
    ),
    leads_prontos_proxima_mensagem AS (
        -- Leads que estão no prazo para receber a próxima mensagem
        SELECT 
            l.id as lead_id,
            l.nome as lead_nome,
            l.telefone as lead_telefone,
            l.email as lead_email,
            l.created_at as lead_created_at,
            luf.proxima_mensagem_id as mensagem_id,
            m_proxima.nome as mensagem_nome,
            m_proxima.texto_mensagem as mensagem_texto,
            luf.proxima_ordem as mensagem_ordem,
            m_proxima.created_at as mensagem_created_at,
            true as tem_followup_anterior,
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
                    WHEN 'segundos' THEN luf.ultimo_envio + (luf.intervalo_numero || ' seconds')::interval
                    WHEN 'minutos' THEN luf.ultimo_envio + (luf.intervalo_numero || ' minutes')::interval
                    WHEN 'horas' THEN luf.ultimo_envio + (luf.intervalo_numero || ' hours')::interval
                    WHEN 'dias' THEN luf.ultimo_envio + (luf.intervalo_numero || ' days')::interval
                    ELSE luf.ultimo_envio
                END <= NOW()
            )
    ),
    leads_sem_followup AS (
        -- Leads que nunca receberam mensagem (primeira mensagem)
        SELECT 
            l.id as lead_id,
            l.nome as lead_nome,
            l.telefone as lead_telefone,
            l.email as lead_email,
            l.created_at as lead_created_at,
            m.id as mensagem_id,
            m.nome as mensagem_nome,
            m.texto_mensagem as mensagem_texto,
            m.ordem as mensagem_ordem,
            m.created_at as mensagem_created_at,
            false as tem_followup_anterior,
            2 as prioridade,
            l.created_at as ultimo_envio
        FROM leads l
        CROSS JOIN mensagens m
        WHERE l.cliente_id = p_cliente_id
            AND l.deletado = false
            AND m.ativo = true
            AND m.ordem = 1
            AND (m.cliente_id = p_cliente_id OR m.cliente_id IS NULL)
            AND NOT EXISTS (
                SELECT 1 FROM followup f 
                WHERE f.id_lead = l.id AND f.status = 'sucesso'
            )
    )
    SELECT 
        resultado.lead_id::uuid,
        resultado.lead_nome::text,
        resultado.lead_telefone::text,
        resultado.lead_email::text,
        resultado.lead_created_at::timestamp,
        resultado.mensagem_id::uuid,
        resultado.mensagem_nome::text,
        resultado.mensagem_texto::text,
        resultado.mensagem_ordem::integer,
        resultado.mensagem_created_at::timestamp,
        resultado.tem_followup_anterior::boolean,
        resultado.prioridade::integer
    FROM (
        SELECT * FROM leads_prontos_proxima_mensagem
        UNION ALL
        SELECT * FROM leads_sem_followup
    ) AS resultado
    ORDER BY resultado.prioridade ASC, resultado.ultimo_envio ASC
    LIMIT p_limite;
END;
$$;

-- Create indexes for optimization
CREATE INDEX IF NOT EXISTS idx_leads_cliente_deletado ON leads(cliente_id, deletado);
CREATE INDEX IF NOT EXISTS idx_followup_lead_status ON followup(id_lead, status);
CREATE INDEX IF NOT EXISTS idx_mensagens_ordem_ativo ON mensagens(ordem, ativo);

-- Comment explaining the function
COMMENT ON FUNCTION buscar_leads_para_followup(uuid, integer) IS 
'Função consolidada para buscar leads para envio de mensagens de followup com priorização. Leads com followup anterior têm prioridade maior.';