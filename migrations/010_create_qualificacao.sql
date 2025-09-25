-- Migration: 010_create_qualificacao
-- Description: Create qualificacao table and insert initial data
-- Dependencies: None

CREATE TABLE IF NOT EXISTS qualificacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  tipo_agente jsonb NOT NULL, -- array de tipos de agente que podem usar esta qualificação
  descricao text NOT NULL,
  embedding vector(1536), -- campo para embedding da LLM
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_qualificacao_nome ON qualificacao(nome);
CREATE INDEX IF NOT EXISTS idx_qualificacao_tipo_agente ON qualificacao USING gin(tipo_agente);
CREATE INDEX IF NOT EXISTS idx_qualificacao_embedding ON qualificacao USING ivfflat (embedding vector_cosine_ops);

-- Insert initial qualifications data
INSERT INTO qualificacao (nome, tipo_agente, descricao) VALUES
('Novo', '["Todos"]', 'Lead ou cliente entrou, mas não interagiu'),
('Curioso', '["SDR", "Closer"]', 'Forneceu dados básicos, início da conversa'),
('Indeciso', '["SDR", "Closer"]', 'Identificou problema, mas não sabe se vai agir'),
('Engajado', '["SDR", "Closer"]', 'Entende impacto do problema, conversa avançando'),
('Decidido', '["SDR", "Closer"]', 'Quer resolver o problema; pronto para fechamento'),
('Frustrado', '["SDR", "Closer", "Atendimento"]', 'Demonstrou insatisfação com atendimento ou processo'),
('Desinteressado', '["SDR", "Closer"]', 'Fora do perfil ou desistente'),
('Atendimento', '["Atendimento"]', 'Está em conversa com equipe de suporte ou pré-venda'),
('Problema', '["Atendimento"]', 'Cliente relatou um problema (ticket técnico, SAC, etc.)'),
('Satisfeito', '["Atendimento"]', 'Cliente validou a solução ou finalizou a compra com sucesso')
ON CONFLICT (nome) DO NOTHING;