-- Migration: 022_create_configuracoes_followup
-- Description: Create configuracoes_followup table
-- Dependencies: 004_create_clientes

CREATE TABLE IF NOT EXISTS configuracoes_followup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dia_horario_envio jsonb NOT NULL DEFAULT '{"segunda": "08:00-18:00", "terca": "08:00-18:00", "quarta": "08:00-18:00", "quinta": "08:00-18:00", "sexta": "08:00-18:00", "sabado": "08:00-12:00", "domingo": "fechado"}',
  qtd_envio_diario integer NOT NULL DEFAULT 50,
  em_execucao boolean NOT NULL DEFAULT false,
  ativo boolean NOT NULL DEFAULT false,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE, -- referência ao cliente proprietário
  embedding vector(1536), -- campo para embedding da LLM
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_configuracoes_followup_cliente_id ON configuracoes_followup(cliente_id);
CREATE INDEX IF NOT EXISTS idx_configuracoes_followup_embedding ON configuracoes_followup USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_configuracoes_followup_dia_horario ON configuracoes_followup USING gin (dia_horario_envio);

-- Add comment to document the JSON structure
COMMENT ON COLUMN configuracoes_followup.dia_horario_envio IS 'JSON com estrutura: {"segunda": "09:00-19:00", "terca": "09:00-19:00", "quarta": "09:00-19:00", "quinta": "09:00-19:00", "sexta": "09:00-19:00", "sabado": "fechado", "domingo": "fechado"}';

-- Create trigger to automatically update updated_at on record modification
CREATE OR REPLACE FUNCTION update_configuracoes_followup_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_configuracoes_followup_updated_at ON configuracoes_followup;

CREATE TRIGGER update_configuracoes_followup_updated_at
    BEFORE UPDATE ON configuracoes_followup
    FOR EACH ROW
    EXECUTE FUNCTION update_configuracoes_followup_updated_at();

-- First, check if parameters already exist and insert only if they don't
DO $$
BEGIN
    -- Insert dia_horario_envios_followup if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM parametros WHERE chave = 'dia_horario_envios_followup') THEN
        INSERT INTO parametros (chave, valor) VALUES
        ('dia_horario_envios_followup', '{"segunda": "08:00-18:00", "terca": "08:00-18:00", "quarta": "08:00-18:00", "quinta": "08:00-18:00", "sexta": "08:00-18:00", "sabado": "08:00-12:00", "domingo": "fechado"}');
        RAISE NOTICE 'Parameter dia_horario_envios_followup inserted successfully';
    ELSE
        RAISE NOTICE 'Parameter dia_horario_envios_followup already exists, skipping insertion';
    END IF;
    
    -- Insert limite_envios_diarios_followup if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM parametros WHERE chave = 'limite_envios_diarios_followup') THEN
        INSERT INTO parametros (chave, valor) VALUES
        ('limite_envios_diarios_followup', '50');
        RAISE NOTICE 'Parameter limite_envios_diarios_followup inserted successfully';
    ELSE
        RAISE NOTICE 'Parameter limite_envios_diarios_followup already exists, skipping insertion';
    END IF;
END $$;

-- Create function to automatically create configuracoes_followup record
-- Drop function if exists to avoid conflicts
DROP FUNCTION IF EXISTS create_configuracoes_followup_for_new_cliente() CASCADE;

CREATE OR REPLACE FUNCTION create_configuracoes_followup_for_new_cliente()
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
    
    -- Insert new configuracoes_followup record
    INSERT INTO configuracoes_followup (
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

-- Create trigger on clientes table (drop if exists first)
DROP TRIGGER IF EXISTS trigger_create_configuracoes_followup ON clientes;

DO $$
BEGIN
    CREATE TRIGGER trigger_create_configuracoes_followup
        AFTER INSERT ON clientes
        FOR EACH ROW
        EXECUTE FUNCTION create_configuracoes_followup_for_new_cliente();
        
    RAISE NOTICE 'Trigger trigger_create_configuracoes_followup created successfully';
END $$;

-- Add comment to document the trigger
COMMENT ON TRIGGER trigger_create_configuracoes_followup ON clientes IS 'Automatically creates a configuracoes_followup record when a new client is created, using default values from parametros table';