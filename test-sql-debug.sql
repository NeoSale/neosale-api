-- Teste direto da busca por texto
-- Execute este SQL no Supabase SQL Editor para debugar

-- 1. Verificar se o chunk existe
SELECT 
  id, 
  nome, 
  chunk_index,
  chunk_texto ILIKE '%Art. 77%' as contains_art77,
  LENGTH(chunk_texto) as texto_length
FROM documentos 
WHERE id = 'fa435ec8-4895-4097-8a50-9aa21f6784ce';

-- 2. Buscar chunks que contêm "Art. 77"
SELECT 
  id,
  nome,
  chunk_index,
  cliente_id,
  base_id
FROM documentos
WHERE chunk_texto ILIKE '%Art. 77%'
  AND deletado = false
  AND cliente_id = 'f029ad69-3465-454e-ba85-e0cdb75c445f'
LIMIT 5;

-- 3. Testar a parte text_results da função
WITH v_base_ids_text AS (
  SELECT ARRAY['1b87c1a9-ced5-4760-98ef-6a97e464cd24']::text[] as ids
)
SELECT
  d.id,
  d.nome,
  d.chunk_index,
  d.chunk_texto ILIKE '%Art. 77%' as matches_text
FROM documentos d, v_base_ids_text
WHERE 'Art. 77' IS NOT NULL
  AND d.chunk_texto ILIKE '%Art. 77%'
  AND d.deletado = false
  AND d.cliente_id = 'f029ad69-3465-454e-ba85-e0cdb75c445f'
  AND (
    array_length(v_base_ids_text.ids, 1) IS NULL OR
    EXISTS (
      SELECT 1
      FROM jsonb_array_elements_text(d.base_id) j(val)
      WHERE j.val = ANY(v_base_ids_text.ids)
    )
  )
LIMIT 5;
