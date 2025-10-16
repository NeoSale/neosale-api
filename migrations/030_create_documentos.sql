-- Migration: 029_create_documentos
-- Description: Create documentos table for storing client documents
-- Dependencies: 004_create_clientes

CREATE TABLE IF NOT EXISTS documentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar(255) NOT NULL,
  descricao text,
  nome_arquivo varchar(500) NOT NULL,
  base64 text, -- conteúdo do arquivo em base64
  cliente_id uuid NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  base_id jsonb, -- lista de IDs de bases associadas
  embedding vector(1536), -- campo para embedding da LLM
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  deletado boolean DEFAULT false
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documentos_cliente_id ON documentos(cliente_id) WHERE deletado = false;
CREATE INDEX IF NOT EXISTS idx_documentos_base_id_jsonb ON documentos USING gin (base_id) WHERE deletado = false;
CREATE INDEX IF NOT EXISTS idx_documentos_nome ON documentos(nome) WHERE deletado = false;
CREATE INDEX IF NOT EXISTS idx_documentos_created_at ON documentos(created_at) WHERE deletado = false;
CREATE INDEX IF NOT EXISTS idx_documentos_embedding ON documentos USING ivfflat (embedding vector_cosine_ops) WHERE deletado = false;

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_documentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_documentos_updated_at
    BEFORE UPDATE ON documentos
    FOR EACH ROW
    EXECUTE FUNCTION update_documentos_updated_at();

create or replace function public.match_documentos(
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
    to_jsonb(d.*) - 'embedding' as metadata,
    1 - (d.embedding <=> query_embedding) as similarity
  from public.documentos d
  where d.embedding is not null
    and (to_jsonb(d.*) - 'embedding') @> filter
  order by d.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Função para buscar documentos por base_id e cliente_id com embedding
create or replace function public.match_documentos_by_base_cliente(
  p_base_ids text[],
  p_cliente_id uuid,
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
    to_jsonb(d.*) - 'embedding' - 'base64' as metadata,
    1 - (d.embedding <=> query_embedding) as similarity
  from public.documentos d
  where d.embedding is not null
    and d.deletado = false
    and d.cliente_id = p_cliente_id
    and d.base_id ?| p_base_ids
  order by d.embedding <=> query_embedding
  limit match_count;
end;
$$;
