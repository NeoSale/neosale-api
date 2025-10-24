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
 *     description: Combina busca por texto exato com busca semântica usando embeddings. Prioriza documentos que contêm os termos específicos.
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
 *               base_id:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: IDs das bases para filtrar (opcional)
 *               query:
 *                 type: string
 *                 description: Texto da consulta
 *                 example: "o que diz o art. 77 da Lei Complementar 214/2025?"
 *               search_terms:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Termos específicos para buscar (opcional, extraídos automaticamente se não fornecidos)
 *                 example: ["Art. 77", "Lei Complementar 214"]
 *               limit:
 *                 type: integer
 *                 default: 10
 *                 description: Número máximo de resultados
 *     responses:
 *       200:
 *         description: Documentos encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       nome:
 *                         type: string
 *                       nome_arquivo:
 *                         type: string
 *                       chunk_index:
 *                         type: integer
 *                       total_chunks:
 *                         type: integer
 *                       similarity:
 *                         type: number
 *                         description: Similaridade semântica (0-1)
 *                       combined_score:
 *                         type: number
 *                         description: Score combinado (texto + semântica)
 *                       text_match:
 *                         type: boolean
 *                         description: Se o documento contém o texto exato
 *                       matched_term:
 *                         type: string
 *                         description: Termo que foi encontrado no texto
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro interno do servidor
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

    // Validar search_terms se fornecido
    const searchTerms = Array.isArray(search_terms) ? search_terms : undefined

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
