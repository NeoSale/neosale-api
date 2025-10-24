# Como Chamar a Busca Híbrida do n8n

## 🎯 Endpoint

```
POST http://localhost:3000/api/documentos/search
```

## 📋 Configuração no n8n

### 1. Adicionar Node HTTP Request

1. Adicione um node **HTTP Request** ao seu workflow
2. Configure os seguintes parâmetros:

### 2. Configuração Básica

**Method:** `POST`

**URL:** `http://localhost:3000/api/documentos/search`

**Authentication:** None (ou configure se necessário)

**Send Body:** Yes

**Body Content Type:** JSON

### 3. Body (JSON)

```json
{
  "cliente_id": "{{ $json.cliente_id }}",
  "base_id": {{ $json.base_id }},
  "query": "{{ $json.query }}",
  "limit": 10
}
```

## 🔧 Configuração Detalhada no n8n

### Opção 1: Valores Fixos (Para Teste)

```json
{
  "cliente_id": "f029ad69-3465-454e-ba85-e0cdb75c445f",
  "base_id": ["1b87c1a9-ced5-4760-98ef-6a97e464cd24"],
  "query": "o que diz o art. 77 da Lei Complementar 214/2025?",
  "limit": 10
}
```

### Opção 2: Valores Dinâmicos (Produção)

**No node HTTP Request, aba "Body Parameters":**

| Key | Value | Type |
|-----|-------|------|
| `cliente_id` | `{{ $json.cliente_id }}` | String |
| `base_id` | `{{ $json.base_id }}` | Array |
| `query` | `{{ $json.query }}` | String |
| `limit` | `10` | Number |

### Opção 3: Expression (Mais Flexível)

No campo **Body**, selecione **Expression** e use:

```javascript
{
  "cliente_id": "{{ $json.cliente_id }}",
  "base_id": {{ $json.base_id ? JSON.stringify($json.base_id) : '[]' }},
  "query": "{{ $json.query }}",
  "search_terms": {{ $json.search_terms ? JSON.stringify($json.search_terms) : 'null' }},
  "limit": {{ $json.limit || 10 }}
}
```

## 📊 Workflow Completo no n8n

### Exemplo 1: Chatbot com Busca de Documentos

```
┌─────────────┐
│  Webhook    │ Recebe pergunta do usuário
└──────┬──────┘
       │
       v
┌─────────────┐
│  Set Node   │ Prepara dados para busca
└──────┬──────┘
       │
       v
┌─────────────┐
│ HTTP Request│ Chama /api/documentos/search
└──────┬──────┘
       │
       v
┌─────────────┐
│ IF Node     │ Verifica se encontrou resultados
└──────┬──────┘
       │
       ├─ Sim ─> Formata resposta
       │
       └─ Não ─> Resposta padrão
```

### Configuração do Set Node (Preparar Dados)

**Aba "Values to Set":**

| Name | Value |
|------|-------|
| `cliente_id` | `{{ $json.user.cliente_id }}` |
| `base_id` | `{{ $json.user.base_ids }}` |
| `query` | `{{ $json.message }}` |
| `limit` | `10` |

### Configuração do HTTP Request

**Method:** POST

**URL:** `http://localhost:3000/api/documentos/search`

**Body (JSON):**
```json
{
  "cliente_id": "{{ $json.cliente_id }}",
  "base_id": {{ JSON.stringify($json.base_id) }},
  "query": "{{ $json.query }}",
  "limit": {{ $json.limit }}
}
```

### Configuração do IF Node

**Condition:**
```javascript
{{ $json.success === true && $json.data.length > 0 }}
```

## 📝 Exemplos de Uso

### Exemplo 1: Busca Simples

**Input do Webhook:**
```json
{
  "cliente_id": "f029ad69-3465-454e-ba85-e0cdb75c445f",
  "base_id": ["1b87c1a9-ced5-4760-98ef-6a97e464cd24"],
  "message": "o que diz o art. 77?"
}
```

**Set Node:**
```json
{
  "cliente_id": "{{ $json.cliente_id }}",
  "base_id": "{{ $json.base_id }}",
  "query": "{{ $json.message }}",
  "limit": 10
}
```

**HTTP Request Response:**
```json
{
  "success": true,
  "message": "10 documento(s) encontrado(s)",
  "data": [
    {
      "id": "fa435ec8-4895-4097-8a50-9aa21f6784ce",
      "nome": "ref (Parte 12)",
      "chunk_texto": "Art. 77. As diferenças percentuais...",
      "similarity": 0.41,
      "combined_score": 1.205,
      "text_match": true,
      "matched_term": "art. 77"
    }
  ]
}
```

### Exemplo 2: Formatar Resposta para o Usuário

**Function Node (Formatar Resposta):**

```javascript
// Pegar os resultados da busca
const results = $input.item.json.data;

if (!results || results.length === 0) {
  return {
    json: {
      response: "Desculpe, não encontrei informações sobre isso."
    }
  };
}

// Pegar o melhor resultado (primeiro)
const best = results[0];

// Formatar resposta
let response = `Encontrei informação sobre sua pergunta:\n\n`;
response += `📄 **${best.nome}**\n\n`;

if (best.text_match) {
  response += `✅ Contém: "${best.matched_term}"\n\n`;
}

response += `${best.chunk_texto}\n\n`;
response += `_Relevância: ${(best.combined_score * 100).toFixed(0)}%_`;

// Se houver mais resultados
if (results.length > 1) {
  response += `\n\n📚 Encontrei mais ${results.length - 1} documento(s) relacionado(s).`;
}

return {
  json: {
    response: response,
    results: results
  }
};
```

