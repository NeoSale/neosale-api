-- Migration: 040_create_auth_functions
-- Description: Create authentication helper functions
-- Dependencies: 005_create_usuarios, 002_create_tipos_acesso, 035_create_perfis, 036_create_usuario_perfis

-- Função para executar SQL dinâmico (necessária para migrations)
CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;

-- Função para verificar permissão de usuário
CREATE OR REPLACE FUNCTION verificar_permissao_usuario(
  p_usuario_id uuid,
  p_recurso varchar,
  p_acao varchar
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_tem_permissao boolean := false;
BEGIN
  -- Verificar se é admin (tem todas as permissões)
  IF verificar_usuario_admin(p_usuario_id) THEN
    RETURN true;
  END IF;
  
  -- Verificar permissões nos perfis do usuário
  SELECT EXISTS (
    SELECT 1
    FROM usuario_perfis up
    INNER JOIN perfis p ON up.perfil_id = p.id
    WHERE up.usuario_id = p_usuario_id
      AND up.ativo = true
      AND p.ativo = true
      AND (
        (p.permissoes->p_recurso->>p_acao)::boolean = true
        OR (p.permissoes->>'admin')::boolean = true
      )
  ) INTO v_tem_permissao;
  
  RETURN v_tem_permissao;
END;
$$;

-- Função para limpar sessões expiradas
CREATE OR REPLACE FUNCTION limpar_sessoes_expiradas()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE sessoes
  SET ativo = false,
      updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'
  WHERE ativo = true
    AND expira_em < CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo';
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Função para limpar convites expirados
CREATE OR REPLACE FUNCTION limpar_convites_expirados()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE convites
  SET status = 'expirado',
      updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'
  WHERE status = 'pendente'
    AND expira_em < CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo';
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Função para obter perfis de um usuário
CREATE OR REPLACE FUNCTION obter_perfis_usuario(p_usuario_id uuid)
RETURNS TABLE (
  perfil_id uuid,
  perfil_nome varchar,
  permissoes jsonb,
  cliente_id uuid
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.nome,
    p.permissoes,
    up.cliente_id
  FROM usuario_perfis up
  INNER JOIN perfis p ON up.perfil_id = p.id
  WHERE up.usuario_id = p_usuario_id
    AND up.ativo = true
    AND p.ativo = true;
END;
$$;
