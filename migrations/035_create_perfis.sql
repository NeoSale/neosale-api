-- Migration: 035_create_perfis
-- Description: Create perfis (user profiles) table with permissions
-- Dependencies: none

CREATE TABLE IF NOT EXISTS perfis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar(100) NOT NULL UNIQUE,
  descricao text,
  permissoes jsonb NOT NULL DEFAULT '{}',
  ativo boolean NOT NULL DEFAULT true,
  sistema boolean NOT NULL DEFAULT false,
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
);

CREATE INDEX IF NOT EXISTS idx_perfis_nome ON perfis(nome);
CREATE INDEX IF NOT EXISTS idx_perfis_ativo ON perfis(ativo);
CREATE INDEX IF NOT EXISTS idx_perfis_sistema ON perfis(sistema);
CREATE INDEX IF NOT EXISTS idx_perfis_embedding ON perfis USING ivfflat (embedding vector_cosine_ops);

COMMENT ON TABLE perfis IS 'Perfis de usuário com permissões granulares';
COMMENT ON COLUMN perfis.permissoes IS 'JSON com estrutura de permissões: {"recurso": {"acao": boolean}}';
COMMENT ON COLUMN perfis.sistema IS 'Perfis do sistema não podem ser deletados, apenas desativados';

INSERT INTO perfis (nome, descricao, permissoes, sistema) VALUES 
  ('Administrador', 'Acesso total ao sistema', '{"admin": true, "usuarios": {"criar": true, "editar": true, "deletar": true, "visualizar": true, "convidar": true}, "clientes": {"criar": true, "editar": true, "deletar": true, "visualizar": true}, "leads": {"criar": true, "editar": true, "deletar": true, "visualizar": true, "atribuir": true}, "relatorios": {"visualizar": true, "exportar": true}, "configuracoes": {"editar": true}, "perfis": {"criar": true, "editar": true, "deletar": true, "visualizar": true}}', true),
  ('Gerente', 'Gerenciamento de equipe e clientes', '{"usuarios": {"criar": true, "editar": true, "deletar": false, "visualizar": true, "convidar": true}, "clientes": {"criar": true, "editar": true, "deletar": false, "visualizar": true}, "leads": {"criar": true, "editar": true, "deletar": true, "visualizar": true, "atribuir": true}, "relatorios": {"visualizar": true, "exportar": true}}', true),
  ('Vendedor', 'Acesso a vendas e leads', '{"clientes": {"criar": false, "editar": false, "deletar": false, "visualizar": true}, "leads": {"criar": true, "editar": true, "deletar": false, "visualizar": true}, "relatorios": {"visualizar": true, "exportar": false}}', true),
  ('Suporte', 'Acesso a atendimento ao cliente', '{"clientes": {"criar": false, "editar": true, "deletar": false, "visualizar": true}, "leads": {"criar": false, "editar": true, "deletar": false, "visualizar": true}}', true),
  ('Visualizador', 'Apenas visualização', '{"clientes": {"criar": false, "editar": false, "deletar": false, "visualizar": true}, "leads": {"criar": false, "editar": false, "deletar": false, "visualizar": true}, "relatorios": {"visualizar": true, "exportar": false}}', true)
ON CONFLICT (nome) DO NOTHING;
