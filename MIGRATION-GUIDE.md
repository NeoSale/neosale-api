# 🔄 Guia de Migração: mensagem_status → followup

## ⚠️ Problema Atual

O servidor está apresentando o seguinte erro:
```
Could not find a relationship between 'leads' and 'followup_id' in the schema cache
```

Isso acontece porque o código foi atualizado para usar a nova estrutura `followup`, mas o banco de dados ainda possui a estrutura antiga `mensagem_status`.

## 🚀 Solução: Executar Migração

### Passo 1: Executar Script de Migração

1. Acesse seu painel do **Supabase**
2. Vá para **SQL Editor**
3. Execute o conteúdo do arquivo `migration-followup.sql`

### Passo 2: Verificar Migração

Após executar o script, verifique se:
- ✅ Tabela `followup` foi criada
- ✅ Dados foram migrados de `mensagem_status` para `followup`
- ✅ Coluna `followup_id` foi adicionada na tabela `leads`
- ✅ Tabela `mensagem_status` foi removida

### Passo 3: Reiniciar Servidor

Após a migração do banco:
```bash
npm run dev
```

## 📋 O que foi Alterado

### Arquivos Criados:
- `src/services/followupService.ts` - Serviço completo para followups
- `src/controllers/followupController.ts` - Controller com todos os endpoints
- `src/routes/followupRoutes.ts` - Rotas e documentação Swagger
- `migration-followup.sql` - Script de migração do banco

### Arquivos Atualizados:
- `src/lib/supabase.ts` - Interface Lead atualizada
- `src/lib/validators.ts` - Novos esquemas de validação
- `src/services/leadService.ts` - Referências atualizadas
- `src/controllers/leadController.ts` - Importações corrigidas
- `src/server.ts` - Rotas de followup registradas
- `script.sql` - Estrutura do banco corrigida

## 🎯 Novos Endpoints Disponíveis

Após a migração, você terá acesso a:

- `GET /api/followups` - Listar com paginação
- `POST /api/followups` - Criar novo followup
- `GET /api/followups/{id}` - Buscar por ID
- `PUT /api/followups/{id}` - Atualizar followup
- `DELETE /api/followups/{id}` - Deletar followup
- `GET /api/followups/lead/{leadId}` - Buscar por lead
- `GET /api/followups/status/{status}` - Buscar por status
- `GET /api/followups/embedding` - Buscar com embedding

## 🔍 Verificação de Sucesso

Após a migração, teste:
1. Acesse `http://localhost:3000/api/leads` - deve funcionar sem erros
2. Acesse `http://localhost:3000/api/followups` - deve listar os followups
3. Acesse `http://localhost:3000/api-docs` - deve mostrar a documentação atualizada

---

**⚡ Importante**: Execute a migração do banco ANTES de usar a API atualizada!