-- =====================================================
-- CONFIGURAÇÃO COMPLETA DO SUPABASE PARA MIGRAÇÕES AUTOMÁTICAS
-- Execute este script no SQL Editor do Supabase para habilitar
-- a execução automática de migrações
-- =====================================================

-- 1. Criar função RPC para executar SQL dinâmico
CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;

-- 2. Conceder permissões para a função
GRANT EXECUTE ON FUNCTION execute_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION execute_sql(text) TO anon;

-- 3. Criar tabela de controle de migrações
CREATE TABLE IF NOT EXISTS migrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL UNIQUE,
  executed_at timestamp DEFAULT now()
);

-- 4. Criar índice na tabela migrations
CREATE INDEX IF NOT EXISTS idx_migrations_filename ON migrations(filename);

-- 5. Criar função para verificar se uma tabela existe
CREATE OR REPLACE FUNCTION table_exists(table_name text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = $1
  );
END;
$$;

-- 6. Criar função para verificar se uma coluna existe
CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = $1 
    AND column_name = $2
  );
END;
$$;

-- 7. Criar função para verificar se um índice existe
CREATE OR REPLACE FUNCTION index_exists(index_name text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname = $1
  );
END;
$$;

-- 8. Conceder permissões para as funções auxiliares
GRANT EXECUTE ON FUNCTION table_exists(text) TO authenticated;
GRANT EXECUTE ON FUNCTION table_exists(text) TO anon;
GRANT EXECUTE ON FUNCTION column_exists(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION column_exists(text, text) TO anon;
GRANT EXECUTE ON FUNCTION index_exists(text) TO authenticated;
GRANT EXECUTE ON FUNCTION index_exists(text) TO anon;

-- =====================================================
-- VERIFICAÇÃO: Execute para confirmar que tudo foi criado
-- =====================================================

-- Verificar se as funções foram criadas
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('execute_sql', 'table_exists', 'column_exists', 'index_exists')
ORDER BY routine_name;

-- Verificar se a tabela migrations foi criada
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'migrations';

-- Testar a função execute_sql
SELECT execute_sql('SELECT 1') as test_function;

-- =====================================================
-- MENSAGEM DE SUCESSO
-- =====================================================

-- Se chegou até aqui sem erros, a configuração está completa!
-- Agora você pode executar 'npm run migrate' e as migrações
-- serão executadas automaticamente no Supabase.

SELECT 'Configuração do Supabase concluída com sucesso! 🎉' as status;