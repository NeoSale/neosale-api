import { supabase } from '../lib/supabase'
import { generateOpenAIEmbedding } from '../lib/openai'

/**
 * Service para busca híbrida de documentos (texto + semântica)
 */
export class DocumentoSearchService {
  
  /**
   * Busca híbrida: combina busca por texto com busca semântica
   * Prioriza documentos que contêm o texto exato
   */
  static async buscarHibrido(
    clienteId: string,
    baseIds: string[],
    queryText: string,
    searchTerms?: string[],  // Termos específicos para buscar (ex: ["Art. 77"])
    limit: number = 10
  ) {
    try {
      if (!supabase) {
        throw new Error('Conexão com Supabase não estabelecida')
      }

      console.log('🔍 Iniciando busca híbrida...')
      console.log(`   Query: "${queryText}"`)
      if (searchTerms && searchTerms.length > 0) {
        console.log(`   Termos específicos: ${searchTerms.join(', ')}`)
      }

      // 1. Gerar embedding da consulta
      console.log('⏳ Gerando embedding...')
      const startEmb = Date.now()
      const queryEmbedding = await generateOpenAIEmbedding(queryText)
      console.log(`✅ Embedding gerado em ${Date.now() - startEmb}ms`)

      // 2. Extrair termos específicos automaticamente se não fornecidos
      if (!searchTerms || searchTerms.length === 0) {
        searchTerms = this.extractSpecificTerms(queryText)
      }

      // 3. Buscar por texto primeiro (se houver termos específicos)
      let textResults: any[] = []
      if (searchTerms && searchTerms.length > 0) {
        console.log('📝 Buscando por texto...')
        
        for (const term of searchTerms) {
          const { data, error } = await supabase
            .from('documentos')
            .select('*')
            .eq('cliente_id', clienteId)
            .ilike('chunk_texto', `%${term}%`)
            .eq('deletado', false)
            .limit(20)  // Buscar até 20 matches por termo

          if (!error && data) {
            // Filtrar por base_id se fornecido
            const filtered = baseIds.length > 0
              ? data.filter(d => {
                  const docBaseIds = Array.isArray(d.base_id) ? d.base_id : []
                  return baseIds.some(bid => docBaseIds.includes(bid))
                })
              : data

            // Calcular similaridade para cada resultado
            for (const doc of filtered) {
              let embedding = doc.embedding
              
              // Parse embedding se estiver como string
              if (typeof embedding === 'string') {
                try {
                  embedding = JSON.parse(embedding)
                } catch (e) {
                  console.warn(`Erro ao fazer parse do embedding do doc ${doc.id}`)
                  continue
                }
              }
              
              if (embedding && Array.isArray(embedding)) {
                const similarity = this.calculateCosineSimilarity(
                  queryEmbedding,
                  embedding
                )
                textResults.push({
                  ...doc,
                  similarity,
                  text_match: true,
                  matched_term: term,
                  combined_score: 1.0 + (similarity * 0.5)  // Boost para text match
                })
              }
            }
          }
        }

        console.log(`✅ Encontrados ${textResults.length} resultados por texto`)
      }

      // 4. Buscar por semântica (complementar)
      console.log('🧠 Buscando por similaridade semântica...')
      const { data: semanticData, error: semanticError } = await supabase
        .from('documentos')
        .select('*')
        .eq('cliente_id', clienteId)
        .eq('deletado', false)
        .not('embedding', 'is', null)
        .limit(limit * 3)  // Buscar mais para ter opções

      if (semanticError) {
        console.error('Erro na busca semântica:', semanticError)
      }

      let semanticResults: any[] = []
      if (semanticData) {
        // Filtrar por base_id
        const filtered = baseIds.length > 0
          ? semanticData.filter(d => {
              const docBaseIds = Array.isArray(d.base_id) ? d.base_id : []
              return baseIds.some(bid => docBaseIds.includes(bid))
            })
          : semanticData

        // Calcular similaridade e excluir os que já estão em textResults
        const textResultIds = new Set(textResults.map(r => r.id))
        
        for (const doc of filtered) {
          if (!textResultIds.has(doc.id)) {
            let embedding = doc.embedding
            
            // Parse embedding se estiver como string
            if (typeof embedding === 'string') {
              try {
                embedding = JSON.parse(embedding)
              } catch (e) {
                continue
              }
            }
            
            if (embedding && Array.isArray(embedding)) {
              const similarity = this.calculateCosineSimilarity(
                queryEmbedding,
                embedding
              )
              semanticResults.push({
                ...doc,
                similarity,
                text_match: false,
                combined_score: similarity * 0.5  // Sem boost
              })
            }
          }
        }

        // Ordenar por similaridade
        semanticResults.sort((a, b) => b.similarity - a.similarity)
        semanticResults = semanticResults.slice(0, limit * 2)
        
        console.log(`✅ Encontrados ${semanticResults.length} resultados semânticos`)
      }

      // 5. Combinar resultados: text matches primeiro, depois semântica
      const allResults = [...textResults, ...semanticResults]
      
      // Ordenar por combined_score
      allResults.sort((a, b) => b.combined_score - a.combined_score)
      
      // Limitar ao número solicitado
      const finalResults = allResults.slice(0, limit)

      console.log(`✅ Total: ${finalResults.length} resultados`)

      return {
        success: true,
        data: finalResults.map(r => ({
          id: r.id,
          nome: r.nome,
          descricao: r.descricao,
          nome_arquivo: r.nome_arquivo,
          chunk_index: r.chunk_index,
          total_chunks: r.total_chunks,
          documento_pai_id: r.documento_pai_id,
          chunk_texto: r.chunk_texto ? r.chunk_texto.substring(0, 500) : null,
          similarity: r.similarity,
          combined_score: r.combined_score,
          text_match: r.text_match,
          matched_term: r.matched_term,
          created_at: r.created_at
        })),
        message: `${finalResults.length} documento(s) encontrado(s)`
      }

    } catch (error: any) {
      console.error('Erro na busca híbrida:', error)
      return {
        success: false,
        message: error.message || 'Erro ao buscar documentos',
        data: null,
        error: 'SEARCH_ERROR'
      }
    }
  }

  /**
   * Extrai termos específicos da query (artigos, números, etc)
   */
  private static extractSpecificTerms(query: string): string[] {
    const terms: string[] = []
    
    // Extrair "Art. X", "Artigo X", "art X"
    const artRegex = /art\.?\s*\d+|artigo\s*\d+/gi
    const artMatches = query.match(artRegex)
    if (artMatches) {
      terms.push(...artMatches)
    }

    // Extrair "Lei X", "Lei Complementar X"
    const leiRegex = /lei\s+(complementar\s+)?\d+/gi
    const leiMatches = query.match(leiRegex)
    if (leiMatches) {
      terms.push(...leiMatches)
    }

    return terms
  }

  /**
   * Calcula similaridade de cosseno entre dois embeddings
   */
  private static calculateCosineSimilarity(emb1: number[], emb2: number[]): number {
    if (emb1.length !== emb2.length) {
      return 0
    }

    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0

    for (let i = 0; i < emb1.length; i++) {
      dotProduct += emb1[i] * emb2[i]
      norm1 += emb1[i] * emb1[i]
      norm2 += emb2[i] * emb2[i]
    }

    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2)
    return denominator === 0 ? 0 : dotProduct / denominator
  }
}
