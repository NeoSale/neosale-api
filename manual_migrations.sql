-- =====================================================
-- SCRIPT DE MIGRAÇÕES MANUAIS PARA SUPABASE
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. Criar tabela de controle de migrações
CREATE TABLE IF NOT EXISTS migrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL UNIQUE,
  executed_at timestamp DEFAULT now()
);

-- Criar índice na tabela migrations
CREATE INDEX IF NOT EXISTS idx_migrations_filename ON migrations(filename);

-- 2. Inserir dados na tabela provedores (se não existir)
INSERT INTO provedores (nome, descricao) VALUES
  ('email', 'Autenticação por email e senha'),
  ('whatsapp', 'Autenticação via WhatsApp'),
  ('google', 'Autenticação via Google OAuth'),
  ('apple', 'Autenticação via Apple ID'),
  ('microsoft', 'Autenticação via Microsoft Account')
ON CONFLICT (nome) DO NOTHING;

-- 3. Inserir dados na tabela tipos_acesso (se não existir)
INSERT INTO tipos_acesso (nome, descricao) VALUES
  ('admin', 'Administrador do sistema'),
  ('revendedor', 'Usuário revendedor'),
  ('cliente', 'Usuário cliente')
ON CONFLICT (nome) DO NOTHING;

-- 4. Marcar migrações como executadas
INSERT INTO migrations (filename) VALUES
  ('000_create_execute_sql_function.sql'),
  ('000_create_migrations_table.sql'),
  ('001_create_origens_leads.sql'),
  ('002_create_mensagens.sql'),
  ('003_create_etapas_funil.sql'),
  ('004_create_status_negociacao.sql'),
  ('005_create_qualificacao.sql'),
  ('006_create_followup.sql'),
  ('007_create_leads.sql'),
  ('008_insert_sample_data.sql'),
  ('009_create_controle_envios_diarios.sql'),
  ('010_create_configuracoes.sql'),
  ('011_add_ativo_to_mensagens.sql'),
  ('012_create_configuracoes_followup.sql'),
  ('013_create_user_management_tables.sql')
ON CONFLICT (filename) DO NOTHING;

-- =====================================================
-- VERIFICAÇÃO: Execute para confirmar que tudo foi criado
-- =====================================================

-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'migrations', 'provedores', 'tipos_acesso', 
  'revendedores', 'clientes', 'usuarios',
  'configuracoes_followup'
)
ORDER BY table_name;

-- Verificar dados inseridos
SELECT 'provedores' as tabela, COUNT(*) as registros FROM provedores
UNION ALL
SELECT 'tipos_acesso' as tabela, COUNT(*) as registros FROM tipos_acesso
UNION ALL
SELECT 'migrations' as tabela, COUNT(*) as registros FROM migrations;

-- Verificar migrações registradas
SELECT filename, executed_at 
FROM migrations 
ORDER BY filename;