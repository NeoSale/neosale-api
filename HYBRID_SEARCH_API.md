# API de Busca Híbrida de Documentos

## 🎯 Endpoint

```
POST /api/documentos/search
```

## 📋 Descrição

Busca híbrida que combina:
- **Busca por texto exato** - Encontra documentos que contêm termos específicos
- **Busca semântica** - Usa embeddings OpenAI para encontrar documentos similares

**Vantagem:** Garante que documentos com termos específicos (ex: "Art. 77") apareçam em primeiro lugar, mesmo que a similaridade semântica seja baixa.

## 📥 Request

### Headers
```json
{
  "Content-Type": "application/json"
}
```

### Body

```json
{
  "cliente_id": "uuid",
  "base_id": ["uuid1", "uuid2"],  // Opcional
  "query": "o que diz o art. 77 da Lei Complementar 214/2025?",
  "search_terms": ["Art. 77"],  // Opcional - extraído automaticamente se não fornecido
  "limit": 10  // Opcional - padrão 10, máximo 100
}
```

### Parâmetros

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `cliente_id` | string (uuid) | ✅ Sim | ID do cliente |
| `base_id` | array[string] | ❌ Não | IDs das bases para filtrar |
| `query` | string | ✅ Sim | Texto da consulta |
| `search_terms` | array[string] | ❌ Não | Termos específicos para buscar. Se não fornecido, são extraídos automaticamente da query |
| `limit` | integer | ❌ Não | Número de resultados (1-100, padrão: 10) |

## 📤 Response

### Success (200)

```json
{
  "success": true,
  "message": "10 documento(s) encontrado(s)",
  "data": [
    {
      "id": "uuid",
      "nome": "Lei Complementar 214/2025 (Parte 12)",
      "descricao": "Chunk 12 de 80",
      "nome_arquivo": "lei_214_2025.pdf",
      "chunk_index": 11,
      "total_chunks": 80,
      "documento_pai_id": "uuid-pai",
      "chunk_texto": "Art. 77. As diferenças percentuais...",
      "similarity": 0.41,
      "combined_score": 1.205,
      "text_match": true,
      "matched_term": "Art. 77",
      "created_at": "2025-10-23T20:25:32Z"
    }
  ]
}
```

### Error (400/500)

```json
{
  "success": false,
  "message": "Mensagem de erro",
  "error": "ERROR_CODE"
}
```

## 📊 Campos do Resultado

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | ID do chunk/documento |
| `nome` | string | Nome do documento |
| `chunk_index` | integer | Índice do chunk (0-based) |
| `total_chunks` | integer | Total de chunks do documento |
| `documento_pai_id` | string | ID do documento pai (se for um chunk) |
| `chunk_texto` | string | Primeiros 500 caracteres do chunk |
| `similarity` | number | Similaridade semântica (0-1) |
| `combined_score` | number | Score combinado (texto + semântica) |
| `text_match` | boolean | Se contém o texto exato |
| `matched_term` | string | Termo que foi encontrado |

## 🎯 Como Funciona

### 1. Extração Automática de Termos

Se você não fornecer `search_terms`, o sistema extrai automaticamente:

- **Artigos**: "Art. 77", "Artigo 123", "art 45"
- **Leis**: "Lei 214", "Lei Complementar 214"

**Exemplo:**
```
Query: "o que diz o art. 77 da Lei Complementar 214/2025?"
Termos extraídos: ["art. 77", "Lei Complementar 214"]
```

### 2. Busca por Texto

Busca chunks que contêm os termos exatos:
- Case-insensitive
- Busca em `chunk_texto`
- Sem limite de resultados

### 3. Cálculo de Score

**Text Match:**
```
combined_score = 1.0 + (similarity * 0.5)
Resultado: 1.0 a 1.5
```

**Apenas Semântica:**
```
combined_score = similarity * 0.5
Resultado: 0 a 0.5
```

**Resultado:** Text matches sempre aparecem primeiro!

### 4. Ordenação

1. Por `combined_score` (descendente)
2. Por `similarity` (descendente)

## 💡 Exemplos de Uso

### Exemplo 1: Buscar Artigo Específico

```bash
curl -X POST http://localhost:3000/api/documentos/search \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": "f029ad69-3465-454e-ba85-e0cdb75c445f",
    "base_id": ["1b87c1a9-ced5-4760-98ef-6a97e464cd24"],
    "query": "o que diz o art. 77?",
    "limit": 5
  }'
```

