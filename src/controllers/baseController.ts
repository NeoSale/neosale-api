import { Request, Response } from 'express'
import { BaseService, CreateBaseInput, UpdateBaseInput, PaginationInput } from '../services/baseService'

export class BaseController {
  /**
   * Criar uma nova base
   * POST /api/base
   */
  static async criarBase(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente_id'] as string
      const data: CreateBaseInput = req.body

      // Validações básicas
      if (!data.nome) {
        return res.status(400).json({
          success: false,
          message: 'Nome é obrigatório',
          data: null
        })
      }

      const resultado = await BaseService.criarBase(data, clienteId)

      if (!resultado.success) {
        return res.status(404).json(resultado)
      }
      
      return res.status(201).json(resultado)
    } catch (error) {
      console.error('Erro no BaseController.criarBase:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        data: null
      })
    }
  }

  /**
   * Buscar base por ID
   * GET /api/base/:id
   */
  static async buscarPorId(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente_id'] as string
      const { id } = req.params

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID da base é obrigatório',
          data: null
        })
      }

      const resultado = await BaseService.buscarPorId(id, clienteId)
      
      if (!resultado.success) {
        return res.status(404).json(resultado)
      }

      return res.status(200).json(resultado)
    } catch (error) {
      console.error('Erro no BaseController.buscarPorId:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        data: null
      })
    }
  }

  /**
   * Listar bases com paginação
   * GET /api/base
   */
  static async listarBases(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente_id'] as string
      
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

      const resultado = await BaseService.listarComPaginacao(params, clienteId)
      
      return res.status(200).json(resultado)
    } catch (error) {
      console.error('Erro no BaseController.listarBases:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        data: null
      })
    }
  }

  /**
   * Atualizar base
   * PUT /api/base/:id
   */
  static async atualizarBase(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente_id'] as string
      const { id } = req.params
      const data: UpdateBaseInput = req.body

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID da base é obrigatório',
          data: null
        })
      }

      // Verificar se pelo menos um campo foi fornecido para atualização
      if (!data.nome && !data.descricao) {
        return res.status(400).json({
          success: false,
          message: 'Pelo menos um campo deve ser fornecido para atualização',
          data: null
        })
      }

      const resultado = await BaseService.atualizarBase(id, data, clienteId)
      
      if (!resultado.success) {
        return res.status(404).json(resultado)
      }

      return res.status(200).json(resultado)
    } catch (error) {
      console.error('Erro no BaseController.atualizarBase:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        data: null
      })
    }
  }

  /**
   * Excluir base
   * DELETE /api/base/:id
   */
  static async excluirBase(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente_id'] as string
      const { id } = req.params

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID da base é obrigatório',
          data: null
        })
      }

      const resultado = await BaseService.excluirBase(id, clienteId)
      
      if (!resultado.success) {
        return res.status(404).json(resultado)
      }

      return res.status(200).json(resultado)
    } catch (error) {
      console.error('Erro no BaseController.excluirBase:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        data: null
      })
    }
  }
}