-- =====================================================
-- Migration 053: Adicionar cliente_id às tabelas de prospecting
-- =====================================================
-- Implementa isolamento de dados por cliente (SaaS) nas tabelas
-- de LinkedIn prospecting para garantir separação de dados entre clientes

-- 1. Adicionar cliente_id à tabela linkedin_prospects
ALTER TABLE linkedin_prospects
ADD COLUMN cliente_id UUID;

-- Adicionar constraint de Foreign Key
ALTER TABLE linkedin_prospects
ADD CONSTRAINT fk_linkedin_prospects_cliente
FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE;

-- Criar índice para performance em queries por cliente
CREATE INDEX IF NOT EXISTS idx_lp_cliente_id ON linkedin_prospects(cliente_id);
CREATE INDEX IF NOT EXISTS idx_lp_cliente_status ON linkedin_prospects(cliente_id, status);
CREATE INDEX IF NOT EXISTS idx_lp_cliente_setor ON linkedin_prospects(cliente_id, setor);

-- 2. Adicionar cliente_id à tabela prospection_sequences
ALTER TABLE prospection_sequences
ADD COLUMN cliente_id UUID;

-- Adicionar constraint de Foreign Key
ALTER TABLE prospection_sequences
ADD CONSTRAINT fk_prospection_sequences_cliente
FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE;

-- Criar índice para performance em queries por cliente
CREATE INDEX IF NOT EXISTS idx_ps_cliente_id ON prospection_sequences(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ps_cliente_setor ON prospection_sequences(cliente_id, setor);
CREATE INDEX IF NOT EXISTS idx_ps_cliente_active ON prospection_sequences(cliente_id, is_active)
WHERE is_active = true;

-- 3. Adicionar cliente_id à tabela prospection_activities
ALTER TABLE prospection_activities
ADD COLUMN cliente_id UUID;

-- Adicionar constraint de Foreign Key
ALTER TABLE prospection_activities
ADD CONSTRAINT fk_prospection_activities_cliente
FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE;

-- Criar índice para performance em queries por cliente
CREATE INDEX IF NOT EXISTS idx_pa_cliente_id ON prospection_activities(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pa_cliente_prospect ON prospection_activities(cliente_id, prospect_id);
CREATE INDEX IF NOT EXISTS idx_pa_cliente_acao ON prospection_activities(cliente_id, acao);

-- =====================================================
-- POLÍTICAS DE SEGURANÇA (Row Level Security - RLS)
-- =====================================================
-- Opcional: Implementar RLS para garantir isolamento em nível de banco de dados

-- Enable RLS nas tabelas de prospecting
ALTER TABLE linkedin_prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospection_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospection_activities ENABLE ROW LEVEL SECURITY;

-- Política: Usuários só veem prospects do seu cliente
CREATE POLICY IF NOT EXISTS rls_linkedin_prospects ON linkedin_prospects
FOR SELECT
USING (
  cliente_id IN (
    SELECT cliente_id FROM usuarios
    WHERE usuarios.id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS rls_linkedin_prospects_insert ON linkedin_prospects
FOR INSERT
WITH CHECK (
  cliente_id IN (
    SELECT cliente_id FROM usuarios
    WHERE usuarios.id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS rls_linkedin_prospects_update ON linkedin_prospects
FOR UPDATE
USING (
  cliente_id IN (
    SELECT cliente_id FROM usuarios
    WHERE usuarios.id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS rls_linkedin_prospects_delete ON linkedin_prospects
FOR DELETE
USING (
  cliente_id IN (
    SELECT cliente_id FROM usuarios
    WHERE usuarios.id = auth.uid()
  )
);

-- Política: Usuários só veem sequências do seu cliente
CREATE POLICY IF NOT EXISTS rls_prospection_sequences ON prospection_sequences
FOR SELECT
USING (
  cliente_id IS NULL OR cliente_id IN (
    SELECT cliente_id FROM usuarios
    WHERE usuarios.id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS rls_prospection_sequences_insert ON prospection_sequences
FOR INSERT
WITH CHECK (
  cliente_id IN (
    SELECT cliente_id FROM usuarios
    WHERE usuarios.id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS rls_prospection_sequences_update ON prospection_sequences
FOR UPDATE
USING (
  cliente_id IN (
    SELECT cliente_id FROM usuarios
    WHERE usuarios.id = auth.uid()
  )
);

-- Política: Usuários só veem atividades do seu cliente
CREATE POLICY IF NOT EXISTS rls_prospection_activities ON prospection_activities
FOR SELECT
USING (
  cliente_id IN (
    SELECT cliente_id FROM usuarios
    WHERE usuarios.id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS rls_prospection_activities_insert ON prospection_activities
FOR INSERT
WITH CHECK (
  cliente_id IN (
    SELECT cliente_id FROM usuarios
    WHERE usuarios.id = auth.uid()
  )
);

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para copiar cliente_id automaticamente ao criar prospect
CREATE OR REPLACE FUNCTION set_linkedin_prospect_cliente_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.cliente_id IS NULL AND NEW.created_by IS NOT NULL THEN
    SELECT cliente_id INTO NEW.cliente_id
    FROM usuarios
    WHERE id = NEW.created_by;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_linkedin_prospect_cliente_id
BEFORE INSERT ON linkedin_prospects
FOR EACH ROW EXECUTE FUNCTION set_linkedin_prospect_cliente_id();

-- =====================================================
-- COMENTÁRIOS DOCUMENTAÇÃO
-- =====================================================

COMMENT ON COLUMN linkedin_prospects.cliente_id IS 'Identificador do cliente (SaaS) - usado para isolar dados entre clientes';
COMMENT ON COLUMN prospection_sequences.cliente_id IS 'Identificador do cliente (SaaS) - sequências personalizadas por cliente; NULL = template global';
COMMENT ON COLUMN prospection_activities.cliente_id IS 'Identificador do cliente (SaaS) - usado para isolar log de atividades por cliente';
