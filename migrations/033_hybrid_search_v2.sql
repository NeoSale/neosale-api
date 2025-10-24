-- Migration: 033_hybrid_search_v2
-- Description: Fixed hybrid search function (text + semantic) - version 2
-- Dependencies: 032_add_hybrid_search

-- Dropar função antiga se existir
DROP FUNCTION IF EXISTS public.hybrid_search_documentos(jsonb, integer, vector, text);

-- Criar função híbrida corrigida
CREATE OR REPLACE FUNCTION public.hybrid_search_documentos(
  filter jsonb,
  match_count integer,
  query_embedding vector,
  query_text text DEFAULT NULL
)
RETURNS TABLE (
  metadata jsonb, 
  similarity float,
  chunk_info jsonb,
  text_match boolean,
  combined_score float
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

  -- Extrair base_ids do filtro
  SELECT COALESCE(array_agg(x), '{}') INTO v_base_ids_text
  FROM (
    SELECT jsonb_array_elements_text(COALESCE(filter->'base_id','[]'::jsonb)) AS x
  ) s;

  RETURN QUERY
  WITH text_results AS (
    -- PRIORIDADE 1: Busca por texto (se query_text foi fornecido)
    SELECT
      d.id,
      to_jsonb(d.*) - 'embedding' - 'base64' - 'chunk_texto' AS metadata,
      CASE 
        WHEN d.embedding IS NOT NULL THEN 1 - (d.embedding <=> query_embedding)
        ELSE 0
      END AS similarity,
      jsonb_build_object(
        'is_chunk', d.documento_pai_id IS NOT NULL,
        'chunk_index', d.chunk_index,
        'total_chunks', d.total_chunks,
        'documento_pai_id', d.documento_pai_id,
        'chunk_texto', LEFT(d.chunk_texto, 500)
      ) AS chunk_info,
      TRUE AS text_match,
      1.0 AS text_score
    FROM public.documentos d
    WHERE query_text IS NOT NULL
      AND d.chunk_texto ILIKE '%' || query_text || '%'
      AND d.deletado = false
      AND d.cliente_id = v_cliente_id
      AND (
        array_length(v_base_ids_text, 1) IS NULL OR
        EXISTS (
          SELECT 1
          FROM jsonb_array_elements_text(d.base_id) j(val)
          WHERE j.val = ANY(v_base_ids_text)
        )
      )
  ),
  semantic_results AS (
    -- PRIORIDADE 2: Busca semântica (complementar)
    SELECT
      d.id,
      to_jsonb(d.*) - 'embedding' - 'base64' - 'chunk_texto' AS metadata,
      1 - (d.embedding <=> query_embedding) AS similarity,
      jsonb_build_object(
        'is_chunk', d.documento_pai_id IS NOT NULL,
        'chunk_index', d.chunk_index,
        'total_chunks', d.total_chunks,
        'documento_pai_id', d.documento_pai_id,
        'chunk_texto', LEFT(d.chunk_texto, 500)
      ) AS chunk_info,
      FALSE AS text_match,
      0.0 AS text_score
    FROM public.documentos d
    WHERE d.embedding IS NOT NULL
      AND d.deletado = false
      AND d.cliente_id = v_cliente_id
      AND (
        array_length(v_base_ids_text, 1) IS NULL OR
        EXISTS (
          SELECT 1
          FROM jsonb_array_elements_text(d.base_id) j(val)
          WHERE j.val = ANY(v_base_ids_text)
        )
      )
      AND NOT EXISTS (
        SELECT 1 FROM text_results t WHERE t.id = d.id
      )
    ORDER BY d.embedding <=> query_embedding
    LIMIT match_count * 2
  )
  SELECT 
    r.metadata,
    r.similarity,
    r.chunk_info,
    r.text_match,
    CASE 
      WHEN r.text_match THEN 1.0 + (r.similarity * 0.5)
      ELSE r.similarity * 0.5
    END AS combined_score
  FROM (
    SELECT id, metadata, similarity, chunk_info, text_match, text_score FROM text_results
    UNION ALL
    SELECT id, metadata, similarity, chunk_info, text_match, text_score FROM semantic_results
  ) r
  ORDER BY 
    CASE 
      WHEN r.text_match THEN 1.0 + (r.similarity * 0.5)
      ELSE r.similarity * 0.5
    END DESC,
    r.similarity DESC
  LIMIT match_count;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.hybrid_search_documentos(jsonb, integer, vector, text)
TO anon, authenticated, service_role;

-- Comentário
COMMENT ON FUNCTION public.hybrid_search_documentos IS 
'Busca híbrida v2 que combina busca semântica (embedding) com busca por texto. 
Documentos que contêm o texto da query recebem prioridade absoluta no ranking.';
