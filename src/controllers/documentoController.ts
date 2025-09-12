import { Request, Response } from 'express'
import { DocumentoService, CreateDocumentoInput, UpdateDocumentoInput, PaginationInput } from '../services/documentoService'

export class DocumentoController {
  /**
   * Criar um novo documento
   * POST /api/documentos
   */
  static async criarDocumento(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente-id'] as string
      const data: CreateDocumentoInput = req.body

      // Validações básicas
      if (!data.nome || !data.nome_arquivo) {
        return res.status(400).json({
          success: false,
          message: 'Nome e nome_arquivo são obrigatórios',
          data: null
        })
      }

      const resultado = await DocumentoService.criarDocumento(data, clienteId)
      
      return res.status(201).json(resultado)
    } catch (error) {
      console.error('Erro no DocumentoController.criarDocumento:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        data: null
      })
    }
  }

  /**
   * Buscar documento por ID
   * GET /api/documentos/:id
   */
  static async buscarPorId(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente-id'] as string
      const { id } = req.params

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID do documento é obrigatório',
          data: null
        })
      }

      const resultado = await DocumentoService.buscarPorId(id, clienteId)
      
      if (!resultado.success) {
        return res.status(404).json(resultado)
      }

      return res.status(200).json(resultado)
    } catch (error) {
      console.error('Erro no DocumentoController.buscarPorId:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        data: null
      })
    }
  }

  /**
   * Listar documentos com paginação
   * GET /api/documentos
   */
  static async listarDocumentos(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente-id'] as string
      
      const params: PaginationInput = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string
      }

      // Validar parâmetros de paginação
      if (params.page && params.page < 1) {
        return res.status(400).json({
          success: false,
          message: 'Página deve ser maior que 0',
          data: null
        })
      }

      if (params.limit && (params.limit < 1 || params.limit > 100)) {
        return res.status(400).json({
          success: false,
          message: 'Limite deve estar entre 1 e 100',
          data: null
        })
      }

      const resultado = await DocumentoService.listarComPaginacao(params, clienteId)
      
      return res.status(200).json(resultado)
    } catch (error) {
      console.error('Erro no DocumentoController.listarDocumentos:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        data: null
      })
    }
  }

  /**
   * Atualizar documento
   * PUT /api/documentos/:id
   */
  static async atualizarDocumento(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente-id'] as string
      const { id } = req.params
      const data: UpdateDocumentoInput = req.body

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID do documento é obrigatório',
          data: null
        })
      }

      // Verificar se pelo menos um campo foi fornecido para atualização
      if (!data.nome && !data.descricao && !data.nome_arquivo) {
        return res.status(400).json({
          success: false,
          message: 'Pelo menos um campo deve ser fornecido para atualização',
          data: null
        })
      }

      const resultado = await DocumentoService.atualizarDocumento(id, data, clienteId)
      
      if (!resultado.success) {
        return res.status(404).json(resultado)
      }

      return res.status(200).json(resultado)
    } catch (error) {
      console.error('Erro no DocumentoController.atualizarDocumento:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        data: null
      })
    }
  }

  /**
   * Excluir documento
   * DELETE /api/documentos/:id
   */
  static async excluirDocumento(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente-id'] as string
      const { id } = req.params

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID do documento é obrigatório',
          data: null
        })
      }

      const resultado = await DocumentoService.excluirDocumento(id, clienteId)
      
      if (!resultado.success) {
        return res.status(404).json(resultado)
      }

      return res.status(200).json(resultado)
    } catch (error) {
      console.error('Erro no DocumentoController.excluirDocumento:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        data: null
      })
    }
  }

  /**
   * Buscar documentos por similaridade
   * POST /api/documentos/buscar-similares
   */
  static async buscarSimilares(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente-id'] as string
      const { texto, limite } = req.body

      if (!texto) {
        return res.status(400).json({
          success: false,
          message: 'Texto para busca é obrigatório',
          data: null
        })
      }

      const limiteValidado = limite && limite > 0 && limite <= 50 ? limite : 5

      const resultado = await DocumentoService.buscarPorSimilaridade(texto, clienteId, limiteValidado)
      
      return res.status(200).json(resultado)
    } catch (error) {
      console.error('Erro no DocumentoController.buscarSimilares:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        data: null
      })
    }
  }
}