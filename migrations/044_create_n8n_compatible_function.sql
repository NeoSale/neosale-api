-- Migration: 044_create_n8n_compatible_function
-- Description: Cria função compatível com n8n Supabase Vector Store
-- Dependencies: 030_create_documentos, 043_update_match_function_hybrid

-- Função compatível com n8n Vector Store
-- Esta função segue a assinatura esperada pelo n8n
CREATE OR REPLACE FUNCTION match_documentos(
  query_embedding vector(1536),
  match_count int DEFAULT 10,
  filter jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_cliente_id uuid;
  v_base_ids jsonb;
  v_base_ids_array text[];
BEGIN
  -- Extrair filtros
  v_cliente_id := (filter->>'cliente_id')::uuid;
  v_base_ids := filter->'base_id';
  
  -- Converter base_ids para array de text
  IF v_base_ids IS NOT NULL THEN
    SELECT array_agg(value::text)
    INTO v_base_ids_array
    FROM jsonb_array_elements_text(v_base_ids);
  END IF;

  -- Busca com filtros
  RETURN QUERY
  SELECT 
    d.id,
    d.chunk_texto AS content,
    jsonb_build_object(
      'nome', d.nome,
      'descricao', d.descricao,
      'nome_arquivo', d.nome_arquivo,
      'chunk_index', d.chunk_index,
      'total_chunks', d.total_chunks,
      'documento_pai_id', d.documento_pai_id,
      'base_id', d.base_id,
      'created_at', d.created_at
    ) AS metadata,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM documentos d
  WHERE d.embedding IS NOT NULL
    AND d.deletado = false
    AND (v_cliente_id IS NULL OR d.cliente_id = v_cliente_id)
    AND (
      v_base_ids_array IS NULL 
      OR EXISTS (
        SELECT 1
        FROM jsonb_array_elements_text(d.base_id) j(val)
        WHERE j.val = ANY(v_base_ids_array)
      )
    )
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Permissões
GRANT EXECUTE ON FUNCTION match_documentos(vector(1536), int, jsonb)
TO anon, authenticated, service_role;

COMMENT ON FUNCTION match_documentos IS 
'Função compatível com n8n Supabase Vector Store.
Busca documentos por similaridade vetorial com filtros opcionais.
Parâmetros:
- query_embedding: vetor de embedding da query (1536 dimensões)
- match_count: número de resultados (padrão: 10)
- filter: filtros JSONB {cliente_id: uuid, base_id: [uuid]}
Retorna: id, content (chunk_texto), metadata (dados do documento), similarity';


-- Função auxiliar para busca híbrida (texto + semântica) compatível com n8n
CREATE OR REPLACE FUNCTION match_documentos_text_hybrid(
  query_text text,
  query_embedding vector(1536),
  match_count int DEFAULT 10,
  filter jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float,
  text_match boolean,
  combined_score float
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_cliente_id uuid;
  v_base_ids jsonb;
  v_base_ids_array text[];
  v_search_terms text[];
BEGIN
  -- Extrair filtros
  v_cliente_id := (filter->>'cliente_id')::uuid;
  v_base_ids := filter->'base_id';
  
  -- Converter base_ids para array
  IF v_base_ids IS NOT NULL THEN
    SELECT array_agg(value::text)
    INTO v_base_ids_array
    FROM jsonb_array_elements_text(v_base_ids);
  END IF;

  -- Extrair termos de busca
  v_search_terms := extract_search_terms(query_text);

  -- Busca híbrida
  RETURN QUERY
  WITH text_matches AS (
    -- Busca por texto
    SELECT DISTINCT ON (d.id)
      d.id,
      d.chunk_texto AS content,
      jsonb_build_object(
        'nome', d.nome,
        'descricao', d.descricao,
        'nome_arquivo', d.nome_arquivo,
        'chunk_index', d.chunk_index,
        'total_chunks', d.total_chunks,
        'documento_pai_id', d.documento_pai_id,
        'base_id', d.base_id,
        'created_at', d.created_at,
        'matched_term', t.term
      ) AS metadata,
      1 - (d.embedding <=> query_embedding) AS similarity,
      true AS text_match,
      1.0 + ((1 - (d.embedding <=> query_embedding)) * 0.5) AS combined_score
    FROM documentos d
    CROSS JOIN LATERAL unnest(v_search_terms) AS t(term)
    WHERE d.embedding IS NOT NULL
      AND d.deletado = false
      AND (v_cliente_id IS NULL OR d.cliente_id = v_cliente_id)
      AND d.chunk_texto ILIKE '%' || t.term || '%'
      AND (
        v_base_ids_array IS NULL 
        OR EXISTS (
          SELECT 1
          FROM jsonb_array_elements_text(d.base_id) j(val)
          WHERE j.val = ANY(v_base_ids_array)
        )
      )
  ),
  semantic_matches AS (
    -- Busca semântica (excluindo matches de texto)
    SELECT 
      d.id,
      d.chunk_texto AS content,
      jsonb_build_object(
        'nome', d.nome,
        'descricao', d.descricao,
        'nome_arquivo', d.nome_arquivo,
        'chunk_index', d.chunk_index,
        'total_chunks', d.total_chunks,
        'documento_pai_id', d.documento_pai_id,
        'base_id', d.base_id,
        'created_at', d.created_at
      ) AS metadata,
      1 - (d.embedding <=> query_embedding) AS similarity,
      false AS text_match,
      (1 - (d.embedding <=> query_embedding)) * 0.5 AS combined_score
    FROM documentos d
    WHERE d.embedding IS NOT NULL
      AND d.deletado = false
      AND (v_cliente_id IS NULL OR d.cliente_id = v_cliente_id)
      AND NOT EXISTS (SELECT 1 FROM text_matches tm WHERE tm.id = d.id)
      AND (
        v_base_ids_array IS NULL 
        OR EXISTS (
          SELECT 1
          FROM jsonb_array_elements_text(d.base_id) j(val)
          WHERE j.val = ANY(v_base_ids_array)
        )
      )
    ORDER BY d.embedding <=> query_embedding
    LIMIT match_count * 2
  )
  SELECT 
    m.id,
    m.content,
    m.metadata,
    m.similarity,
    m.text_match,
    m.combined_score
  FROM (
    SELECT * FROM text_matches
    UNION ALL
    SELECT * FROM semantic_matches
  ) m
  ORDER BY m.combined_score DESC
  LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION match_documentos_text_hybrid(text, vector(1536), int, jsonb)
TO anon, authenticated, service_role;

COMMENT ON FUNCTION match_documentos_text_hybrid IS 
'Função híbrida (texto + semântica) compatível com n8n.
Combina busca por texto exato com busca semântica.
Documentos com match de texto recebem score boost (1.0-1.5 vs 0-0.5).
Parâmetros:
- query_text: texto da query para extração de termos
- query_embedding: vetor de embedding da query
- match_count: número de resultados
- filter: filtros JSONB {cliente_id: uuid, base_id: [uuid]}';
