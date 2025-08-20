-- Migration: 000_create_execute_sql_function.sql
-- Cria função RPC para executar SQL bruto
-- Data: 2024

-- Criar função para executar SQL dinâmico (sem retorno)
CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;

-- Criar função para executar SQL dinâmico com retorno
CREATE OR REPLACE FUNCTION execute_sql_query(sql_query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  EXECUTE 'SELECT array_to_json(array_agg(row_to_json(t))) FROM (' || sql_query || ') t' INTO result;
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Conceder permissões para as funções
GRANT EXECUTE ON FUNCTION execute_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION execute_sql(text) TO anon;
GRANT EXECUTE ON FUNCTION execute_sql_query(text) TO authenticated;
GRANT EXECUTE ON FUNCTION execute_sql_query(text) TO anon;

-- Install pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;