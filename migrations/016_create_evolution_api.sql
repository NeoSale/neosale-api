-- Migration: 019_create_evolution_api.sql
-- Description: Criar tabela evolution_api para gerenciar instâncias da Evolution API

-- Criar tabela evolution_api
CREATE TABLE IF NOT EXISTS evolution_api (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL,
    instance_id VARCHAR(255),
    instance_name VARCHAR(100) NOT NULL,
    base_url VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) NOT NULL,
    webhook_url VARCHAR(255),
    webhook_events TEXT[], -- Array de eventos do webhook
    settings JSONB DEFAULT '{}', -- Configurações da instância
    status VARCHAR(50) DEFAULT 'disconnected', -- connected, disconnected, connecting
    qr_code TEXT, -- QR Code para conexão
    connection_data JSONB, -- Dados de conexão
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT fk_evolution_api_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    CONSTRAINT unique_evolution_api_instance_per_client UNIQUE (cliente_id, instance_name)
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_evolution_api_cliente_id ON evolution_api(cliente_id);
CREATE INDEX IF NOT EXISTS idx_evolution_api_instance_name ON evolution_api(instance_name);
CREATE INDEX IF NOT EXISTS idx_evolution_api_status ON evolution_api(status);
CREATE INDEX IF NOT EXISTS idx_evolution_api_created_at ON evolution_api(created_at);

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_evolution_api_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS trigger_update_evolution_api_updated_at ON evolution_api;
CREATE TRIGGER trigger_update_evolution_api_updated_at
    BEFORE UPDATE ON evolution_api
    FOR EACH ROW
    EXECUTE FUNCTION update_evolution_api_updated_at();

-- Comentários na tabela
COMMENT ON TABLE evolution_api IS 'Tabela para gerenciar instâncias da Evolution API';
COMMENT ON COLUMN evolution_api.id IS 'Identificador único da instância';
COMMENT ON COLUMN evolution_api.cliente_id IS 'ID do cliente proprietário da instância';
COMMENT ON COLUMN evolution_api.instance_name IS 'Nome único da instância';
COMMENT ON COLUMN evolution_api.base_url IS 'URL base da API Evolution';
COMMENT ON COLUMN evolution_api.api_key IS 'Chave de API para autenticação';
COMMENT ON COLUMN evolution_api.webhook_url IS 'URL para receber webhooks';
COMMENT ON COLUMN evolution_api.webhook_events IS 'Lista de eventos do webhook';
COMMENT ON COLUMN evolution_api.settings IS 'Configurações da instância em formato JSON';
COMMENT ON COLUMN evolution_api.status IS 'Status da conexão da instância';
COMMENT ON COLUMN evolution_api.qr_code IS 'QR Code para conexão do WhatsApp';
COMMENT ON COLUMN evolution_api.connection_data IS 'Dados de conexão em formato JSON';