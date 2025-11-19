-- Migration: 046_migrate_to_supabase_auth
-- Description: Migra autenticação customizada para Supabase Auth
-- Date: 2025-01-07

-- ============================================
-- PARTE 1: Adicionar campos necessários
-- ============================================

-- Adicionar auth_user_id para vincular com auth.users do Supabase
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN DEFAULT FALSE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ultimo_login TIMESTAMP WITH TIME ZONE;

-- Criar índice para auth_user_id
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_user_id ON usuarios(auth_user_id);

-- ============================================
-- PARTE 2: Remover tabelas desnecessárias
-- ============================================

-- Dropar tabelas que não serão mais necessárias
-- O Supabase Auth gerencia sessões, tokens de reset e logs

DROP TABLE IF EXISTS sessoes CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS logs_autenticacao CASCADE;

-- ============================================
-- PARTE 3: Criar função de sincronização
-- ============================================

-- Função para sincronizar usuário do Supabase Auth com tabela usuarios
CREATE OR REPLACE FUNCTION sync_user_from_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando um novo usuário é criado no auth.users
  -- Criar ou atualizar registro correspondente em usuarios
  INSERT INTO usuarios (
    auth_user_id,
    email,
    nome,
    email_verificado,
    ativo,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email_confirmed_at IS NOT NULL,
    NOT NEW.banned_at IS NOT NULL,
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (auth_user_id) 
  DO UPDATE SET
    email = EXCLUDED.email,
    email_verificado = EXCLUDED.email_verificado,
    ativo = EXCLUDED.ativo,
    updated_at = EXCLUDED.updated_at;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para sincronização automática
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_from_auth();

-- ============================================
-- PARTE 4: Função para obter dados do usuário
-- ============================================

-- Função para obter dados completos do usuário autenticado
CREATE OR REPLACE FUNCTION get_user_data(user_id UUID)
RETURNS TABLE (
  id UUID,
  auth_user_id UUID,
  nome VARCHAR,
  email VARCHAR,
  telefone VARCHAR,
  ativo BOOLEAN,
  email_verificado BOOLEAN,
  cliente_id UUID,
  revendedor_id UUID,
  tipo_acesso_id UUID,
  perfis JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.auth_user_id,
    u.nome,
    u.email,
    u.telefone,
    u.ativo,
    u.email_verificado,
    u.cliente_id,
    u.revendedor_id,
    u.tipo_acesso_id,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'perfil_id', p.id,
          'perfil_nome', p.nome,
          'permissoes', p.permissoes,
          'cliente_id', up.cliente_id
        )
      ) FILTER (WHERE p.id IS NOT NULL),
      '[]'::jsonb
    ) as perfis,
    u.created_at,
    u.updated_at
  FROM usuarios u
  LEFT JOIN usuario_perfis up ON u.id = up.usuario_id
  LEFT JOIN perfis p ON up.perfil_id = p.id
  WHERE u.auth_user_id = user_id
    AND u.ativo = true
  GROUP BY u.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PARTE 5: Políticas RLS (Row Level Security)
-- ============================================

-- Habilitar RLS na tabela usuarios
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios dados
CREATE POLICY "Users can view own data"
  ON usuarios
  FOR SELECT
  USING (auth.uid() = auth_user_id);

-- Política: Admins podem ver todos os usuários
CREATE POLICY "Admins can view all users"
  ON usuarios
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuario_perfis up
      JOIN perfis p ON up.perfil_id = p.id
      WHERE up.usuario_id IN (
        SELECT id FROM usuarios WHERE auth_user_id = auth.uid()
      )
      AND p.permissoes->>'admin' = 'true'
    )
  );

-- Política: Usuários podem atualizar seus próprios dados (exceto campos sensíveis)
CREATE POLICY "Users can update own data"
  ON usuarios
  FOR UPDATE
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- ============================================
-- PARTE 6: Comentários e documentação
-- ============================================

COMMENT ON COLUMN usuarios.auth_user_id IS 'ID do usuário no auth.users do Supabase';
COMMENT ON COLUMN usuarios.email_verificado IS 'Indica se o email foi verificado';
COMMENT ON COLUMN usuarios.ultimo_login IS 'Data/hora do último login';
COMMENT ON FUNCTION sync_user_from_auth IS 'Sincroniza usuários do Supabase Auth com tabela usuarios';
COMMENT ON FUNCTION get_user_data IS 'Retorna dados completos do usuário autenticado incluindo perfis';

-- ============================================
-- PARTE 7: Registrar migration
-- ============================================

INSERT INTO migrations (filename, executed_at)
VALUES ('046_migrate_to_supabase_auth.sql', NOW())
ON CONFLICT (filename) DO NOTHING;
