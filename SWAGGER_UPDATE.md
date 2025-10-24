# ✅ Swagger Atualizado

## 🔧 Mudança Realizada

Adicionei os controllers ao scan do Swagger para que as anotações JSDoc sejam detectadas.

**Arquivo modificado:** `src/lib/swagger.ts`

**Mudança:**
```typescript
apis: [
  path.join(__dirname, '../routes/*.ts'),
  path.join(__dirname, '../routes/*.js'),
  path.join(__dirname, '../controllers/*.ts'),  // ✅ NOVO
  path.join(__dirname, '../controllers/*.js')    // ✅ NOVO
]
```

## 🚀 Como Ver o Endpoint no Swagger

1. **Recompilar o código:**
   ```bash
   npm run build
   ```

2. **Reiniciar o servidor:**
   ```bash
   npm run dev
   # ou
   npm start
   ```

3. **Acessar o Swagger:**
   ```
   http://localhost:3000/api-docs
   ```

4. **Procurar por:**
   - Tag: **Documentos**
   - Endpoint: **POST /api/documentos/search**
   - Título: "Busca híbrida de documentos (texto + semântica)"

## 📋 Endpoint Documentado

O endpoint `/api/documentos/search` agora aparece no Swagger com:

- ✅ Descrição completa
- ✅ Parâmetros de entrada (body)
- ✅ Exemplos de request
- ✅ Schemas de response
- ✅ Códigos de status (200, 400, 500)

## 🎯 Teste Rápido no Swagger

1. Clique em **POST /api/documentos/search**
2. Clique em **Try it out**
3. Cole este JSON no body:

```json
{
  "cliente_id": "f029ad69-3465-454e-ba85-e0cdb75c445f",
  "base_id": ["1b87c1a9-ced5-4760-98ef-6a97e464cd24"],
  "query": "o que diz o art. 77 da Lei Complementar 214/2025?",
  "limit": 10
}
```

4. Clique em **Execute**
5. Veja a resposta com o Chunk 12 em 1º lugar! 🎉

## 📝 Nota

Se o endpoint ainda não aparecer após reiniciar:
- Limpe o cache do navegador (Ctrl+Shift+R)
- Ou acesse em modo anônimo
- Ou adicione `?v=2` na URL: `http://localhost:3000/api-docs?v=2`
