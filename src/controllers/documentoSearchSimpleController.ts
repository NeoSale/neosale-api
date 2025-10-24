import { Request, Response } from 'express'
import { supabase } from '../lib/supabase'

/**
 * Controller para busca SIMPLES de documentos (sem embeddings)
 * Use este endpoint para testar se o problema é com embeddings/OpenAI
 */

/**
 * @swagger
 * /api/documentos/search-simple:
 *   post:
 *     summary: Busca SIMPLES por texto (sem embeddings)
 *     description: Busca documentos apenas por texto, sem usar embeddings OpenAI
 *     tags: [Documentos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cliente_id
 *               - query
 *             properties:
 *               cliente_id:
 *                 type: string
 *               base_id:
 *                 type: array
 *                 items:
 *                   type: string
 *               query:
 *                 type: string
 *               limit:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Documentos encontrados
 */
export async function buscarSimples(req: Request, res: Response) {
  try {
    const { cliente_id, base_id = [], query, limit = 10 } = req.body

    console.log('🔍 BUSCA SIMPLES (sem embeddings)')
    console.log(`   Cliente: ${cliente_id}`)
    console.log(`   Base: ${base_id}`)
    console.log(`   Query: "${query}"`)

    if (!cliente_id || !query) {
      return res.status(400).json({
        success: false,
        message: 'cliente_id e query são obrigatórios'
      })
    }

    if (!supabase) {
      return res.status(500).json({
        success: false,
        message: 'Conexão com banco não disponível'
      })
    }

    // Extrair termos da query
    const terms: string[] = []
    
    // Extrair "Art. X", "Artigo X"
    const artRegex = /art\.?\s*\d+|artigo\s*\d+/gi
    const artMatches = query.match(artRegex)
    if (artMatches) {
      terms.push(...artMatches)
    }

    // Extrair "Lei X"
    const leiRegex = /lei\s+(complementar\s+)?\d+/gi
    const leiMatches = query.match(leiRegex)
    if (leiMatches) {
      terms.push(...leiMatches)
    }

    console.log(`   Termos extraídos: ${terms.join(', ') || 'nenhum'}`)

    // Se não encontrou termos específicos, usar a query inteira
    const searchTerms = terms.length > 0 ? terms : [query]

    const allResults: any[] = []

    for (const term of searchTerms) {
      // Normalizar termo
      const variations = [term]
      
      if (term.toLowerCase().includes('artigo')) {
        const num = term.match(/\d+/)
        if (num) {
          variations.push(`art. ${num[0]}`)
          variations.push(`art ${num[0]}`)
          variations.push(`Art. ${num[0]}`)
        }
      } else if (term.match(/^art\.?\s*\d+/i)) {
        const num = term.match(/\d+/)
        if (num) {
          variations.push(`art. ${num[0]}`)
          variations.push(`art ${num[0]}`)
          variations.push(`artigo ${num[0]}`)
          variations.push(`Art. ${num[0]}`)
        }
      }

      console.log(`   Buscando variações: ${variations.join(', ')}`)

      for (const variant of variations) {
        let queryBuilder = supabase
          .from('documentos')
          .select('id, nome, descricao, nome_arquivo, chunk_texto, chunk_index, total_chunks, documento_pai_id, base_id, created_at')
          .eq('cliente_id', cliente_id)
          .eq('deletado', false)
          .ilike('chunk_texto', `%${variant}%`)
          .limit(20)

        const { data, error } = await queryBuilder

        if (error) {
          console.error(`   ❌ Erro ao buscar "${variant}":`, error)
          continue
        }

        console.log(`   Encontrados ${data?.length || 0} docs com "${variant}"`)

        if (data && data.length > 0) {
          // Filtrar por base_id se fornecido
          const filtered = Array.isArray(base_id) && base_id.length > 0
            ? data.filter(d => {
                const docBaseIds = Array.isArray(d.base_id) ? d.base_id : []
                return base_id.some((bid: string) => docBaseIds.includes(bid))
              })
            : data

          console.log(`   Após filtro base_id: ${filtered.length} docs`)

          // Adicionar aos resultados (evitar duplicatas)
          for (const doc of filtered) {
            if (!allResults.some(r => r.id === doc.id)) {
              allResults.push({
                ...doc,
                chunk_texto: doc.chunk_texto ? doc.chunk_texto.substring(0, 500) : null,
                matched_term: term
              })
            }
          }
        }
      }
    }

    // Ordenar por chunk_index
    allResults.sort((a, b) => (a.chunk_index || 0) - (b.chunk_index || 0))

    // Limitar resultados
    const finalResults = allResults.slice(0, limit)

    console.log(`✅ Total de resultados: ${finalResults.length}`)

    return res.status(200).json({
      success: true,
      data: finalResults,
      message: `${finalResults.length} documento(s) encontrado(s)`,
      debug: {
        termos_extraidos: terms,
        total_antes_limit: allResults.length
      }
    })

  } catch (error: any) {
    console.error('❌ Erro na busca simples:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Erro ao buscar documentos'
    })
  }
}
