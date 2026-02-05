import { Request, Response } from 'express'
import { ProspectingService } from '../services/prospectingService'
import { LeadQualificationService } from '../services/leadQualificationService'
import { SdrMayaWhatsAppService } from '../services/sdrMayaWhatsAppService'
import { ProspectingScheduler } from '../schedulers/prospectingScheduler'

export class ProspectingController {

  // ========== PROSPECTS ==========

  static async getProspects(req: Request, res: Response) {
    try {
      const cliente_id = req.headers.cliente_id as string
      const { status, setor, min_score, search, page, limit } = req.query

      if (!cliente_id) {
        return res.status(400).json({ success: false, message: 'Header cliente_id é obrigatório', data: null })
      }

      const result = await ProspectingService.getProspects({
        cliente_id,
        status: status as string,
        setor: setor as string,
        min_score: min_score ? Number(min_score) : undefined,
        search: search as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20
      })

      const statusCode = result.success ? 200 : 500
      return res.status(statusCode).json(result)
    } catch (error) {
      console.error('Erro em ProspectingController.getProspects:', error)
      return res.status(500).json({ success: false, message: 'Erro interno do servidor', data: null })
    }
  }

  static async getProspectById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const cliente_id = req.headers.cliente_id as string

      if (!cliente_id) {
        return res.status(400).json({ success: false, message: 'Header cliente_id é obrigatório', data: null })
      }

      const result = await ProspectingService.getProspectById(id)

      // Validar que o prospect pertence ao cliente
      if (result.success && result.data && result.data.cliente_id !== cliente_id) {
        return res.status(403).json({ success: false, message: 'Acesso negado', data: null })
      }

      const statusCode = result.success ? 200 : 404
      return res.status(statusCode).json(result)
    } catch (error) {
      console.error('Erro em ProspectingController.getProspectById:', error)
      return res.status(500).json({ success: false, message: 'Erro interno do servidor', data: null })
    }
  }

  static async updateProspect(req: Request, res: Response) {
    try {
      const { id } = req.params
      const cliente_id = req.headers.cliente_id as string
      const updates = req.body

      if (!cliente_id) {
        return res.status(400).json({ success: false, message: 'Header cliente_id é obrigatório', data: null })
      }

      if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({ success: false, message: 'Nenhum campo para atualizar', data: null })
      }

      // Validar que o prospect pertence ao cliente
      const prospect = await ProspectingService.getProspectById(id)
      if (prospect.success && prospect.data && prospect.data.cliente_id !== cliente_id) {
        return res.status(403).json({ success: false, message: 'Acesso negado', data: null })
      }

      const result = await ProspectingService.updateProspect(id, updates)
      const statusCode = result.success ? 200 : 404
      return res.status(statusCode).json(result)
    } catch (error) {
      console.error('Erro em ProspectingController.updateProspect:', error)
      return res.status(500).json({ success: false, message: 'Erro interno do servidor', data: null })
    }
  }

  // ========== STATS ==========

  static async getStats(req: Request, res: Response) {
    try {
      const cliente_id = req.headers.cliente_id as string

      if (!cliente_id) {
        return res.status(400).json({ success: false, message: 'Header cliente_id é obrigatório', data: null })
      }

      const result = await ProspectingService.getStats(cliente_id)
      const statusCode = result.success ? 200 : 500
      return res.status(statusCode).json(result)
    } catch (error) {
      console.error('Erro em ProspectingController.getStats:', error)
      return res.status(500).json({ success: false, message: 'Erro interno do servidor', data: null })
    }
  }

  // ========== SETORES ==========

  static async getSetores(_req: Request, res: Response) {
    try {
      const result = await ProspectingService.getActiveSetores()
      const statusCode = result.success ? 200 : 500
      return res.status(statusCode).json(result)
    } catch (error) {
      console.error('Erro em ProspectingController.getSetores:', error)
      return res.status(500).json({ success: false, message: 'Erro interno do servidor', data: null })
    }
  }

  // ========== MANUAL TRIGGERS ==========

  static async triggerProspecting(req: Request, res: Response) {
    try {
      const cliente_id = req.headers.cliente_id as string

      if (!cliente_id) {
        return res.status(400).json({ success: false, message: 'Header cliente_id é obrigatório', data: null })
      }

      const result = await ProspectingScheduler.runManualProspecting(cliente_id)
      const statusCode = result.success ? 200 : 500
      return res.status(statusCode).json(result)
    } catch (error) {
      console.error('Erro em ProspectingController.triggerProspecting:', error)
      return res.status(500).json({ success: false, message: 'Erro ao executar prospeccao', data: null })
    }
  }

  static async triggerQualification(req: Request, res: Response) {
    try {
      const result = await ProspectingScheduler.runManualQualification()
      const statusCode = result.success ? 200 : 500
      return res.status(statusCode).json(result)
    } catch (error) {
      console.error('Erro em ProspectingController.triggerQualification:', error)
      return res.status(500).json({ success: false, message: 'Erro ao executar qualificacao', data: null })
    }
  }

  // ========== SDR MAYA ==========

  static async routeToMaya(req: Request, res: Response) {
    try {
      const { id } = req.params
      const result = await SdrMayaWhatsAppService.routeToMaya(id)

      const statusCode = result.success ? 200 : 400
      return res.status(statusCode).json(result)
    } catch (error) {
      console.error('Erro em ProspectingController.routeToMaya:', error)
      return res.status(500).json({ success: false, message: 'Erro ao rotear para Maya', data: null })
    }
  }

  // ========== ACTIVITIES ==========

  static async getActivities(req: Request, res: Response) {
    try {
      const cliente_id = req.headers.cliente_id as string
      const { prospect_id, acao, limit, offset } = req.query

      if (!cliente_id) {
        return res.status(400).json({ success: false, message: 'Header cliente_id é obrigatório', data: null })
      }

      const result = await ProspectingService.getActivities(cliente_id, {
        prospect_id: prospect_id as string,
        acao: acao as string,
        limit: limit ? Number(limit) : 50,
        offset: offset ? Number(offset) : 0
      })

      const statusCode = result.success ? 200 : 500
      return res.status(statusCode).json(result)
    } catch (error) {
      console.error('Erro em ProspectingController.getActivities:', error)
      return res.status(500).json({ success: false, message: 'Erro interno do servidor', data: null })
    }
  }

  // ========== SCHEDULER ==========

  static async getSchedulerStatus(req: Request, res: Response) {
    try {
      const status = await ProspectingScheduler.getStatus()
      return res.status(200).json({ success: true, message: 'Status do scheduler', data: status })
    } catch (error) {
      console.error('Erro em ProspectingController.getSchedulerStatus:', error)
      return res.status(500).json({ success: false, message: 'Erro interno do servidor', data: null })
    }
  }

  // ========== QUALIFICATION ==========

  static async generateBrief(req: Request, res: Response) {
    try {
      const { id } = req.params
      const result = await LeadQualificationService.generateBrief(id)

      const statusCode = result.success ? 200 : 400
      return res.status(statusCode).json(result)
    } catch (error) {
      console.error('Erro em ProspectingController.generateBrief:', error)
      return res.status(500).json({ success: false, message: 'Erro ao gerar briefing', data: null })
    }
  }
}
