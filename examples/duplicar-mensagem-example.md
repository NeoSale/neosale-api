# 📋 Exemplo: Duplicar Mensagem

## 🎯 Endpoint Implementado

```
POST /api/mensagens/{id}/duplicar
```

## 📝 Descrição

Este endpoint permite duplicar uma mensagem existente, criando uma nova mensagem com os mesmos dados da original, mas com o nome modificado para indicar que é uma cópia.

## 🔧 Funcionalidades Implementadas

### 1. **Service Layer** (`mensagemService.ts`)
```typescript
async duplicar(id: string): Promise<Mensagem> {
  // Busca a mensagem original
  const mensagemOriginal = await this.buscarPorId(id);
  
  if (!mensagemOriginal) {
    throw new Error('Mensagem não encontrada');
  }
  
  // Cria nova mensagem com nome modificado
  const novoNome = mensagemOriginal.nome 
    ? `${mensagemOriginal.nome} (Cópia)` 
    : 'Mensagem (Cópia)';
  
  const dadosDuplicacao: CriarMensagemData = {
    nome: novoNome,
    intervalo_numero: mensagemOriginal.intervalo_numero,
    intervalo_tipo: mensagemOriginal.intervalo_tipo,
    texto_mensagem: mensagemOriginal.texto_mensagem
  };
  
  return await this.criar(dadosDuplicacao);
}
```

### 2. **Controller Layer** (`mensagemController.ts`)
```typescript
async duplicar(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const mensagemDuplicada = await mensagemService.duplicar(id);
    
    res.status(201).json(mensagemDuplicada);
  } catch (error) {
    if (error instanceof Error && error.message === 'Mensagem não encontrada') {
      res.status(404).json({ error: 'Mensagem não encontrada' });
      return;
    }
    
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
```

### 3. **Routes Layer** (`mensagemRoutes.ts`)
```typescript
router.post('/:id/duplicar',
  [
    param('id')
      .isUUID()
      .withMessage('ID deve ser um UUID válido')
  ],
  mensagemController.duplicar
);
```

## 📊 Exemplos de Uso

### ✅ Sucesso - Duplicar Mensagem

**Request:**
```http
POST /api/mensagens/e81371f4-5507-49ee-a272-aaf6b17cd1fb/duplicar
Content-Type: application/json
```

**Response (201 Created):**
```json
{
  "id": "f92482e5-6618-5aff-b383-bbf7c28de2gc",
  "nome": "Mensagem de Boas-vindas (Cópia)",
  "intervalo_numero": 30,
  "intervalo_tipo": "minutos",
  "texto_mensagem": "Olá! Obrigado pelo seu interesse em nossos serviços.",
  "created_at": "2025-01-22T21:30:00.000Z",
  "updated_at": "2025-01-22T21:30:00.000Z"
}
```

### ❌ Erro - Mensagem Não Encontrada

**Request:**
```http
POST /api/mensagens/00000000-0000-0000-0000-000000000000/duplicar
```

**Response (404 Not Found):**
```json
{
  "error": "Mensagem não encontrada"
}
```

### ❌ Erro - ID Inválido

**Request:**
```http
POST /api/mensagens/invalid-id/duplicar
```

**Response (400 Bad Request):**
```json
{
  "errors": [
    {
      "msg": "ID deve ser um UUID válido",
      "param": "id",
      "location": "params"
    }
  ]
}
```

## 🔍 Validações Implementadas

1. **Validação de UUID**: O ID deve ser um UUID válido
2. **Verificação de Existência**: A mensagem original deve existir
3. **Tratamento de Erros**: Respostas apropriadas para diferentes cenários

## 📚 Documentação Swagger

O endpoint está documentado no Swagger com:
- Descrição completa
- Parâmetros obrigatórios
- Exemplos de resposta
- Códigos de status HTTP

## 🎯 Comportamento da Duplicação

1. **Nome da Mensagem**:
   - Se a mensagem original tem nome: `"Nome Original (Cópia)"`
   - Se não tem nome: `"Mensagem (Cópia)"`

2. **Dados Copiados**:
   - `intervalo_numero`
   - `intervalo_tipo`
   - `texto_mensagem`

3. **Dados Novos**:
   - `id` (novo UUID gerado automaticamente)
   - `created_at` (timestamp atual)
   - `updated_at` (timestamp atual)
   - `nome` (modificado para indicar cópia)

## 🚀 Como Testar

1. **Via Swagger UI**: Acesse `/api-docs` e teste o endpoint
2. **Via cURL**:
   ```bash
   curl -X POST "http://localhost:3000/api/mensagens/e81371f4-5507-49ee-a272-aaf6b17cd1fb/duplicar" \
        -H "Content-Type: application/json"
   ```
3. **Via Postman**: Importe a collection da API e teste

---

**✅ Endpoint implementado com sucesso!** A funcionalidade de duplicação está pronta para uso.