**Resultado:**
- Chunk com "Art. 77" em 1º lugar (score ~120%)
- Outros chunks similares depois (score 20-30%)

### Exemplo 2: Buscar com Termos Personalizados

```bash
curl -X POST http://localhost:3000/api/documentos/search \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": "f029ad69-3465-454e-ba85-e0cdb75c445f",
    "query": "como calcular impostos?",
    "search_terms": ["alíquota", "base de cálculo"],
    "limit": 10
  }'
```

### Exemplo 3: Busca Apenas Semântica

```bash
curl -X POST http://localhost:3000/api/documentos/search \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": "f029ad69-3465-454e-ba85-e0cdb75c445f",
    "query": "como funciona o sistema tributário?",
    "search_terms": [],
    "limit": 10
  }'
```

## 📈 Performance

### Métricas

- **Geração de embedding**: ~1s
- **Busca por texto**: ~100ms
- **Busca semântica**: ~200ms
- **Total**: ~1.3s

### Custos

- **OpenAI**: ~$0.00002 por busca (embedding da query)
- **Supabase**: Incluído no plano

## 🔧 Integração Frontend

### React/TypeScript

```typescript
interface SearchRequest {
  cliente_id: string
  base_id?: string[]
  query: string
  search_terms?: string[]
  limit?: number
}

interface SearchResult {
  id: string
  nome: string
  chunk_index: number
  total_chunks: number
  similarity: number
  combined_score: number
  text_match: boolean
  matched_term?: string
  chunk_texto: string
}

async function searchDocuments(params: SearchRequest): Promise<SearchResult[]> {
  const response = await fetch('/api/documentos/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  })
  
  const data = await response.json()
  return data.success ? data.data : []
}

// Uso
const results = await searchDocuments({
  cliente_id: 'uuid',
  base_id: ['uuid'],
  query: 'o que diz o art. 77?',
  limit: 10
})

// Mostrar resultados
results.forEach(doc => {
  console.log(`${doc.nome} - Score: ${(doc.combined_score * 100).toFixed(0)}%`)
  if (doc.text_match) {
    console.log(`✅ Contém: "${doc.matched_term}"`)
  }
})
```

## 🎨 UI Sugerida

### Mostrar Resultados

```tsx
{results.map((doc, i) => (
  <div key={doc.id} className="result-card">
    <div className="result-header">
      {doc.text_match && <Badge>Match Exato</Badge>}
      <h3>{doc.nome}</h3>
      <span>Score: {(doc.combined_score * 100).toFixed(0)}%</span>
    </div>
    
    {doc.text_match && (
      <div className="matched-term">
        ✅ Contém: "{doc.matched_term}"
      </div>
    )}
    
    <p className="chunk-text">{doc.chunk_texto}</p>
    
    <div className="result-footer">
      <span>Chunk {doc.chunk_index + 1} de {doc.total_chunks}</span>
      <span>Similaridade: {(doc.similarity * 100).toFixed(0)}%</span>
    </div>
  </div>
))}
```

## 🚀 Vantagens

### vs Busca Apenas Semântica

| Aspecto | Semântica | Híbrida |
|---------|-----------|---------|
| Encontra "Art. 77" | ❌ Não (44% similaridade) | ✅ Sim (1º lugar) |
| Precisão | Moderada | Alta |
| Recall | Alto | Alto |
| UX | Frustrante | Excelente |

### vs Busca Apenas por Texto

| Aspecto | Texto | Híbrida |
|---------|-------|---------|
| Termos exatos | ✅ Sim | ✅ Sim |
| Sinônimos | ❌ Não | ✅ Sim |
| Conceitos | ❌ Não | ✅ Sim |
| Flexibilidade | Baixa | Alta |

## ✨ Casos de Uso

1. **Busca Legal** - Encontrar artigos, parágrafos, incisos específicos
2. **Documentação Técnica** - Encontrar funções, classes, métodos
3. **Base de Conhecimento** - Encontrar respostas específicas
4. **Contratos** - Encontrar cláusulas específicas
5. **Regulamentos** - Encontrar normas e regras

## 📚 Documentação Adicional

- **Swagger**: http://localhost:3000/api-docs
- **Service**: `src/services/documentoSearchService.ts`
- **Controller**: `src/controllers/documentoSearchController.ts`
- **Testes**: `test-search-service.ts`
