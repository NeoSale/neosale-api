import { Request, Response } from 'express'
import { DistributionReportService } from '../services/distributionReportService'

/**
 * Controller for distribution report endpoints
 */
export class DistributionReportController {
  /**
   * Get distribution report for a period
   * GET /api/relatorios/distribuicao
   */
  static async getReport(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente_id'] as string
      const { start_date, end_date } = req.query

      if (!clienteId) {
        return res.status(400).json({ error: 'cliente_id header is required' })
      }

      if (!start_date || !end_date) {
        return res.status(400).json({ error: 'start_date and end_date are required' })
      }

      const report = await DistributionReportService.getReport(
        clienteId,
        start_date as string,
        end_date as string
      )

      return res.json(report)
    } catch (error) {
      console.error('Error getting distribution report:', error)
      return res.status(500).json({ error: 'Failed to get distribution report' })
    }
  }

  /**
   * Get lead assignments with pagination
   * GET /api/leads/atribuicoes
   */
  static async getAssignments(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente_id'] as string
      const { vendedor_id, status, data_inicio, data_fim, page, limit } = req.query

      if (!clienteId) {
        return res.status(400).json({ error: 'cliente_id header is required' })
      }

      const filters: {
        vendedorId?: string
        status?: string
        startDate?: string
        endDate?: string
        page?: number
        limit?: number
      } = {}

      if (vendedor_id) filters.vendedorId = vendedor_id as string
      if (status) filters.status = status as string
      if (data_inicio) filters.startDate = data_inicio as string
      if (data_fim) filters.endDate = data_fim as string
      if (page) filters.page = parseInt(page as string)
      if (limit) filters.limit = parseInt(limit as string)

      const result = await DistributionReportService.getAssignments(clienteId, filters)

      return res.json(result)
    } catch (error) {
      console.error('Error getting assignments:', error)
      return res.status(500).json({ error: 'Failed to get assignments' })
    }
  }
}
