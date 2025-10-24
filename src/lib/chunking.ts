/**
 * Utilitários para dividir textos grandes em chunks menores
 * para melhor processamento de embeddings
 */

export interface TextChunk {
  text: string
  index: number
  startChar: number
  endChar: number
}

/**
 * Divide um texto em chunks de tamanho aproximado
 * Tenta quebrar em limites de sentenças para manter contexto
 * 
 * @param text - Texto completo para dividir
 * @param chunkSize - Tamanho aproximado de cada chunk em caracteres (padrão: 3000)
 * @param overlap - Número de caracteres de sobreposição entre chunks (padrão: 300)
 * @returns Array de chunks
 * 
 * Configuração otimizada para busca:
 * - Chunks menores (3k) = busca mais precisa
 * - Overlap de 10% = mantém contexto entre chunks
 * - Quebra em sentenças = preserva significado
 */
export function splitTextIntoChunks(
  text: string,
  chunkSize: number = 3000,
  overlap: number = 300
): TextChunk[] {
  if (!text || text.length === 0) {
    return []
  }

  // Se o texto é menor que o chunk size, retornar como único chunk
  if (text.length <= chunkSize) {
    return [{
      text: text,
      index: 0,
      startChar: 0,
      endChar: text.length
    }]
  }

  const chunks: TextChunk[] = []
  let startPos = 0
  let chunkIndex = 0

  while (startPos < text.length) {
    let endPos = Math.min(startPos + chunkSize, text.length)

    // Se não é o último chunk, tentar quebrar em uma sentença
    if (endPos < text.length) {
      // Procurar por fim de sentença (. ! ? seguido de espaço ou quebra de linha)
      const searchText = text.substring(startPos, endPos + 200) // Buscar um pouco além
      const sentenceEndings = [
        /\.\s+/g,
        /\!\s+/g,
        /\?\s+/g,
        /\.\n/g,
        /\!\n/g,
        /\?\n/g
      ]

      let bestBreakPoint = -1
      let bestDistance = Infinity

      // Encontrar o melhor ponto de quebra
      for (const regex of sentenceEndings) {
        let match
        regex.lastIndex = 0
        while ((match = regex.exec(searchText)) !== null) {
          const breakPoint = startPos + match.index + match[0].length
          const distance = Math.abs(breakPoint - (startPos + chunkSize))
          
          if (breakPoint > startPos + chunkSize * 0.7 && // Pelo menos 70% do chunk
              breakPoint <= startPos + chunkSize * 1.3 && // No máximo 130% do chunk
              distance < bestDistance) {
            bestDistance = distance
            bestBreakPoint = breakPoint
          }
        }
      }

      // Se encontrou um bom ponto de quebra, usar
      if (bestBreakPoint > startPos) {
        endPos = bestBreakPoint
      }
    }

    // Extrair o chunk
    const chunkText = text.substring(startPos, endPos).trim()
    
    if (chunkText.length > 0) {
      chunks.push({
        text: chunkText,
        index: chunkIndex,
        startChar: startPos,
        endChar: endPos
      })
      chunkIndex++
    }

    // Próximo chunk começa com overlap
    startPos = endPos - overlap
    
    // Garantir que não ficamos presos em loop
    if (startPos >= text.length - overlap) {
      break
    }
  }

  return chunks
}

/**
 * Calcula estatísticas sobre os chunks
 */
export function getChunkingStats(chunks: TextChunk[]): {
  totalChunks: number
  avgChunkSize: number
  minChunkSize: number
  maxChunkSize: number
  totalCharacters: number
} {
  if (chunks.length === 0) {
    return {
      totalChunks: 0,
      avgChunkSize: 0,
      minChunkSize: 0,
      maxChunkSize: 0,
      totalCharacters: 0
    }
  }

  const sizes = chunks.map(c => c.text.length)
  const totalChars = sizes.reduce((sum, size) => sum + size, 0)

  return {
    totalChunks: chunks.length,
    avgChunkSize: Math.round(totalChars / chunks.length),
    minChunkSize: Math.min(...sizes),
    maxChunkSize: Math.max(...sizes),
    totalCharacters: totalChars
  }
}

/**
 * Reconstrói o texto original a partir dos chunks (para verificação)
 */
export function reconstructTextFromChunks(chunks: TextChunk[]): string {
  if (chunks.length === 0) return ''
  if (chunks.length === 1) return chunks[0].text

  // Ordenar por índice
  const sorted = [...chunks].sort((a, b) => a.index - b.index)
  
  // Juntar os chunks
  return sorted.map(c => c.text).join('\n\n')
}
