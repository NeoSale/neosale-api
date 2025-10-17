-- Migration: 036_create_usuario_perfis
-- Description: Create usuario_perfis relationship table
-- Dependencies: 005_create_usuarios, 035_create_perfis, 004_create_clientes

CREATE TABLE IF NOT EXISTS usuario_perfis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  perfil_id uuid NOT NULL REFERENCES perfis(id) ON DELETE RESTRICT,
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  ativo boolean NOT NULL DEFAULT true,
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  UNIQUE(usuario_id, perfil_id, cliente_id)
);

CREATE INDEX IF NOT EXISTS idx_usuario_perfis_usuario ON usuario_perfis(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuario_perfis_perfil ON usuario_perfis(perfil_id);
CREATE INDEX IF NOT EXISTS idx_usuario_perfis_cliente ON usuario_perfis(cliente_id);
CREATE INDEX IF NOT EXISTS idx_usuario_perfis_ativo ON usuario_perfis(ativo);
CREATE INDEX IF NOT EXISTS idx_usuario_perfis_embedding ON usuario_perfis USING ivfflat (embedding vector_cosine_ops);

COMMENT ON TABLE usuario_perfis IS 'Relacionamento entre usuários e perfis, permitindo múltiplos perfis por cliente';
