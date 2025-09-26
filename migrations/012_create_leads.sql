-- Migration: 012_create_leads
-- Description: Create leads table with all foreign key references
-- Dependencies: 006_create_origens_leads, 007_create_mensagens, 008_create_etapas_funil, 009_create_status_negociacao, 010_create_qualificacao, 011_create_followup, 004_create_clientes

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text,
  telefone text,
  email text,
  empresa text,
  cargo text,
  contador text,
  escritorio text,
  responsavel text,
  cnpj text,
  observacao text,
  resumo text, -- resumo do lead gerado pela IA ou inserido manualmente
  segmento text,
  erp_atual text,
  origem_id uuid REFERENCES origens_leads(id),
  status_agendamento boolean DEFAULT false,
  mensagem_id uuid REFERENCES mensagens(id),
  etapa_funil_id uuid REFERENCES etapas_funil(id),
  status_negociacao_id uuid REFERENCES status_negociacao(id),
  qualificacao_id uuid REFERENCES qualificacao(id),
  deletado boolean DEFAULT false,
  ai_habilitada boolean DEFAULT true, -- indica se a IA está habilitada para este lead
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE, -- referência ao cliente proprietário
  profile_picture_url text, -- URL da foto de perfil do lead
  instance_name text, -- nome da instância do Evolution API associada ao lead
  embedding vector(1536), -- campo para embedding da LLM
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_nome ON leads(nome);
CREATE INDEX IF NOT EXISTS idx_leads_telefone ON leads(telefone);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_resumo ON leads(resumo);
CREATE INDEX IF NOT EXISTS idx_leads_origem ON leads(origem_id);
CREATE INDEX IF NOT EXISTS idx_leads_etapa_funil ON leads(etapa_funil_id);
CREATE INDEX IF NOT EXISTS idx_leads_status_negociacao ON leads(status_negociacao_id);
CREATE INDEX IF NOT EXISTS idx_leads_qualificacao ON leads(qualificacao_id);
CREATE INDEX IF NOT EXISTS idx_leads_deletado ON leads(deletado);
CREATE INDEX IF NOT EXISTS idx_leads_cliente_id ON leads(cliente_id);
CREATE INDEX IF NOT EXISTS idx_leads_embedding ON leads USING ivfflat (embedding vector_cosine_ops);

-- Adiciona restrição única para telefone e cliente_id onde deletado=false
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'leads') THEN
        CREATE UNIQUE INDEX IF NOT EXISTS unique_telefone_cliente_ativo 
        ON leads (telefone, cliente_id) 
        WHERE deletado = false;
    END IF;
END
$$;

-- Adiciona comentário explicativo ao índice (se ele existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'unique_telefone_cliente_ativo') THEN
        COMMENT ON INDEX unique_telefone_cliente_ativo IS 'Garante que não pode existir o mesmo telefone com deletado=false mais de uma vez para o mesmo cliente';
    END IF;
END
$$;

create or replace function public.match_lead(
  filter jsonb,
  match_count integer,
  query_embedding vector
)
returns table (
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    to_jsonb(l.*) - 'embedding' as metadata,
    1 - (l.embedding <=> query_embedding) as similarity
  from public.leads l
  where l.embedding is not null
    and (to_jsonb(l.*) - 'embedding') @> filter
  order by l.embedding <=> query_embedding
  limit match_count;
end;
$$;
