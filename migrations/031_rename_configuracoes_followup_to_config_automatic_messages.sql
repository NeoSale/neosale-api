-- Migration: 031_rename_configuracoes_followup_to_config_automatic_messages
-- Description: Rename configuracoes_followup table to config_automatic_messages
-- Dependencies: 022_create_configuracoes_followup

-- =====================================================
-- RENOMEAR TABELA
-- =====================================================

-- Renomear a tabela principal
ALTER TABLE IF EXISTS configuracoes_followup RENAME TO config_automatic_messages;

-- =====================================================
-- RENOMEAR ÍNDICES
-- =====================================================

-- Renomear índices para refletir o novo nome da tabela
ALTER INDEX IF EXISTS idx_configuracoes_followup_cliente_id RENAME TO idx_config_automatic_messages_cliente_id;
ALTER INDEX IF EXISTS idx_configuracoes_followup_index RENAME TO idx_config_automatic_messages_index;
ALTER INDEX IF EXISTS idx_configuracoes_followup_embedding RENAME TO idx_config_automatic_messages_embedding;
ALTER INDEX IF EXISTS idx_configuracoes_followup_dia_horario RENAME TO idx_config_automatic_messages_dia_horario;

-- =====================================================
-- ATUALIZAR FUNÇÃO DE TRIGGER updated_at
-- =====================================================

-- Dropar a função antiga
DROP FUNCTION IF EXISTS update_configuracoes_followup_updated_at() CASCADE;

-- Criar nova função com nome atualizado
CREATE OR REPLACE FUNCTION update_config_automatic_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger com novo nome
DROP TRIGGER IF EXISTS update_config_automatic_messages_updated_at ON config_automatic_messages;

CREATE TRIGGER update_config_automatic_messages_updated_at
    BEFORE UPDATE ON config_automatic_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_config_automatic_messages_updated_at();

-- =====================================================
-- ATUALIZAR FUNÇÃO DE CRIAÇÃO AUTOMÁTICA
-- =====================================================

-- Dropar a função antiga
DROP FUNCTION IF EXISTS create_configuracoes_followup_for_new_cliente() CASCADE;

-- Criar nova função com nome atualizado
CREATE OR REPLACE FUNCTION create_config_automatic_messages_for_new_cliente()
RETURNS TRIGGER AS $$
DECLARE
    dia_horario_valor jsonb;
    limite_envios_valor integer;
BEGIN
    -- Get default values from parametros table with fallback values
    SELECT valor::jsonb INTO dia_horario_valor 
    FROM parametros 
    WHERE chave = 'dia_horario_envios_followup' 
    LIMIT 1;
    
    SELECT valor::integer INTO limite_envios_valor 
    FROM parametros 
    WHERE chave = 'limite_envios_diarios_followup' 
    LIMIT 1;
    
    -- Set fallback values if parameters not found
    IF dia_horario_valor IS NULL THEN
        dia_horario_valor := '{"segunda": "08:00-18:00", "terca": "08:00-18:00", "quarta": "08:00-18:00", "quinta": "08:00-18:00", "sexta": "08:00-18:00", "sabado": "08:00-12:00", "domingo": "fechado"}'::jsonb;
        RAISE WARNING 'Parameter dia_horario_envios_followup not found, using fallback value for client %', NEW.id;
    END IF;
    
    IF limite_envios_valor IS NULL THEN
        limite_envios_valor := 50;
        RAISE WARNING 'Parameter limite_envios_diarios_followup not found, using fallback value for client %', NEW.id;
    END IF;
    
    -- Insert new config_automatic_messages record
    INSERT INTO config_automatic_messages (
        cliente_id,
        dia_horario_envio,
        qtd_envio_diario,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        dia_horario_valor,
        limite_envios_valor,
        now(),
        now()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Dropar trigger antigo
DROP TRIGGER IF EXISTS trigger_create_configuracoes_followup ON clientes;

-- Criar trigger com novo nome
CREATE TRIGGER trigger_create_config_automatic_messages
    AFTER INSERT ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION create_config_automatic_messages_for_new_cliente();

-- =====================================================
-- ATUALIZAR COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE config_automatic_messages IS 'Configurações de mensagens automáticas por cliente';
COMMENT ON COLUMN config_automatic_messages.dia_horario_envio IS 'JSON com estrutura: {"segunda": "09:00-19:00", "terca": "09:00-19:00", "quarta": "09:00-19:00", "quinta": "09:00-19:00", "sexta": "09:00-19:00", "sabado": "fechado", "domingo": "fechado"}';
COMMENT ON COLUMN config_automatic_messages."index" IS 'Índice numérico para identificação da configuração de mensagens automáticas';
COMMENT ON TRIGGER trigger_create_config_automatic_messages ON clientes IS 'Automatically creates a config_automatic_messages record when a new client is created, using default values from parametros table';
