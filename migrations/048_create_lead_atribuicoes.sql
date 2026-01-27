-- Migration: 048_create_lead_atribuicoes
-- Description: Create tables for lead distribution and assignment to sellers
-- Dependencies: 012_create_leads, 005_create_usuarios, 004_create_clientes, 035_create_perfis

-- Tabela de atribuições de leads para vendedores
CREATE TABLE IF NOT EXISTS lead_atribuicoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  vendedor_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  atribuido_por uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  status varchar(50) NOT NULL DEFAULT 'ativo', -- ativo, concluido, transferido, cancelado
  notificado boolean NOT NULL DEFAULT false,
  notificado_em TIMESTAMP WITH TIME ZONE,
  motivo_transferencia text,
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
);

-- Índice único para evitar duplicatas de atribuição ativa
CREATE UNIQUE INDEX IF NOT EXISTS idx_lead_atribuicoes_unique_ativo 
ON lead_atribuicoes (lead_id, vendedor_id) 
WHERE status = 'ativo';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_lead_atribuicoes_lead ON lead_atribuicoes(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_atribuicoes_vendedor ON lead_atribuicoes(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_lead_atribuicoes_cliente ON lead_atribuicoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_lead_atribuicoes_status ON lead_atribuicoes(status);
CREATE INDEX IF NOT EXISTS idx_lead_atribuicoes_notificado ON lead_atribuicoes(notificado);
CREATE INDEX IF NOT EXISTS idx_lead_atribuicoes_created ON lead_atribuicoes(created_at);
CREATE INDEX IF NOT EXISTS idx_lead_atribuicoes_embedding ON lead_atribuicoes USING ivfflat (embedding vector_cosine_ops);

COMMENT ON TABLE lead_atribuicoes IS 'Registro de atribuições de leads para vendedores com histórico de transferências';
COMMENT ON COLUMN lead_atribuicoes.status IS 'Status da atribuição: ativo (em atendimento), concluido (venda fechada), transferido (passou para outro), cancelado';
COMMENT ON COLUMN lead_atribuicoes.atribuido_por IS 'Usuário que fez a atribuição (NULL = automático pelo sistema)';

-- Tabela de contadores para distribuição round-robin
CREATE TABLE IF NOT EXISTS vendedor_contador_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendedor_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  cliente_id uuid NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  total_leads integer NOT NULL DEFAULT 0,
  leads_ativos integer NOT NULL DEFAULT 0,
  leads_concluidos integer NOT NULL DEFAULT 0,
  ultima_atribuicao TIMESTAMP WITH TIME ZONE,
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  UNIQUE(vendedor_id, cliente_id)
);

CREATE INDEX IF NOT EXISTS idx_vendedor_contador_vendedor ON vendedor_contador_leads(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_vendedor_contador_cliente ON vendedor_contador_leads(cliente_id);
CREATE INDEX IF NOT EXISTS idx_vendedor_contador_leads_ativos ON vendedor_contador_leads(leads_ativos);
CREATE INDEX IF NOT EXISTS idx_vendedor_contador_embedding ON vendedor_contador_leads USING ivfflat (embedding vector_cosine_ops);

COMMENT ON TABLE vendedor_contador_leads IS 'Contadores de leads por vendedor para distribuição equilibrada (round-robin)';

-- Tabela de fila de espera para leads sem vendedor disponível
CREATE TABLE IF NOT EXISTS lead_fila_espera (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  cliente_id uuid NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  prioridade integer NOT NULL DEFAULT 0, -- maior = mais prioritário
  motivo varchar(255),
  processado boolean NOT NULL DEFAULT false,
  processado_em TIMESTAMP WITH TIME ZONE,
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  UNIQUE(lead_id)
);

CREATE INDEX IF NOT EXISTS idx_lead_fila_cliente ON lead_fila_espera(cliente_id);
CREATE INDEX IF NOT EXISTS idx_lead_fila_processado ON lead_fila_espera(processado);
CREATE INDEX IF NOT EXISTS idx_lead_fila_prioridade ON lead_fila_espera(prioridade DESC);
CREATE INDEX IF NOT EXISTS idx_lead_fila_embedding ON lead_fila_espera USING ivfflat (embedding vector_cosine_ops);

COMMENT ON TABLE lead_fila_espera IS 'Fila de espera para leads qualificados aguardando vendedor disponível';

-- Função para incrementar contador do vendedor
CREATE OR REPLACE FUNCTION incrementar_contador_vendedor(
  p_vendedor_id uuid,
  p_cliente_id uuid
) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO vendedor_contador_leads (vendedor_id, cliente_id, total_leads, leads_ativos, ultima_atribuicao)
  VALUES (p_vendedor_id, p_cliente_id, 1, 1, NOW())
  ON CONFLICT (vendedor_id, cliente_id)
  DO UPDATE SET
    total_leads = vendedor_contador_leads.total_leads + 1,
    leads_ativos = vendedor_contador_leads.leads_ativos + 1,
    ultima_atribuicao = NOW(),
    updated_at = NOW();
END;
$$;

-- Função para decrementar leads ativos (quando lead é concluído/transferido)
CREATE OR REPLACE FUNCTION decrementar_leads_ativos(
  p_vendedor_id uuid,
  p_cliente_id uuid,
  p_concluido boolean DEFAULT false
) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE vendedor_contador_leads
  SET 
    leads_ativos = GREATEST(leads_ativos - 1, 0),
    leads_concluidos = CASE WHEN p_concluido THEN leads_concluidos + 1 ELSE leads_concluidos END,
    updated_at = NOW()
  WHERE vendedor_id = p_vendedor_id AND cliente_id = p_cliente_id;
END;
$$;

-- Função para buscar próximo vendedor (round-robin por menor carga)
CREATE OR REPLACE FUNCTION buscar_proximo_vendedor(
  p_cliente_id uuid
) RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_vendedor_id uuid;
BEGIN
  -- Buscar vendedor ativo com perfil "Vendedor" e menor carga de leads ativos
  SELECT u.id INTO v_vendedor_id
  FROM usuarios u
  INNER JOIN usuario_perfis up ON up.usuario_id = u.id AND up.cliente_id = p_cliente_id
  INNER JOIN perfis p ON p.id = up.perfil_id
  LEFT JOIN vendedor_contador_leads vcl ON vcl.vendedor_id = u.id AND vcl.cliente_id = p_cliente_id
  WHERE u.cliente_id = p_cliente_id
    AND u.ativo = true
    AND up.ativo = true
    AND p.nome = 'Vendedor'
  ORDER BY COALESCE(vcl.leads_ativos, 0) ASC, COALESCE(vcl.ultima_atribuicao, '1970-01-01') ASC
  LIMIT 1;
  
  RETURN v_vendedor_id;
END;
$$;

COMMENT ON FUNCTION incrementar_contador_vendedor IS 'Incrementa contadores quando lead é atribuído a vendedor';
COMMENT ON FUNCTION decrementar_leads_ativos IS 'Decrementa leads ativos quando lead é concluído ou transferido';
COMMENT ON FUNCTION buscar_proximo_vendedor IS 'Retorna ID do vendedor com menor carga para distribuição round-robin';