### Exemplo 3: Múltiplas Bases

**Input:**
```json
{
  "cliente_id": "uuid",
  "base_ids": ["base1-uuid", "base2-uuid", "base3-uuid"],
  "query": "como calcular impostos?"
}
```

**Set Node:**
```json
{
  "cliente_id": "{{ $json.cliente_id }}",
  "base_id": {{ JSON.stringify($json.base_ids) }},
  "query": "{{ $json.query }}",
  "limit": 20
}
```

## 🔄 Workflow Avançado: RAG (Retrieval-Augmented Generation)

```
┌─────────────┐
│  Webhook    │ Pergunta do usuário
└──────┬──────┘
       │
       v
┌─────────────┐
│  Set Node   │ Prepara busca
└──────┬──────┘
       │
       v
┌─────────────┐
│ HTTP Request│ Busca documentos (/api/documentos/search)
└──────┬──────┘
       │
       v
┌─────────────┐
│ Function    │ Extrai contexto dos chunks
└──────┬──────┘
       │
       v
┌─────────────┐
│ OpenAI Node │ Gera resposta com contexto
└──────┬──────┘
       │
       v
┌─────────────┐
│  Response   │ Retorna ao usuário
└─────────────┘
```

### Function Node (Extrair Contexto)

```javascript
const results = $input.item.json.data;

if (!results || results.length === 0) {
  return {
    json: {
      context: "Nenhum documento encontrado.",
      hasResults: false
    }
  };
}

// Pegar os top 3 resultados
const topResults = results.slice(0, 3);

// Montar contexto
let context = "Contexto dos documentos:\n\n";

topResults.forEach((doc, i) => {
  context += `--- Documento ${i + 1}: ${doc.nome} ---\n`;
  context += `${doc.chunk_texto}\n\n`;
});

return {
  json: {
    context: context,
    hasResults: true,
    query: $input.item.json.query || $('Set Node').item.json.query,
    topResult: topResults[0]
  }
};
```

### OpenAI Node (Gerar Resposta)

**Model:** gpt-4 ou gpt-3.5-turbo

**Prompt:**
```
Você é um assistente especializado em documentos legais.

Use o contexto abaixo para responder a pergunta do usuário.
Se a resposta não estiver no contexto, diga que não encontrou a informação.

Contexto:
{{ $json.context }}

Pergunta do usuário:
{{ $json.query }}

Responda de forma clara e objetiva, citando o documento quando relevante.
```

## 🎨 Templates Prontos

### Template 1: Busca Básica

```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "search-docs",
        "responseMode": "responseNode",
        "options": {}
      }
    },
    {
      "name": "HTTP Request",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "http://localhost:3000/api/documentos/search",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "cliente_id",
              "value": "={{ $json.cliente_id }}"
            },
            {
              "name": "base_id",
              "value": "={{ $json.base_id }}"
            },
            {
              "name": "query",
              "value": "={{ $json.query }}"
            },
            {
              "name": "limit",
              "value": 10
            }
          ]
        },
        "options": {}
      }
    }
  ]
}
```

### Template 2: RAG Completo

Disponível em: `n8n-templates/rag-hybrid-search.json`

## 🐛 Troubleshooting

### Erro: "Cannot read property 'data' of undefined"

**Causa:** Response não está no formato esperado

**Solução:**
```javascript
// No Function Node, sempre valide:
const response = $input.item.json;
const data = response?.data || [];
```

### Erro: "Invalid JSON"

**Causa:** Array não está sendo stringificado corretamente

**Solução:**
```javascript
// Use JSON.stringify para arrays:
{
  "base_id": {{ JSON.stringify($json.base_id) }}
}
```

### Erro: 400 - "cliente_id é obrigatório"

**Causa:** Campo não está sendo enviado

**Solução:** Verifique se o Set Node está configurado corretamente

### Timeout

**Causa:** Geração de embedding demora ~1s

**Solução:** Configure timeout no HTTP Request para 5000ms (5s)

## 📊 Monitoramento

### Logs no n8n

Adicione um node **Function** para logar:

```javascript
console.log('Busca iniciada:', {
  query: $json.query,
  cliente_id: $json.cliente_id
});

// Após HTTP Request
console.log('Resultados:', {
  total: $json.data?.length || 0,
  primeiro: $json.data?.[0]?.nome
});

return $input.all();
```

## 🚀 Próximos Passos

1. **Teste o endpoint** com valores fixos
2. **Configure o webhook** para receber perguntas
3. **Adicione formatação** de resposta
4. **Integre com OpenAI** para RAG
5. **Deploy em produção**

## 📚 Recursos

- **Documentação da API**: `HYBRID_SEARCH_API.md`
- **Teste local**: `test-search-service.ts`
- **Swagger**: http://localhost:3000/api-docs
