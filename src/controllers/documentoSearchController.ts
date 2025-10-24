import { Request, Response } from 'express'
import { DocumentoSearchService } from '../services/documentoSearchService'

/**
 * Controller para busca híbrida de documentos
 */

/**
 * @swagger
 * /api/documentos/search:
 *   post:
 *     summary: Busca híbrida de documentos (texto + semântica)
 *     description: |
 *       Combina busca por texto exato com busca semântica usando embeddings OpenAI.
 *       
 *       **Como funciona:**
 *       1. Se `search_terms` for fornecido, busca chunks que contêm esse termo exato
 *       2. Se não for fornecido, extrai automaticamente termos da query (Art. X, Lei X, etc)
 *       3. Complementa com busca semântica para encontrar documentos similares
 *       4. Documentos com match de texto recebem score boost (1.0-1.5 vs 0-0.5)
 *       
 *       **Exemplo de uso:**
 *       - Query: "o que diz o art. 77?"
 *       - search_terms: "Art. 77" (opcional)
 *       - Resultado: Chunk com "Art. 77" aparece em 1º lugar
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
 *                 format: uuid
 *                 description: ID do cliente
 *                 example: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *               base_id:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: IDs das bases para filtrar (opcional)
 *                 example: ["1b87c1a9-ced5-4760-98ef-6a97e464cd24"]
 *               query:
 *                 type: string
 *                 description: Texto da consulta (obrigatório)
 *                 example: "o que diz o art. 77 da Lei Complementar 214/2025?"
 *               search_terms:
 *                 type: string
 *                 description: |
 *                   Termo específico para buscar no texto dos documentos (opcional).
 *                   Se não fornecido, o sistema extrai automaticamente da query.
 *                   Aceita apenas uma string (não array).
 *                 example: "Art. 77"
 *               limit:
 *                 type: integer
 *                 default: 10
 *                 minimum: 1
 *                 maximum: 100
 *                 description: Número máximo de resultados (1-100)
 *                 example: 10
 *           examples:
 *             comTermoEspecifico:
 *               summary: Busca com termo específico
 *               value:
 *                 cliente_id: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *                 base_id: ["1b87c1a9-ced5-4760-98ef-6a97e464cd24"]
 *                 query: "o que diz o art. 77?"
 *                 search_terms: "Art. 77"
 *                 limit: 10
 *             semTermo:
 *               summary: Busca com extração automática
 *               value:
 *                 cliente_id: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *                 base_id: ["1b87c1a9-ced5-4760-98ef-6a97e464cd24"]
 *                 query: "o que diz o art. 77?"
 *                 limit: 10
 *     responses:
 *       200:
 *         description: Documentos encontrados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "10 documento(s) encontrado(s)"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "fa435ec8-4895-4097-8a50-9aa21f6784ce"
 *                       nome:
 *                         type: string
 *                         example: "ref (Parte 12)"
 *                       descricao:
 *                         type: string
 *                       nome_arquivo:
 *                         type: string
 *                         example: "Lei Complementar 214_2025.pdf"
 *                       chunk_index:
 *                         type: integer
 *                         description: Índice do chunk (0-based)
 *                         example: 11
 *                       total_chunks:
 *                         type: integer
 *                         description: Total de chunks do documento
 *                         example: 80
 *                       documento_pai_id:
 *                         type: string
 *                         description: ID do documento pai (se for um chunk)
 *                       chunk_texto:
 *                         type: string
 *                         description: Primeiros 500 caracteres do chunk
 *                         example: "Art. 77. As diferenças percentuais..."
 *                       similarity:
 *                         type: number
 *                         description: Similaridade semântica (0-1)
 *                         example: 0.41
 *                       combined_score:
 *                         type: number
 *                         description: Score combinado (texto + semântica). Text matches = 1.0-1.5, semântica = 0-0.5
 *                         example: 1.205
 *                       text_match:
 *                         type: boolean
 *                         description: Se o documento contém o texto exato buscado
 *                         example: true
 *                       matched_term:
 *                         type: string
 *                         description: Termo que foi encontrado no texto
 *                         example: "art. 77"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *             examples:
 *               success:
 *                 summary: Busca bem-sucedida
 *                 value:
 *                   success: true
 *                   message: "10 documento(s) encontrado(s)"
 *                   data:
 *                     - id: "fa435ec8-4895-4097-8a50-9aa21f6784ce"
 *                       nome: "ref (Parte 12)"
 *                       nome_arquivo: "Lei Complementar 214_2025.pdf"
 *                       chunk_index: 11
 *                       total_chunks: 80
 *                       chunk_texto: "Art. 77. As diferenças percentuais..."
 *                       similarity: 0.41
 *                       combined_score: 1.205
 *                       text_match: true
 *                       matched_term: "art. 77"
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "query é obrigatória e deve ser uma string não vazia"
 *                 error:
 *                   type: string
 *                   example: "VALIDATION_ERROR"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Erro interno ao buscar documentos"
 *                 error:
 *                   type: string
 *                   example: "INTERNAL_ERROR"
 */
export async function buscarDocumentos(req: Request, res: Response) {
  try {
    const { cliente_id, base_id = [], query, search_terms, limit = 10 } = req.body

    // Validações
    if (!cliente_id) {
      return res.status(400).json({
        success: false,
        message: 'cliente_id é obrigatório',
        error: 'VALIDATION_ERROR'
      })
    }

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'query é obrigatória e deve ser uma string não vazia',
        error: 'VALIDATION_ERROR'
      })
    }

    // Validar base_id se fornecido
    const baseIds = Array.isArray(base_id) ? base_id : []

    // Validar search_terms se fornecido - converter string para array
    const searchTerms = search_terms && typeof search_terms === 'string' && search_terms.trim().length > 0
      ? [search_terms.trim()]
      : undefined

    // Validar limit
    const limitNum = typeof limit === 'number' ? Math.min(Math.max(limit, 1), 100) : 10

    // Executar busca híbrida
    const result = await DocumentoSearchService.buscarHibrido(
      cliente_id,
      baseIds,
      query.trim(),
      searchTerms,
      limitNum
    )

    if (!result.success) {
      return res.status(400).json(result)
    }

    return res.status(200).json(result)

  } catch (error: any) {
    console.error('Erro no documentoSearchController.buscarDocumentos:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao buscar documentos',
      error: 'INTERNAL_ERROR'
    })
  }
}
