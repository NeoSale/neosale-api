import OpenAI from 'openai'

// Inicializar cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
})

/**
 * Gera embedding usando a API da OpenAI
 * @param text - Texto para gerar o embedding
 * @param model - Modelo a ser usado (padrão: text-embedding-3-small)
 * @returns Array de números representando o embedding (1536 dimensões)
 */
export async function generateOpenAIEmbedding(
  text: string,
  model: string = 'text-embedding-3-small'
): Promise<number[]> {
  try {
    // Limitar o texto para evitar exceder o limite de tokens
    // text-embedding-3-small suporta até 8191 tokens
    // Aproximadamente 1 token = 3.5 caracteres em português (mais tokens que inglês)
    const maxChars = 24000 // ~6857 tokens, deixando margem de segurança
    const truncatedText = text.length > maxChars ? text.substring(0, maxChars) : text

    if (text.length > maxChars) {
      console.warn(`Texto truncado de ${text.length} para ${maxChars} caracteres para embedding`)
    }

    const response = await openai.embeddings.create({
      model: model,
      input: truncatedText,
      encoding_format: 'float'
    })

    return response.data[0].embedding
  } catch (error: any) {
    console.error('Erro ao gerar embedding com OpenAI:', error)
    
    // Se for erro de API key, lançar erro específico
    if (error?.status === 401) {
      throw new Error('API Key da OpenAI inválida ou não configurada. Configure a variável de ambiente NEXT_PUBLIC_OPENAI_API_KEY.')
    }
    
    // Se for erro de limite de tokens
    if (error?.code === 'context_length_exceeded') {
      throw new Error('Texto muito longo para gerar embedding. Reduza o tamanho do documento.')
    }
    
    throw new Error(`Erro ao gerar embedding: ${error?.message || 'Erro desconhecido'}`)
  }
}

/**
 * Gera embeddings para múltiplos textos em batch
 * @param texts - Array de textos para gerar embeddings
 * @param model - Modelo a ser usado
 * @returns Array de embeddings
 */
export async function generateOpenAIEmbeddingsBatch(
  texts: string[],
  model: string = 'text-embedding-3-small'
): Promise<number[][]> {
  try {
    // OpenAI permite até 2048 inputs por request
    const maxBatchSize = 2048
    
    if (texts.length > maxBatchSize) {
      // Dividir em batches menores
      const batches: number[][][] = []
      for (let i = 0; i < texts.length; i += maxBatchSize) {
        const batch = texts.slice(i, i + maxBatchSize)
        const batchEmbeddings = await generateOpenAIEmbeddingsBatch(batch, model)
        batches.push(batchEmbeddings)
      }
      return batches.flat()
    }

    const response = await openai.embeddings.create({
      model: model,
      input: texts,
      encoding_format: 'float'
    })

    return response.data.map(item => item.embedding)
  } catch (error: any) {
    console.error('Erro ao gerar embeddings em batch com OpenAI:', error)
    throw new Error(`Erro ao gerar embeddings em batch: ${error?.message || 'Erro desconhecido'}`)
  }
}

export { openai }
