import { Request, Response } from 'express'
import { FollowupService } from '../services/followupService'
import { createFollowupSchema, updateFollowupSchema, idParamSchema, paginationSchema } from '../lib/validators'

export class FollowupController {
  // Listar followups com paginação
  static async listar(req: Request, res: Response): Promise<Response> {
    try {
      const params = paginationSchema.parse(req.query)
      const result = await FollowupService.listarTodos(params)
      
      return res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      })
    } catch (error: any) {
      console.error('❌ Erro no controller ao listar followups:', error)
      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao listar followups'
      })
    }
  }

  // Buscar followup por ID
  static async buscarPorId(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = idParamSchema.parse(req.params)
      const followup = await FollowupService.buscarPorId(id)
      
      return res.json({
        success: true,
        data: followup
      })
    } catch (error: any) {
      console.error('❌ Erro no controller ao buscar followup:', error)
      return res.status(404).json({
        success: false,
        error: error.message || 'Followup não encontrado'
      })
    }
  }

  // Buscar followups por lead
  static async buscarPorLead(req: Request, res: Response): Promise<Response> {
    try {
      const { leadId } = req.params
      const followups = await FollowupService.buscarPorLead(leadId)
      
      return res.json({
        success: true,
        data: followups
      })
    } catch (error: any) {
      console.error('❌ Erro no controller ao buscar followups por lead:', error)
      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao buscar followups do lead'
      })
    }
  }

  // Criar novo followup
  static async criar(req: Request, res: Response): Promise<Response> {
    try {
      const data = createFollowupSchema.parse(req.body)
      const followup = await FollowupService.criar(data)
      
      return res.status(201).json({
        success: true,
        data: followup,
        message: 'Followup criado com sucesso'
      })
    } catch (error: any) {
      console.error('❌ Erro no controller ao criar followup:', error)
      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao criar followup'
      })
    }
  }

  // Atualizar followup
  static async atualizar(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = idParamSchema.parse(req.params)
      const data = updateFollowupSchema.parse(req.body)
      const followup = await FollowupService.atualizar(id, data)
      
      return res.json({
        success: true,
        data: followup,
        message: 'Followup atualizado com sucesso'
      })
    } catch (error: any) {
      console.error('❌ Erro no controller ao atualizar followup:', error)
      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao atualizar followup'
      })
    }
  }

  // Deletar followup
  static async deletar(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = idParamSchema.parse(req.params)
      const result = await FollowupService.deletar(id)
      
      return res.json({
        success: true,
        message: result.message
      })
    } catch (error: any) {
      console.error('❌ Erro no controller ao deletar followup:', error)
      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao deletar followup'
      })
    }
  }

  // Buscar followups por status
  static async buscarPorStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { status } = req.params
      
      if (status !== 'sucesso' && status !== 'erro') {
        return res.status(400).json({
          success: false,
          error: 'Status deve ser "sucesso" ou "erro"'
        })
      }
      
      const followups = await FollowupService.buscarPorStatus(status)
      
      return res.json({
        success: true,
        data: followups
      })
    } catch (error: any) {
      console.error('❌ Erro no controller ao buscar followups por status:', error)
      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao buscar followups por status'
      })
    }
  }

  // Buscar followups com embedding
  static async buscarComEmbedding(req: Request, res: Response): Promise<Response> {
    try {
      const followups = await FollowupService.buscarComEmbedding()
      
      return res.json({
        success: true,
        data: followups
      })
    } catch (error: any) {
      console.error('❌ Erro no controller ao buscar followups com embedding:', error)
      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao buscar followups com embedding'
      })
    }
  }
}