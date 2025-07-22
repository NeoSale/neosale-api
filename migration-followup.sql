-- Migração para renomear mensagem_status para followup
-- Execute este script no seu banco de dados Supabase

-- 1. Criar a nova tabela followup (se não existir)
CREATE TABLE IF NOT EXISTS followup (
  id uuid primary key default gen_random_uuid(),
  id_mensagem uuid references mensagens(id) not null,
  id_lead uuid references leads(id) not null,
  status varchar(20) check (status in ('sucesso', 'erro')) not null,
  erro text,
  mensagem_enviada text not null,
  embedding vector(1536), -- campo para embedding da LLM
  created_at timestamp default now(), 
  updated_at timestamp default now()
);

-- 2. Migrar dados da tabela mensagem_status para followup (se mensagem_status existir)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'mensagem_status') THEN
    INSERT INTO followup (id_mensagem, id_lead, status, erro, mensagem_enviada, created_at, updated_at)
    SELECT id_mensagem, id_lead, status, erro, mensagem_enviada, created_at, updated_at
    FROM mensagem_status;
  END IF;
END $$;

-- 3. Adicionar coluna followup_id na tabela leads (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'followup_id') THEN
    ALTER TABLE leads ADD COLUMN followup_id uuid references followup(id);
  END IF;
END $$;

-- 4. Atualizar leads com followup_id baseado nos dados migrados
UPDATE leads 
SET followup_id = (
  SELECT f.id 
  FROM followup f 
  WHERE f.id_lead = leads.id 
  ORDER BY f.created_at DESC 
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1 
  FROM followup f 
  WHERE f.id_lead = leads.id
);

-- 5. Remover coluna mensagem_status_id da tabela leads (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'mensagem_status_id') THEN
    ALTER TABLE leads DROP COLUMN mensagem_status_id;
  END IF;
END $$;

-- 6. Remover tabela mensagem_status (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'mensagem_status') THEN
    DROP TABLE mensagem_status;
  END IF;
END $$;

-- Verificar se a migração foi bem-sucedida
SELECT 
  'followup' as tabela,
  count(*) as total_registros
FROM followup
UNION ALL
SELECT 
  'leads_com_followup_id' as tabela,
  count(*) as total_registros
FROM leads 
WHERE followup_id IS NOT NULL;