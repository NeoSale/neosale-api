-- Migration: 037_create_convites
-- Description: Create convites (invitations) table
-- Dependencies: 005_create_usuarios, 035_create_perfis, 004_create_clientes, 003_create_revendedores

CREATE TABLE IF NOT EXISTS convites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) NOT NULL,
  telefone varchar(20),
  nome varchar(255),
  token varchar(255) NOT NULL UNIQUE,
  perfil_id uuid REFERENCES perfis(id) ON DELETE RESTRICT,
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  revendedor_id uuid REFERENCES revendedores(id) ON DELETE CASCADE,
  convidado_por uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  status varchar(50) NOT NULL DEFAULT 'pendente',
  expira_em TIMESTAMP WITH TIME ZONE NOT NULL,
  aceito_em TIMESTAMP WITH TIME ZONE,
  usuario_criado_id uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  mensagem_personalizada text,
  enviado_email boolean DEFAULT false,
  enviado_whatsapp boolean DEFAULT false,
  metadata jsonb,
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
);

CREATE INDEX IF NOT EXISTS idx_convites_email ON convites(email);
CREATE INDEX IF NOT EXISTS idx_convites_token ON convites(token);
CREATE INDEX IF NOT EXISTS idx_convites_status ON convites(status);
CREATE INDEX IF NOT EXISTS idx_convites_convidado_por ON convites(convidado_por);
CREATE INDEX IF NOT EXISTS idx_convites_cliente ON convites(cliente_id);
CREATE INDEX IF NOT EXISTS idx_convites_revendedor ON convites(revendedor_id);
CREATE INDEX IF NOT EXISTS idx_convites_expira_em ON convites(expira_em);
CREATE INDEX IF NOT EXISTS idx_convites_embedding ON convites USING ivfflat (embedding vector_cosine_ops);

COMMENT ON TABLE convites IS 'Convites para novos usuários acessarem o sistema';
COMMENT ON COLUMN convites.status IS 'Status do convite: pendente, aceito, expirado, cancelado';
