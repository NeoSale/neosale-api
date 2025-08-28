-- Migration: 029_update_evolution_api_fields.sql
-- Description: Atualizar tabela evolution_api com novos campos e renomear campo existente

-- Adicionar novo campo id_agente
ALTER TABLE evolution_api 
ADD COLUMN IF NOT EXISTS id_agente UUID REFERENCES agentes(id) ON DELETE SET NULL;

-- Renomear campo agendamento para followup
ALTER TABLE evolution_api 
RENAME COLUMN agendamento TO followup;

-- Adicionar novo campo qtd_envios_diarios
ALTER TABLE evolution_api 
ADD COLUMN IF NOT EXISTS qtd_envios_diarios INTEGER DEFAULT 50;

-- Criar índice para o novo campo id_agente
CREATE INDEX IF NOT EXISTS idx_evolution_api_id_agente ON evolution_api(id_agente);

-- Comentários para documentação
COMMENT ON COLUMN evolution_api.id_agente IS 'Referência ao agente responsável pela instância';
COMMENT ON COLUMN evolution_api.followup IS 'Indica se a instância está configurada para followup';
COMMENT ON COLUMN evolution_api.qtd_envios_diarios IS 'Quantidade máxima de envios diários permitidos';