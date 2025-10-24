# 🤖 Instruções Gerais para IA - NeoSale API

Este arquivo contém diretrizes gerais e boas práticas para assistentes de IA trabalhando neste projeto.

## 🎯 Princípios Fundamentais

### 1. **SOLID Principles**
- **S**ingle Responsibility: Cada classe/função tem uma única responsabilidade
- **O**pen/Closed: Aberto para extensão, fechado para modificação
- **L**iskov Substitution: Subtipos devem ser substituíveis por seus tipos base
- **I**nterface Segregation: Interfaces específicas são melhores que genéricas
- **D**ependency Inversion: Dependa de abstrações, não de implementações concretas

### 2. **Clean Code**
- Nomes descritivos e significativos
- Funções pequenas e focadas (máximo 20 linhas)
- Evitar comentários desnecessários - código auto-explicativo
- DRY (Don't Repeat Yourself) - evitar duplicação
- KISS (Keep It Simple, Stupid) - simplicidade acima de tudo

### 3. **Clean Architecture**
- Separação clara de responsabilidades (Controllers → Services → Repositories)
- Independência de frameworks
- Testabilidade
- Independência de UI e Database

### 4. **Reusabilidade**
- Criar soluções genéricas e reutilizáveis
- Evitar código específico para um único caso
- Preferir composição sobre herança
- Criar utilitários compartilhados

## 📝 Regras de Documentação

### ❌ NÃO Criar Arquivos .md Adicionais
- **NUNCA** criar arquivos como `FEATURE_README.md`, `GUIDE.md`, `INSTRUCTIONS.md`, etc.
- **SEMPRE** incrementar o `README.md` principal com novas seções
- Manter toda documentação centralizada

### ✅ Atualizar README.md
```markdown
## Nova Feature

Descrição da feature...

### Como Usar
...

### API
...
```

## 🧪 Regras de Testes

### ❌ Arquivos de Teste Temporários
- **NUNCA** deixar arquivos de teste no repositório
- Criar arquivos como `test-*.ts` apenas temporariamente
- **SEMPRE** deletar após validação

### ✅ Processo Correto
```bash
# 1. Criar teste temporário
touch test-feature.ts

# 2. Executar teste
npx ts-node test-feature.ts

# 3. DELETAR após validação
rm test-feature.ts
```

### ✅ Testes Permanentes
- Usar framework de testes (Jest, Vitest)
- Colocar em pasta `__tests__/` ou `*.test.ts`
- Integrar com CI/CD

## 🏗️ Arquitetura e Organização

### Camadas da Aplicação

```
┌─────────────────┐
│   Controllers   │  ← HTTP, validação de entrada, Swagger
├─────────────────┤
│    Services     │  ← Lógica de negócio, orquestração
├─────────────────┤
│  Repositories   │  ← Acesso a dados, queries
├─────────────────┤
│    Database     │  ← Supabase/PostgreSQL
└─────────────────┘
```

### Responsabilidades

**Controllers:**
- Receber requisições HTTP
- Validar entrada (tipos, formatos)
- Chamar services
- Retornar respostas formatadas
- Documentação Swagger

**Services:**
- Lógica de negócio
- Orquestração de operações
- Validações de regras de negócio
- Transformação de dados
- Independente de HTTP

**Repositories (se necessário):**
- Queries ao banco
- Mapeamento de dados
- Abstração do banco de dados

## 💡 Boas Práticas de Código

### 1. Funções Puras
```typescript
// ❌ Evitar - função impura
let total = 0
function addToTotal(value: number) {
  total += value
  return total
}

// ✅ Preferir - função pura
function add(a: number, b: number): number {
  return a + b
}
```

### 2. Composição de Funções
```typescript
// ✅ Funções pequenas e compostas
const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
const normalizeEmail = (email: string): string => email.toLowerCase().trim()
const isValidEmail = (email: string): boolean => validateEmail(normalizeEmail(email))
```

### 3. Early Return
```typescript
// ❌ Evitar - aninhamento profundo
function processUser(user: User) {
  if (user) {
    if (user.active) {
      if (user.email) {
        return sendEmail(user.email)
      }
    }
  }
  return null
}

// ✅ Preferir - early return
function processUser(user: User) {
  if (!user) return null
  if (!user.active) return null
  if (!user.email) return null
  
  return sendEmail(user.email)
}
```

### 4. Evitar Magic Numbers
```typescript
// ❌ Evitar
if (user.age > 18) { ... }

// ✅ Preferir
const MINIMUM_AGE = 18
if (user.age > MINIMUM_AGE) { ... }
```

### 5. Tipos Explícitos
```typescript
// ❌ Evitar
function calculate(a, b) {
  return a + b
}

// ✅ Preferir
function calculate(a: number, b: number): number {
  return a + b
}
```

## 🔄 Reutilização de Código

### 1. Criar Utilitários Genéricos
```typescript
// ✅ Utilitário reutilizável
export function paginate<T>(items: T[], page: number, limit: number) {
  const start = (page - 1) * limit
  const end = start + limit
  return {
    data: items.slice(start, end),
    total: items.length,
    page,
    limit,
    totalPages: Math.ceil(items.length / limit)
  }
}
```

### 2. Extrair Lógica Comum
```typescript
// ❌ Evitar - duplicação
async function getUserById(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .eq('deletado', false)
    .single()
  
  if (error) throw error
  return data
}

async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('deletado', false)
    .single()
  
  if (error) throw error
  return data
}

// ✅ Preferir - genérico reutilizável
async function getById<T>(table: string, id: string): Promise<T> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .eq('deletado', false)
    .single()
  
  if (error) throw error
  return data as T
}
```

### 3. Higher-Order Functions
```typescript
// ✅ Função que retorna função
function createValidator(minLength: number) {
  return (value: string): boolean => value.length >= minLength
}

const validatePassword = createValidator(8)
const validateUsername = createValidator(3)
```

## 🎨 Padrões de Design

### 1. Factory Pattern
```typescript
// ✅ Para criar objetos complexos
class ResponseFactory {
  static success<T>(data: T, message: string = 'Success') {
    return { success: true, data, message }
  }
  
  static error(message: string, error: string = 'ERROR') {
    return { success: false, data: null, message, error }
  }
}
```

### 2. Strategy Pattern
```typescript
// ✅ Para algoritmos intercambiáveis
interface SearchStrategy {
  search(query: string): Promise<Result[]>
}

class TextSearch implements SearchStrategy {
  async search(query: string) { /* ... */ }
}

class SemanticSearch implements SearchStrategy {
  async search(query: string) { /* ... */ }
}

class HybridSearch implements SearchStrategy {
  constructor(
    private textSearch: TextSearch,
    private semanticSearch: SemanticSearch
  ) {}
  
  async search(query: string) {
    const [text, semantic] = await Promise.all([
      this.textSearch.search(query),
      this.semanticSearch.search(query)
    ])
    return this.combine(text, semantic)
  }
}
```

### 3. Repository Pattern
```typescript
// ✅ Para abstração de dados
interface IDocumentoRepository {
  findById(id: string): Promise<Documento>
  findByClienteId(clienteId: string): Promise<Documento[]>
  create(documento: CreateDocumentoDTO): Promise<Documento>
  update(id: string, data: UpdateDocumentoDTO): Promise<Documento>
  delete(id: string): Promise<void>
}

class SupabaseDocumentoRepository implements IDocumentoRepository {
  // Implementação específica do Supabase
}
```

## 🚫 Anti-Patterns a Evitar

### 1. God Objects
```typescript
// ❌ Evitar - classe faz tudo
class DocumentoManager {
  upload() { }
  process() { }
  search() { }
  delete() { }
  sendEmail() { }
  generatePDF() { }
  // ... 50 métodos
}

// ✅ Preferir - responsabilidades separadas
class DocumentoUploader { }
class DocumentoProcessor { }
class DocumentoSearcher { }
class DocumentoDeleter { }
```

### 2. Callback Hell
```typescript
// ❌ Evitar
getData((data) => {
  processData(data, (processed) => {
    saveData(processed, (saved) => {
      sendNotification(saved, () => {
        // ...
      })
    })
  })
})

// ✅ Preferir - async/await
async function handleData() {
  const data = await getData()
  const processed = await processData(data)
  const saved = await saveData(processed)
  await sendNotification(saved)
}
```

### 3. Tight Coupling
```typescript
// ❌ Evitar - acoplamento forte
class UserService {
  private db = new PostgresDB() // Acoplado ao PostgreSQL
  
  async getUser(id: string) {
    return this.db.query('SELECT * FROM users WHERE id = ?', [id])
  }
}

// ✅ Preferir - injeção de dependência
interface IDatabase {
  query(sql: string, params: any[]): Promise<any>
}

class UserService {
  constructor(private db: IDatabase) {} // Desacoplado
  
  async getUser(id: string) {
    return this.db.query('SELECT * FROM users WHERE id = ?', [id])
  }
}
```

## 📋 Visão Geral do Projeto

**NeoSale API** é uma API REST construída com Express.js e TypeScript para gerenciamento de leads e documentos com busca semântica usando OpenAI.

### Stack Tecnológica
- **Backend**: Express.js + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Embeddings**: OpenAI text-embedding-3-small (1536 dimensões)
- **Documentação**: Swagger/OpenAPI
- **Deploy**: Docker Hub + GitHub Actions

## 🎯 Funcionalidades Principais

### 1. Busca Híbrida de Documentos
**Endpoint**: `POST /api/documentos/search`

**Características:**
- Combina busca por texto exato + busca semântica
- Prioriza documentos com match de texto (score 1.0-1.5)
- Busca semântica complementar (score 0-0.5)
- Extração automática de termos (Art. X, Lei X)
- Chunking inteligente de documentos (10k chars, 500 overlap)

**Arquivos Importantes:**
- `src/services/documentoSearchService.ts` - Lógica da busca híbrida
- `src/controllers/documentoSearchController.ts` - Controller com Swagger docs
- `src/routes/documentoRoutes.ts` - Rotas
- `HYBRID_SEARCH_API.md` - Documentação completa da API
- `N8N_HYBRID_SEARCH_GUIDE.md` - Guia de integração com n8n

### 2. Chunking de Documentos
**Características:**
- Documentos > 10k chars são divididos em chunks
- Tamanho: ~10k caracteres por chunk
- Overlap: 500 caracteres entre chunks
- Quebra em limites de sentença para preservar contexto
- Cada chunk recebe seu próprio embedding

**Colunas do Banco:**
- `documento_pai_id` - ID do documento original
- `chunk_index` - Índice do chunk (0-based)
- `total_chunks` - Total de chunks do documento
- `chunk_texto` - Texto do chunk

## 🔧 Padrões de Desenvolvimento

### 1. Estrutura de Código

```
src/
├── controllers/     # Controllers com Swagger docs
├── services/        # Lógica de negócio
├── routes/          # Definição de rotas
├── middleware/      # Middlewares customizados
├── lib/            # Utilitários (openai, supabase, swagger)
└── types/          # Tipos TypeScript
```

### 2. Padrão de Response

**Sempre retornar:**
```typescript
{
  success: boolean
  message: string
  data: any | null
  error?: string  // Código do erro
}
```

### 3. Swagger Documentation

**Sempre incluir em controllers:**
```typescript
/**
 * @swagger
 * /api/endpoint:
 *   post:
 *     summary: Descrição curta
 *     description: |
 *       Descrição detalhada com exemplos
 *     tags: [Tag]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               campo:
 *                 type: string
 *                 example: "valor"
 *           examples:
 *             exemplo1:
 *               summary: Descrição
 *               value: { ... }
 *     responses:
 *       200:
 *         description: Sucesso
 *         content:
 *           application/json:
 *             schema: { ... }
 *             examples:
 *               success: { ... }
 */
```

**Configuração do Swagger:**
- Arquivo: `src/lib/swagger.ts`
- Escaneia: `routes/*.ts` e `controllers/*.ts`
- URL: `http://localhost:3000/api-docs`

### 4. Migrations

**Localização**: `migrations/`

**Padrão de nomenclatura**: `NNN_description.sql`
- Exemplo: `031_add_documento_chunks.sql`

**Executar**: `npm run migrate`

**Importante:**
- Sempre criar migration para mudanças no schema
- Testar localmente antes de commitar
- Incluir rollback quando possível

### 5. OpenAI Embeddings

**Configuração:**
- Modelo: `text-embedding-3-small`
- Dimensões: 1536
- Custo: $0.02 por 1M tokens
- Variável: `NEXT_PUBLIC_OPENAI_API_KEY`

**Função principal:**
```typescript
generateOpenAIEmbedding(text: string): Promise<number[]>
```

**Limites:**
- Trunca texto em 24k caracteres (~6,857 tokens)
- Para documentos grandes, usar chunking

### 6. Supabase

**Configuração:**
- Variáveis: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Cliente: `src/lib/supabase.ts`

**Tabela documentos:**
- `id` - UUID
- `cliente_id` - UUID (filtro obrigatório)
- `base_id` - JSONB array
- `embedding` - vector(1536)
- `chunk_texto` - TEXT
- `documento_pai_id` - UUID (nullable)
- `chunk_index` - INTEGER
- `total_chunks` - INTEGER

## 🚨 Regras Importantes

### 1. Sempre Validar cliente_id
```typescript
if (!cliente_id) {
  return res.status(400).json({
    success: false,
    message: 'cliente_id é obrigatório',
    error: 'VALIDATION_ERROR'
  })
}
```

### 2. Sempre Filtrar por cliente_id
```typescript
.eq('cliente_id', clienteId)
```

### 3. Sempre Excluir Deletados
```typescript
.eq('deletado', false)
```

### 4. Sempre Tratar Erros
```typescript
try {
  // código
} catch (error: any) {
  console.error('Erro:', error)
  return res.status(500).json({
    success: false,
    message: 'Erro interno',
    error: 'INTERNAL_ERROR'
  })
}
```

### 5. Sempre Logar Operações Importantes
```typescript
console.log('🔍 Iniciando busca híbrida...')
console.log(`✅ Encontrados ${results.length} resultados`)
```

## 📝 Convenções de Código

### 1. Nomenclatura
- **Arquivos**: camelCase (`documentoService.ts`)
- **Classes**: PascalCase (`DocumentoSearchService`)
- **Funções**: camelCase (`buscarHibrido`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_CHUNK_SIZE`)
- **Tipos**: PascalCase (`SearchResult`)

### 2. Imports
```typescript
// 1. Externos
import { Request, Response } from 'express'

// 2. Internos - lib
import { supabase } from '../lib/supabase'

// 3. Internos - services
import { DocumentoSearchService } from '../services/documentoSearchService'

// 4. Tipos
import type { SearchParams } from '../types'
```

### 3. Comentários
```typescript
// Comentários curtos em linha

/**
 * Comentários de função/classe com JSDoc
 * @param param - Descrição
 * @returns Descrição
 */
```

## 🔄 Workflow de Desenvolvimento

### 1. Criar Nova Feature

```bash
# 1. Criar branch
git checkout -b feature/nome-feature

# 2. Desenvolver
# - Criar service
# - Criar controller com Swagger
# - Adicionar rota
# - Criar migration se necessário
# - Atualizar documentação

# 3. Testar
npm run build
npm run dev

# 4. Commit
git add .
git commit -m "feat: descrição da feature"

# 5. Push
git push origin feature/nome-feature
```

### 2. Deploy

```bash
# Incrementa versão e faz deploy
npm run deploy

# Opções:
# 1) Patch (0.1.0 -> 0.1.1) - Correções
# 2) Minor (0.1.0 -> 0.2.0) - Features
# 3) Major (0.1.0 -> 1.0.0) - Breaking changes
```

## 📚 Documentação

### Arquivos de Documentação
- `README.md` - Visão geral do projeto
- `HYBRID_SEARCH_API.md` - API de busca híbrida
- `N8N_HYBRID_SEARCH_GUIDE.md` - Integração com n8n
- `CHANGELOG_SEARCH_TERMS.md` - Mudanças no search_terms
- `AI_INSTRUCTIONS.md` - Este arquivo

### Swagger
- URL: `http://localhost:3000/api-docs`
- Sempre atualizar ao modificar endpoints
- Incluir exemplos de request/response

## 🐛 Debugging

### 1. Logs Importantes
```typescript
console.log('🔍 Swagger __dirname:', __dirname)
console.log('✅ Embedding gerado em Xms')
console.log('❌ Erro:', error)
```

### 2. Verificar Embeddings
```sql
SELECT id, nome, embedding IS NOT NULL as has_embedding
FROM documentos
WHERE cliente_id = 'uuid';
```

### 3. Testar Busca
```bash
npx ts-node test-search-service.ts
```

## 🎯 Casos de Uso Comuns

### 1. Adicionar Novo Endpoint

1. Criar service em `src/services/`
2. Criar controller em `src/controllers/` com Swagger
3. Adicionar rota em `src/routes/`
4. Atualizar `src/lib/swagger.ts` se necessário
5. Compilar: `npm run build`
6. Testar no Swagger

### 2. Modificar Schema do Banco

1. Criar migration em `migrations/NNN_description.sql`
2. Executar: `npm run migrate`
3. Atualizar tipos TypeScript se necessário
4. Atualizar services/controllers afetados

### 3. Adicionar Integração com n8n

1. Documentar endpoint em `N8N_HYBRID_SEARCH_GUIDE.md`
2. Incluir exemplos de HTTP Request
3. Incluir exemplos de Function Node
4. Incluir workflow completo

## 🔐 Segurança

### 1. Variáveis de Ambiente
- Nunca commitar `.env`
- Usar `.env.example` como template
- Validar variáveis obrigatórias no startup

### 2. Validação de Entrada
- Sempre validar tipos
- Sempre validar UUIDs
- Sempre sanitizar strings
- Sempre limitar tamanhos (arrays, strings)

### 3. Rate Limiting
- Implementar para endpoints públicos
- Considerar custos da OpenAI

## 📊 Performance

### 1. Busca Híbrida
- Embedding: ~1s
- Busca texto: ~100ms
- Busca semântica: ~200ms
- **Total: ~1.3s**

### 2. Otimizações
- Limitar resultados (max 100)
- Usar índices no banco
- Cache de embeddings quando possível
- Batch processing para múltiplos documentos

## 🚀 Próximas Features (Sugestões)

1. **Cache de Embeddings**
   - Redis para embeddings frequentes
   - Reduzir custos da OpenAI

2. **Busca Avançada**
   - Filtros por data
   - Filtros por tipo de documento
   - Ordenação customizada

3. **Analytics**
   - Tracking de buscas
   - Termos mais buscados
   - Performance metrics

4. **RAG (Retrieval-Augmented Generation)**
   - Integração com GPT-4
   - Geração de respostas contextualizadas
   - Chat com documentos

## 📞 Contatos e Recursos

- **Swagger**: http://localhost:3000/api-docs
- **Supabase Dashboard**: [URL do projeto]
- **Docker Hub**: brunobspaiva/neosale-api
- **GitHub**: NeoSale/neosale-api

## ✅ Checklist para Novas Features

- [ ] Service criado com lógica de negócio
- [ ] Controller criado com Swagger completo
- [ ] Rota adicionada
- [ ] Migration criada (se necessário)
- [ ] Testes criados
- [ ] Documentação atualizada
- [ ] Swagger testado
- [ ] Build sem erros
- [ ] Deploy realizado
- [ ] Documentação para n8n (se aplicável)

## 🎓 Aprendizados Importantes

### 1. Busca Semântica vs Híbrida
- **Semântica pura**: Boa para conceitos, ruim para termos específicos
- **Híbrida**: Melhor dos dois mundos
- **Exemplo**: "Art. 77" tinha 44% de similaridade semântica, mas 120% com híbrida

### 2. Chunking
- Chunks pequenos (10k) = maior precisão (70-85%)
- Chunks grandes (20k) = menor precisão (40-57%)
- Overlap é crucial para contexto

### 3. Score Boosting
- Text match: 1.0 + (similarity * 0.5) = 1.0 a 1.5
- Semantic only: similarity * 0.5 = 0 a 0.5
- Garante que text matches sempre apareçam primeiro

## 🧹 Limpeza e Manutenção

### Arquivos Temporários a Deletar

Após completar uma tarefa, **SEMPRE** deletar:

```bash
# Arquivos de teste temporários
rm test-*.ts
rm test-*.js

# Arquivos .md desnecessários (manter apenas README.md e AI_INSTRUCTIONS.md)
rm FEATURE_*.md
rm GUIDE_*.md
rm CHANGELOG_*.md
rm SWAGGER_*.md
rm *_README.md

# Arquivos de debug
rm debug-*.ts
rm temp-*.ts
```

### Checklist de Limpeza

Antes de commitar, verificar:

- [ ] Nenhum arquivo `test-*.ts` no repositório
- [ ] Apenas `README.md` e `AI_INSTRUCTIONS.md` como arquivos .md
- [ ] Nenhum arquivo de debug temporário
- [ ] Nenhum `console.log` de debug no código
- [ ] Nenhum comentário TODO não resolvido
- [ ] Build sem erros (`npm run build`)

## 📚 Resumo das Regras Principais

### ✅ SEMPRE Fazer

1. **Seguir SOLID, Clean Code e Clean Architecture**
2. **Criar código reutilizável e genérico**
3. **Atualizar README.md** ao invés de criar novos .md
4. **Deletar arquivos de teste** após validação
5. **Usar tipos explícitos** em TypeScript
6. **Validar entrada** em controllers
7. **Tratar erros** adequadamente
8. **Documentar no Swagger** todos os endpoints
9. **Usar early return** para reduzir aninhamento
10. **Extrair lógica comum** em utilitários

### ❌ NUNCA Fazer

1. **Criar arquivos .md adicionais** (usar README.md)
2. **Deixar arquivos de teste** no repositório
3. **Criar God Objects** (classes que fazem tudo)
4. **Usar magic numbers** (definir constantes)
5. **Acoplar fortemente** (usar injeção de dependência)
6. **Duplicar código** (criar funções reutilizáveis)
7. **Usar callback hell** (usar async/await)
8. **Deixar console.log** de debug
9. **Commitar sem build** (`npm run build`)
10. **Ignorar princípios SOLID**

## 🎯 Fluxo de Trabalho Ideal

```
1. Entender requisito
   ↓
2. Planejar arquitetura (SOLID)
   ↓
3. Criar código reutilizável
   ↓
4. Criar teste temporário
   ↓
5. Validar funcionamento
   ↓
6. DELETAR teste
   ↓
7. Atualizar README.md
   ↓
8. Build e verificar erros
   ↓
9. Commit e push
```

---

**Última atualização**: 2025-10-23
**Versão da API**: 1.18.6

**Arquivos .md permitidos:**
- `README.md` - Documentação principal
- `AI_INSTRUCTIONS.md` - Este arquivo
