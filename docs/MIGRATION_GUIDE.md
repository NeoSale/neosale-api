# Guia de Migrações - Múltiplas Bases de Dados

Este guia explica como executar migrações nas duas bases de dados Supabase do projeto: **NeoSale** e **OMIE**.

## Configuração

O arquivo `migration-config.js` contém as configurações para ambas as bases de dados:

- **NeoSale**: `https://wwkaxmhqwugqklxrywsg.supabase.co`
- **OMIE**: `https://kughgxqqljryeconlrfm.supabase.co`

## Scripts Disponíveis

### 1. Executar todas as migrações em todas as bases
```bash
npm run migrate:all
```
Este comando executa todas as migrações do diretório `migrations/` em ambas as bases de dados (NeoSale e OMIE).

### 2. Executar migrações apenas na base NeoSale
```bash
npm run migrate:neosale
```

### 3. Executar migrações apenas na base OMIE
```bash
npm run migrate:omie
```

### 4. Executar migração específica
```bash
# Sintaxe: node migration-config.js <database> <migration-file>
node migration-config.js neosale 004_create_clientes.sql
node migration-config.js omie 001_create_provedores.sql
```

## Estrutura de Arquivos

```
neosale-api/
├── migrations/                 # Diretório com arquivos .sql
│   ├── 000_create_execute_sql_function.sql
│   ├── 001_create_provedores.sql
│   ├── 002_create_tipos_acesso.sql
│   ├── 004_create_clientes.sql
│   └── ...
├── migration-config.js         # Configuração das migrações
└── MIGRATION_GUIDE.md         # Este arquivo
```

## Como Funciona

1. **Leitura dos arquivos**: O sistema lê todos os arquivos `.sql` do diretório `migrations/`
2. **Ordenação**: Os arquivos são executados em ordem alfabética
3. **Execução**: Cada arquivo SQL é dividido em statements individuais e executado sequencialmente
4. **Logs**: O progresso é exibido no console com indicadores visuais

## Exemplo de Saída

```
🚀 Iniciando migrações para NeoSale
📊 Total de migrações: 20

[NeoSale] Executando migração: 000_create_execute_sql_function.sql
[NeoSale] ✅ Migração 000_create_execute_sql_function.sql executada com sucesso

[NeoSale] Executando migração: 001_create_provedores.sql
[NeoSale] ✅ Migração 001_create_provedores.sql executada com sucesso

...

✅ Todas as migrações foram executadas com sucesso em NeoSale

🚀 Iniciando migrações para OMIE
📊 Total de migrações: 20

...

🎉 Todas as migrações foram executadas com sucesso em todas as bases!
```

## Tratamento de Erros

- Se uma migração falhar, o processo é interrompido
- O erro é exibido no console com detalhes
- O código de saída é 1 para indicar falha

## Pré-requisitos

1. **Função execute_sql**: Ambas as bases devem ter a função `execute_sql` criada
2. **Permissões**: As chaves de API devem ter permissões para executar SQL
3. **Conectividade**: Acesso à internet para conectar com Supabase

## Criando a Função execute_sql

Se a função `execute_sql` não existir nas bases, execute este SQL no Supabase SQL Editor:

```sql
CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;
```

## Dicas de Uso

1. **Teste primeiro**: Execute migrações em uma base de teste antes da produção
2. **Backup**: Sempre faça backup antes de executar migrações em produção
3. **Ordem**: Mantenha a numeração sequencial dos arquivos de migração
4. **Idempotência**: Escreva migrações que podem ser executadas múltiplas vezes

## Solução de Problemas

### Erro: "Base de dados não encontrada"
- Verifique se está usando `neosale` ou `omie` como parâmetro

### Erro: "Diretório migrations não encontrado"
- Execute o comando a partir do diretório raiz do projeto

### Erro de conexão com Supabase
- Verifique as URLs e chaves de API no arquivo `migration-config.js`
- Confirme que as bases estão ativas

### Erro: "execute_sql function does not exist"
- Crie a função `execute_sql` conforme instruções acima

## Monitoramento

Para verificar se as migrações foram aplicadas corretamente:

1. Acesse o Supabase Dashboard
2. Vá para a seção "Table Editor"
3. Verifique se as tabelas foram criadas
4. Consulte a tabela `migrations` (se existir) para ver o histórico

## Segurança

- As chaves de API estão configuradas como `anon` (somente leitura por padrão)
- A função `execute_sql` deve ter `SECURITY DEFINER` para permitir execução
- Nunca commite chaves de produção no código
- Use variáveis de ambiente para credenciais sensíveis