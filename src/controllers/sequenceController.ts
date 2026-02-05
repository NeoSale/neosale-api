import { Request, Response } from 'express'
import { ProspectingService } from '../services/prospectingService'

export class SequenceController {

  static async getSequences(req: Request, res: Response) {
    try {
      const clienteId = req.headers.cliente_id as string | undefined
      const result = await ProspectingService.getSequences(clienteId)
      return res.status(200).json(result)
    } catch (error) {
      console.error('Erro em SequenceController.getSequences:', error)
      return res.status(500).json({ success: false, message: 'Erro interno do servidor', data: null })
    }
  }

  static async getSequenceById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const clienteId = req.headers.cliente_id as string
      if (!clienteId) {
        return res.status(400).json({ success: false, message: 'Header cliente_id e obrigatorio', data: null })
      }

      const result = await ProspectingService.getSequenceById(clienteId, id)
      const statusCode = result.success ? 200 : 404
      return res.status(statusCode).json(result)
    } catch (error) {
      console.error('Erro em SequenceController.getSequenceById:', error)
      return res.status(500).json({ success: false, message: 'Erro interno do servidor', data: null })
    }
  }

  static async createSequence(req: Request, res: Response) {
    try {
      const clienteId = req.headers.cliente_id as string
      if (!clienteId) {
        return res.status(400).json({ success: false, message: 'Header cliente_id e obrigatorio', data: null })
      }

      const { name, setor, tipo, messages, is_active } = req.body

      if (!name || !setor || !tipo) {
        return res.status(400).json({
          success: false,
          message: 'Campos obrigatorios: name, setor, tipo',
          data: null
        })
      }

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Pelo menos uma mensagem e obrigatoria',
          data: null
        })
      }

      const result = await ProspectingService.createSequence(clienteId, {
        name,
        setor,
        tipo,
        messages,
        is_active
      })

      const statusCode = result.success ? 201 : 400
      return res.status(statusCode).json(result)
    } catch (error) {
      console.error('Erro em SequenceController.createSequence:', error)
      return res.status(500).json({ success: false, message: 'Erro interno do servidor', data: null })
    }
  }

  static async updateSequence(req: Request, res: Response) {
    try {
      const { id } = req.params
      const clienteId = req.headers.cliente_id as string
      if (!clienteId) {
        return res.status(400).json({ success: false, message: 'Header cliente_id e obrigatorio', data: null })
      }

      const updates = req.body

      if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum campo para atualizar',
          data: null
        })
      }

      const result = await ProspectingService.updateSequence(clienteId, id, updates)
      const statusCode = result.success ? 200 : 404
      return res.status(statusCode).json(result)
    } catch (error) {
      console.error('Erro em SequenceController.updateSequence:', error)
      return res.status(500).json({ success: false, message: 'Erro interno do servidor', data: null })
    }
  }

  static async deleteSequence(req: Request, res: Response) {
    try {
      const { id } = req.params
      const clienteId = req.headers.cliente_id as string
      if (!clienteId) {
        return res.status(400).json({ success: false, message: 'Header cliente_id e obrigatorio', data: null })
      }

      const result = await ProspectingService.deleteSequence(clienteId, id)
      const statusCode = result.success ? 200 : 404
      return res.status(statusCode).json(result)
    } catch (error) {
      console.error('Erro em SequenceController.deleteSequence:', error)
      return res.status(500).json({ success: false, message: 'Erro interno do servidor', data: null })
    }
  }
}
