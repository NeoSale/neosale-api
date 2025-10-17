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
  filter jsonb,
  match_count integer,
  query_embedding vector
)
returns table (metadata jsonb, similarity float)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cliente_id uuid;
  v_base_ids_text text[];
begin
  v_cliente_id := (filter->>'cliente_id')::uuid;

  -- extrai ["...","..."] do filter->'base_id' como text[]
  select coalesce(array_agg(x), '{}') into v_base_ids_text
  from (
    select jsonb_array_elements_text(coalesce(filter->'base_id','[]'::jsonb)) as x
  ) s;

  return query
  select
    to_jsonb(d.*) - 'embedding' - 'base64' as metadata,
    1 - (d.embedding <=> query_embedding) as similarity
  from public.documentos d
  where d.embedding is not null
    and d.deletado = false
    and d.cliente_id = v_cliente_id
    -- base_id é JSONB: verifica se QUALQUER id do filtro está dentro do array JSONB
    and exists (
      select 1
      from jsonb_array_elements_text(d.base_id) j(val)
      where j.val = any(v_base_ids_text)
    )
  order by d.embedding <=> query_embedding
  limit greatest(match_count,1);
end;
$$;

grant execute on function public.match_documentos_by_base_cliente(jsonb, integer, vector)
to anon, authenticated, service_role;
