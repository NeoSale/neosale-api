-- Migration: 026_create_historico_prompt
-- Description: Tabela para armazenar histórico de prompts dos agentes
-- Dependencies: 025_create_agentes

CREATE TABLE IF NOT EXISTS historico_prompt (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agente_id uuid NOT NULL REFERENCES agentes(id) ON DELETE CASCADE,
  cliente_id uuid NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  prompt text,
  prompt_agendamento text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_historico_prompt_agente_id ON historico_prompt(agente_id);
CREATE INDEX IF NOT EXISTS idx_historico_prompt_cliente_id ON historico_prompt(cliente_id);
CREATE INDEX IF NOT EXISTS idx_historico_prompt_created_at ON historico_prompt(created_at);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_historico_prompt_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_historico_prompt_updated_at
  BEFORE UPDATE ON historico_prompt
  FOR EACH ROW
  EXECUTE FUNCTION update_historico_prompt_updated_at();