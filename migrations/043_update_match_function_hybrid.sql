-- Migration: 043_update_match_function_hybrid
-- Description: Atualiza função de busca para incluir busca por texto (híbrida)
-- Dependencies: 030_create_documentos, 031_add_documento_chunks

-- Função híbrida: busca por texto + semântica
CREATE OR REPLACE FUNCTION public.match_documentos_hybrid(
  filter jsonb,
  match_count integer,
  query_embedding vector,
  search_terms text[] DEFAULT '{}'  -- Termos para busca por texto
)
RETURNS TABLE (
  metadata jsonb, 
  similarity float,
  text_match boolean,
  matched_term text,
  combined_score float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cliente_id uuid;
  v_base_ids_text text[];
  v_term text;
BEGIN
  v_cliente_id := (filter->>'cliente_id')::uuid;

  -- Extrai base_ids do filtro
  SELECT COALESCE(array_agg(x), '{}') INTO v_base_ids_text
  FROM (
    SELECT jsonb_array_elements_text(COALESCE(filter->'base_id','[]'::jsonb)) AS x
  ) s;

  -- Se há termos de busca, fazer busca híbrida
  IF array_length(search_terms, 1) > 0 THEN
    RETURN QUERY
    WITH text_matches AS (
      -- Busca por texto exato
      SELECT DISTINCT ON (d.id)
        d.id,
        to_jsonb(d.*) - 'embedding' - 'base64' AS metadata,
        1 - (d.embedding <=> query_embedding) AS similarity,
        true AS text_match,
        t.term AS matched_term,
        1.0 + ((1 - (d.embedding <=> query_embedding)) * 0.5) AS combined_score
      FROM public.documentos d
      CROSS JOIN LATERAL unnest(search_terms) AS t(term)
      WHERE d.embedding IS NOT NULL
        AND d.deletado = false
        AND d.cliente_id = v_cliente_id
        AND d.chunk_texto ILIKE '%' || t.term || '%'
        AND (
          array_length(v_base_ids_text, 1) = 0 
          OR EXISTS (
            SELECT 1
            FROM jsonb_array_elements_text(d.base_id) j(val)
            WHERE j.val = ANY(v_base_ids_text)
          )
        )
    ),
    semantic_matches AS (
      -- Busca semântica (excluindo os que já foram encontrados por texto)
      SELECT 
        d.id,
        to_jsonb(d.*) - 'embedding' - 'base64' AS metadata,
        1 - (d.embedding <=> query_embedding) AS similarity,
        false AS text_match,
        NULL::text AS matched_term,
        (1 - (d.embedding <=> query_embedding)) * 0.5 AS combined_score
      FROM public.documentos d
      WHERE d.embedding IS NOT NULL
        AND d.deletado = false
        AND d.cliente_id = v_cliente_id
        AND NOT EXISTS (SELECT 1 FROM text_matches tm WHERE tm.id = d.id)
        AND (
          array_length(v_base_ids_text, 1) = 0 
          OR EXISTS (
            SELECT 1
            FROM jsonb_array_elements_text(d.base_id) j(val)
            WHERE j.val = ANY(v_base_ids_text)
          )
        )
      ORDER BY d.embedding <=> query_embedding
      LIMIT match_count * 2
    )
    SELECT 
      m.metadata,
      m.similarity,
      m.text_match,
      m.matched_term,
      m.combined_score
    FROM (
      SELECT * FROM text_matches
      UNION ALL
      SELECT * FROM semantic_matches
    ) m
    ORDER BY m.combined_score DESC
    LIMIT GREATEST(match_count, 1);
  ELSE
    -- Se não há termos, fazer apenas busca semântica
    RETURN QUERY
    SELECT
      to_jsonb(d.*) - 'embedding' - 'base64' AS metadata,
      1 - (d.embedding <=> query_embedding) AS similarity,
      false AS text_match,
      NULL::text AS matched_term,
      (1 - (d.embedding <=> query_embedding)) * 0.5 AS combined_score
    FROM public.documentos d
    WHERE d.embedding IS NOT NULL
      AND d.deletado = false
      AND d.cliente_id = v_cliente_id
      AND (
        array_length(v_base_ids_text, 1) = 0 
        OR EXISTS (
          SELECT 1
          FROM jsonb_array_elements_text(d.base_id) j(val)
          WHERE j.val = ANY(v_base_ids_text)
        )
      )
    ORDER BY d.embedding <=> query_embedding
    LIMIT GREATEST(match_count, 1);
  END IF;
END;
$$;

-- Permissões
GRANT EXECUTE ON FUNCTION public.match_documentos_hybrid(jsonb, integer, vector, text[])
TO anon, authenticated, service_role;

-- Comentário
COMMENT ON FUNCTION public.match_documentos_hybrid IS 
'Busca híbrida de documentos: combina busca por texto exato com busca semântica. 
Documentos com match de texto recebem score boost (1.0-1.5 vs 0-0.5).
Parâmetros:
- filter: {cliente_id: uuid, base_id: [uuid]}
- match_count: número de resultados
- query_embedding: vetor de embedding da query
- search_terms: array de termos para busca por texto (ex: ["art. 77", "art 77"])';


-- Função auxiliar para extrair termos específicos (Art. X, Lei X)
CREATE OR REPLACE FUNCTION public.extract_search_terms(query_text text)
RETURNS text[]
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  terms text[] := '{}';
  art_matches text[];
  lei_matches text[];
  term text;
  num text;
BEGIN
  -- Extrair "Art. X", "Artigo X", "art X"
  SELECT array_agg(match[1])
  INTO art_matches
  FROM regexp_matches(query_text, '(art\.?\s*\d+|artigo\s*\d+)', 'gi') AS match;
  
  IF art_matches IS NOT NULL THEN
    terms := terms || art_matches;
    
    -- Adicionar variações
    FOREACH term IN ARRAY art_matches
    LOOP
      num := (regexp_match(term, '\d+'))[1];
      IF num IS NOT NULL THEN
        terms := terms || ARRAY[
          'art. ' || num,
          'art ' || num,
          'Art. ' || num,
          'artigo ' || num
        ];
      END IF;
    END LOOP;
  END IF;

  -- Extrair "Lei X", "Lei Complementar X"
  SELECT array_agg(match[1])
  INTO lei_matches
  FROM regexp_matches(query_text, '(lei\s+(?:complementar\s+)?\d+)', 'gi') AS match;
  
  IF lei_matches IS NOT NULL THEN
    terms := terms || lei_matches;
  END IF;

  -- Remover duplicatas
  SELECT array_agg(DISTINCT t)
  INTO terms
  FROM unnest(terms) AS t;

  RETURN COALESCE(terms, '{}');
END;
$$;

GRANT EXECUTE ON FUNCTION public.extract_search_terms(text)
TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.extract_search_terms IS 
'Extrai termos específicos de uma query (Art. X, Artigo X, Lei X, etc) e retorna array com variações.
Exemplo: "o que diz o art. 77?" -> ["art. 77", "art 77", "Art. 77", "artigo 77"]';
