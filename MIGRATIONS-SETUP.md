# 🚀 Configuração Automática de Migrações

## 🎯 Objetivo

Este guia resolve o problema de **migrações não executarem automaticamente** no Supabase, configurando todas as funções necessárias para automação completa.

## 📋 Problema Identificado

Atualmente as migrações não executam automaticamente porque:
- ❌ Tabela `migrations` não existe
- ❌ Função `execute_sql` não está disponível
- ❌ Funções auxiliares (`table_exists`, `column_exists`, `index_exists`) não existem
- ❌ Sistema não consegue rastrear migrações executadas

## 🔧 Solução Completa

### Passo 1: Diagnóstico Atual

```bash
npm run supabase:test
```

Este comando executa um diagnóstico completo e mostra:
- ✅ Status da conectividade
- ✅ Quais funções existem/faltam
- ✅ Tabelas disponíveis
- ✅ Próximos passos necessários

### Passo 2: Configuração Automática

1. **Acesse o Supabase SQL Editor**
   - Vá para [app.supabase.com](https://app.supabase.com)
   - Selecione seu projeto
   - Clique em **SQL Editor**

2. **Execute o Script de Configuração**
   - Abra o arquivo `setup_supabase_functions.sql`
   - Copie todo o conteúdo
   - Cole no SQL Editor
   - Clique em **Run**

3. **Execute o Script de Migrações Manuais**
   - Abra o arquivo `manual_migrations.sql`
   - Copie todo o conteúdo
   - Cole no SQL Editor
   - Clique em **Run**

### Passo 3: Verificação

```bash
# Testar funções novamente
npm run supabase:test

# Executar migrações automaticamente
npm run migrate
```

## 📁 Arquivos Criados

### 🔧 Scripts de Configuração
- **`setup_supabase_functions.sql`** - Cria todas as funções RPC necessárias
- **`manual_migrations.sql`** - Configura tabela migrations e dados iniciais
- **`test-supabase-functions.js`** - Diagnóstico completo do sistema

### 📚 Documentação
- **`MIGRATIONS-SETUP.md`** - Este guia de configuração
- **`MANUAL-MIGRATIONS.md`** - Guia para execução manual (fallback)

## ⚙️ Funções RPC Criadas

### 1. `execute_sql(sql_query text)`
- Executa SQL dinâmico
- Permite automação completa das migrações

### 2. `table_exists(table_name text)`
- Verifica se uma tabela existe
- Melhora detecção automática

### 3. `column_exists(table_name text, column_name text)`
- Verifica se uma coluna existe em uma tabela
- Evita erros de ALTER TABLE

### 4. `index_exists(index_name text)`
- Verifica se um índice existe
- Evita erros de CREATE INDEX

## 🎯 Resultado Esperado

Após a configuração:

```bash
$ npm run migrate
🔄 Starting database migrations...
✅ No pending migrations found. Database is up to date.
```

## 🔄 Fluxo de Trabalho Futuro

1. **Criar nova migração**: Adicione arquivo `.sql` na pasta `migrations/`
2. **Executar**: `npm run migrate`
3. **Automático**: Sistema detecta, executa e registra automaticamente

## 🛠️ Scripts NPM Disponíveis

```bash
# Diagnóstico completo
npm run supabase:test

# Lembrete de configuração
npm run supabase:setup

# Executar migrações
npm run migrate

# Migração com Docker
npm run migrate:docker
```

## 🚨 Solução de Problemas

### Erro: "relation migrations does not exist"
**Solução**: Execute `manual_migrations.sql` no Supabase

### Erro: "function execute_sql does not exist"
**Solução**: Execute `setup_supabase_functions.sql` no Supabase

### Migrações não executam automaticamente
**Solução**: 
1. Execute `npm run supabase:test`
2. Siga as instruções mostradas no diagnóstico

### Permissões negadas
**Solução**: Verifique se as variáveis `SUPABASE_URL` e `SUPABASE_ANON_KEY` estão corretas no `.env`

## 📞 Suporte

Se ainda houver problemas:
1. Execute `npm run supabase:test` e compartilhe o resultado
2. Verifique se todos os scripts foram executados no Supabase
3. Confirme que as variáveis de ambiente estão corretas

---

**🎉 Uma vez configurado, o sistema funcionará automaticamente para sempre!**