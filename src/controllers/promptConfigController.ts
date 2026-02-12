import { Request, Response } from 'express'
import { PromptConfigService } from '../services/promptConfigService'
import { upsertPromptConfigSchema } from '../lib/validators'

export class PromptConfigController {
  static async getAll(req: Request, res: Response) {
    try {
      const clienteId = req.headers.cliente_id as string
      if (!clienteId) {
        return res.status(400).json({ success: false, message: 'cliente_id is required' })
      }

      const configs = await PromptConfigService.getAllByClienteId(clienteId)

      return res.status(200).json({ success: true, data: configs })
    } catch (error) {
      console.error('Error fetching prompt configs:', error)
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  static async getByContext(req: Request, res: Response) {
    try {
      const clienteId = req.headers.cliente_id as string
      if (!clienteId) {
        return res.status(400).json({ success: false, message: 'cliente_id is required' })
      }

      const { context } = req.params

      const config = await PromptConfigService.getByContext(clienteId, context)

      // Also fetch default prompt if no custom config
      let defaultPrompt: string | undefined
      if (!config) {
        defaultPrompt = await PromptConfigService.getPromptOrDefault(clienteId, context)
      }

      return res.status(200).json({
        success: true,
        data: config,
        defaultPrompt: !config ? defaultPrompt : undefined,
      })
    } catch (error) {
      console.error('Error fetching prompt config:', error)
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  static async upsert(req: Request, res: Response) {
    try {
      const clienteId = req.headers.cliente_id as string
      if (!clienteId) {
        return res.status(400).json({ success: false, message: 'cliente_id is required' })
      }

      const { context } = req.params
      const validation = upsertPromptConfigSchema.safeParse(req.body)
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: validation.error.errors,
        })
      }

      const config = await PromptConfigService.upsert(
        clienteId,
        context,
        validation.data.prompt,
        validation.data.changed_by
      )

      return res.status(200).json({
        success: true,
        data: config,
        message: 'Prompt updated successfully',
      })
    } catch (error) {
      console.error('Error upserting prompt config:', error)
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const clienteId = req.headers.cliente_id as string
      if (!clienteId) {
        return res.status(400).json({ success: false, message: 'cliente_id is required' })
      }

      const { context } = req.params

      await PromptConfigService.delete(clienteId, context)

      return res.status(200).json({
        success: true,
        message: 'Prompt config deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting prompt config:', error)
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  static async getHistory(req: Request, res: Response) {
    try {
      const clienteId = req.headers.cliente_id as string
      if (!clienteId) {
        return res.status(400).json({ success: false, message: 'cliente_id is required' })
      }

      const { context } = req.params

      const history = await PromptConfigService.getHistory(clienteId, context)

      return res.status(200).json({ success: true, data: history })
    } catch (error) {
      console.error('Error fetching prompt history:', error)
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}
