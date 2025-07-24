-- Migration: 000_create_execute_sql_function.sql
-- Cria função RPC para executar SQL bruto
-- Data: 2024

-- Criar função para executar SQL dinâmico
CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;

-- Conceder permissões para a função
GRANT EXECUTE ON FUNCTION execute_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION execute_sql(text) TO anon;