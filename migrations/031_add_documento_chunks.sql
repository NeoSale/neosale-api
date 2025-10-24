-- Migration: 031_add_documento_chunks
-- Description: Add support for document chunking
-- Dependencies: 030_create_documentos

-- Adicionar campos para suporte a chunks
ALTER TABLE documentos 
ADD COLUMN IF NOT EXISTS documento_pai_id uuid REFERENCES documentos(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS chunk_index integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_chunks integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS chunk_texto text;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_documentos_documento_pai_id ON documentos(documento_pai_id) WHERE deletado = false;
CREATE INDEX IF NOT EXISTS idx_documentos_chunk_index ON documentos(chunk_index) WHERE deletado = false;

-- Comentários para documentação
COMMENT ON COLUMN documentos.documento_pai_id IS 'ID do documento pai quando este é um chunk';
COMMENT ON COLUMN documentos.chunk_index IS 'Índice do chunk (0 = documento completo ou primeiro chunk)';
COMMENT ON COLUMN documentos.total_chunks IS 'Total de chunks do documento';
COMMENT ON COLUMN documentos.chunk_texto IS 'Texto do chunk (usado para busca e contexto)';

-- Atualizar a função de busca para incluir informações de chunks
CREATE OR REPLACE FUNCTION public.match_documentos_by_base_cliente(
  filter jsonb,
  match_count integer,
  query_embedding vector
)
RETURNS TABLE (
  metadata jsonb, 
  similarity float,
  chunk_info jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cliente_id uuid;
  v_base_ids_text text[];
BEGIN
  v_cliente_id := (filter->>'cliente_id')::uuid;

  -- extrai ["...","..."] do filter->'base_id' como text[]
  SELECT COALESCE(array_agg(x), '{}') INTO v_base_ids_text
  FROM (
    SELECT jsonb_array_elements_text(COALESCE(filter->'base_id','[]'::jsonb)) AS x
  ) s;

  RETURN QUERY
  SELECT
    to_jsonb(d.*) - 'embedding' - 'base64' - 'chunk_texto' AS metadata,
    1 - (d.embedding <=> query_embedding) AS similarity,
    jsonb_build_object(
      'is_chunk', d.documento_pai_id IS NOT NULL,
      'chunk_index', d.chunk_index,
      'total_chunks', d.total_chunks,
      'documento_pai_id', d.documento_pai_id,
      'chunk_texto', LEFT(d.chunk_texto, 500)  -- Primeiros 500 caracteres do chunk
    ) AS chunk_info
  FROM public.documentos d
  WHERE d.embedding IS NOT NULL
    AND d.deletado = false
    AND d.cliente_id = v_cliente_id
    -- base_id é JSONB: verifica se QUALQUER id do filtro está dentro do array JSONB
    AND EXISTS (
      SELECT 1
      FROM jsonb_array_elements_text(d.base_id) j(val)
      WHERE j.val = ANY(v_base_ids_text)
    )
  ORDER BY d.embedding <=> query_embedding
  LIMIT GREATEST(match_count, 1);
END;
$$;

-- Manter as permissões
GRANT EXECUTE ON FUNCTION public.match_documentos_by_base_cliente(jsonb, integer, vector)
TO anon, authenticated, service_role;
