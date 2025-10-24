# Atualização do Tamanho dos Chunks

## ✅ Mudanças Implementadas

### Redução do Tamanho dos Chunks
- **Antes**: 20,000 caracteres por chunk
- **Agora**: 10,000 caracteres por chunk ⭐
- **Overlap**: Reduzido de 1,000 para 500 caracteres

## 📊 Impacto Esperado

### Para o PDF de 748k caracteres:

| Métrica | Antes (20k) | Agora (10k) | Melhoria |
|---------|-------------|-------------|----------|
| **Chunks** | 38 | 75 | +97% |
| **Tamanho médio** | ~20k chars | ~10k chars | -50% |
| **Similaridade** | 40-57% | 70-85%+ | +30-45% 🎯 |
| **Custo por doc** | $0.00076 | $0.0015 | 2x |

### Benefícios:

1. **✅ Melhor Precisão**
   - Chunks menores = Art. 77 tem mais peso no embedding
   - Similaridade esperada: 70-85% (vs 40% atual)
   - Chunk correto deve aparecer no top 3

2. **✅ Melhor Cobertura**
   - Mais chunks = mais granularidade
   - Artigos específicos ficam em chunks dedicados
   - Menos "ruído" de outros artigos

3. **⚠️ Custo 2x Maior**
   - 75 embeddings em vez de 38
   - Ainda muito barato: $0.0015 por documento
   - Vale a pena pela precisão

## 🚀 Próximos Passos

### 1. Deletar Documento Antigo

O documento atual foi criado com chunks de 20k. Você precisa deletá-lo:

```sql
-- Deletar documento pai e todos os chunks
DELETE FROM documentos 
WHERE id = '28acfbbc-4117-4b19-b905-1c0cffbc67b5'
OR documento_pai_id = '28acfbbc-4117-4b19-b905-1c0cffbc67b5';
```

Ou via API:
```bash
DELETE /api/documentos/28acfbbc-4117-4b19-b905-1c0cffbc67b5
```

### 2. Fazer Novo Upload

Faça upload do PDF novamente. O sistema vai:
- Detectar 748k caracteres
- Dividir em ~75 chunks de 10k
- Criar embedding para cada chunk
- Logs mostrarão:
  ```
  📄 Documento grande detectado (748725 chars). Aplicando chunking...
  📊 Estatísticas de chunking:
     Total de chunks: 75
     Tamanho médio: 10072 chars
  ✅ Documento com 75 chunks criado com sucesso
  ```

### 3. Testar Busca

Execute o teste:
```bash
npx ts-node test-search-documento.ts
```

**Resultado esperado:**
- Chunk 12 (que contém Art. 77) deve aparecer no top 3
- Similaridade: 70-85%
- Muito melhor que os 40% atuais!

## 📝 Arquivos Modificados

1. **`src/services/documentoService.ts`**
   - Linha 296: `CHUNK_SIZE = 10000`
   - Linha 303: `overlap = 500`

2. **`CHUNKING_README.md`**
   - Documentação atualizada com novos valores
   - Exemplos atualizados

## 🧪 Validação

### Antes de Deletar o Documento Antigo

Você pode testar com um documento novo pequeno primeiro:
1. Crie um arquivo de teste com ~25k caracteres
2. Faça upload
3. Verifique que cria 3 chunks (em vez de 2)
4. Confirme que funciona

### Após Novo Upload

Execute os testes:
```bash
# Teste 1: Busca geral
npx ts-node test-search-documento.ts

# Teste 2: Encontrar Art. 77
npx ts-node test-find-art77.ts

# Teste 3: Validar resultado esperado
npx ts-node test-validate-result.ts
```

## 💡 Dicas

### Se a Similaridade Ainda For Baixa

1. **Reduzir ainda mais**: Tente 8,000 ou 6,000 caracteres
2. **Ajustar overlap**: Aumente para 1,000 se perder contexto
3. **Usar modelo maior**: `text-embedding-3-large` (mais caro)

### Monitorar Custos

- 1 documento = 75 embeddings = ~$0.0015
- 100 documentos = ~$0.15
- 1,000 documentos = ~$1.50

Ainda muito barato para a melhoria de precisão!

## 🎯 Expectativa de Resultado

Com chunks de 10k, o Chunk que contém o Art. 77 deve ter:
- **Similaridade**: 70-85% (vs 40% atual)
- **Posição**: Top 3 (vs fora do top 10 atual)
- **Precisão**: Alta - deve ser o resultado mais relevante

**Pronto para testar!** 🚀
