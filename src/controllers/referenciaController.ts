import { Request, Response } from 'express'
import { ReferenciaService } from '../services/referenciaService'
import { ZodError } from 'zod'

export class ReferenciaController {
  // Utilitário para tratamento de erros
  private static handleError(res: Response, error: any) {
    console.error('❌ Erro no controller de referências:', error)
    
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors
      })
    }
    
    if (error.code === 'PGRST116') {
      return res.status(404).json({
        success: false,
        message: 'Recurso não encontrado'
      })
    }
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }

  // Listar qualificações
  static async listarQualificacoes(req: Request, res: Response) {
    try {
      const qualificacoes = await ReferenciaService.listarQualificacoes()
      
      return res.status(200).json({
        success: true,
        message: 'Qualificações listadas com sucesso',
        data: qualificacoes
      })
    } catch (error) {
      return ReferenciaController.handleError(res, error)
    }
  }

  // Listar origens
  static async listarOrigens(req: Request, res: Response) {
    try {
      const origens = await ReferenciaService.listarOrigens()
      
      return res.status(200).json({
        success: true,
        message: 'Origens listadas com sucesso',
        data: origens
      })
    } catch (error) {
      return ReferenciaController.handleError(res, error)
    }
  }

  // Listar etapas do funil
  static async listarEtapasFunil(req: Request, res: Response) {
    try {
      const etapas = await ReferenciaService.listarEtapasFunil()
      
      return res.status(200).json({
        success: true,
        message: 'Etapas do funil listadas com sucesso',
        data: etapas
      })
    } catch (error) {
      return ReferenciaController.handleError(res, error)
    }
  }

  // Listar status de negociação
  static async listarStatusNegociacao(req: Request, res: Response) {
    try {
      const status = await ReferenciaService.listarStatusNegociacao()
      
      return res.status(200).json({
        success: true,
        message: 'Status de negociação listados com sucesso',
        data: status
      })
    } catch (error) {
      return ReferenciaController.handleError(res, error)
    }
  }

  // Listar todas as referências
  static async listarTodasReferencias(req: Request, res: Response) {
    try {
      const referencias = await ReferenciaService.listarTodasReferencias()
      
      return res.status(200).json({
        success: true,
        message: 'Todas as referências listadas com sucesso',
        data: referencias
      })
    } catch (error) {
      return ReferenciaController.handleError(res, error)
    }
  }
}