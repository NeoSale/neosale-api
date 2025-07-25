# 🔧 Execução Manual de Migrações no Supabase

## 📋 Situação Atual

O sistema de migrações automáticas detectou que algumas operações precisam ser executadas manualmente no Supabase:

- ❌ Tabela `migrations` não existe
- ❌ Dados não inseridos nas tabelas `provedores` e `tipos_acesso`
- ❌ Migrações não estão registradas como executadas

## 🚀 Solução Rápida

### Passo 1: Acesse o Supabase SQL Editor

1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá para **SQL Editor** no menu lateral
3. Clique em **New Query**

### Passo 2: Execute o Script Consolidado

1. Abra o arquivo `manual_migrations.sql` criado na raiz do projeto
2. Copie todo o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** para executar

### Passo 3: Verificar Execução

O script inclui consultas de verificação no final que mostrarão:
- ✅ Tabelas criadas
- ✅ Dados inseridos
- ✅ Migrações registradas

## 📊 O que será executado:

### 1. Criação da Tabela de Controle
```sql
CREATE TABLE migrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL UNIQUE,
  executed_at timestamp DEFAULT now()
);
```

### 2. Inserção de Dados Padrão

**Provedores de Autenticação:**
- email (Autenticação por email e senha)
- whatsapp (Autenticação via WhatsApp)
- google (Autenticação via Google OAuth)
- apple (Autenticação via Apple ID)
- microsoft (Autenticação via Microsoft Account)

**Tipos de Acesso:**
- admin (Administrador do sistema)
- revendedor (Usuário revendedor)
- cliente (Usuário cliente)

### 3. Registro de Migrações
Todas as 15 migrações serão marcadas como executadas:
- `000_create_execute_sql_function.sql`
- `000_create_migrations_table.sql`
- `001_create_origens_leads.sql`
- ... (todas as migrações até `013_create_user_management_tables.sql`)

## 🔄 Após a Execução Manual

Depois de executar o script manual:

1. Execute `npm run migrate` novamente
2. O sistema deve mostrar: "✅ No pending migrations found. Database is up to date."
3. Todas as futuras migrações funcionarão automaticamente

## 🛠️ Solução Alternativa (Automação Futura)

Para habilitar execução automática completa, execute este script no Supabase:

```sql
-- Função para executar SQL dinâmico
CRETE OR REPLACE FUNCTION execute_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;

-- Conceder permissões
GRANT EXECUTE ON FUNCTION execute_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION execute_sql(text) TO anon;
```

## 📞 Suporte

Se encontrar problemas:
1. Verifique se todas as tabelas foram criadas
2. Confirme se os dados foram inseridos
3. Execute `npm run migrate` para verificar o status

---

**Nota:** Este processo manual é necessário apenas uma vez. Após a configuração inicial, todas as migrações futuras funcionarão automaticamente.