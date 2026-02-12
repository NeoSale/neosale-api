import { Request, Response } from 'express'
import { LlmConfigService } from '../services/llmConfigService'
import { LlmProviderFactory } from '../services/llmProviderService'
import { createLlmConfigSchema, updateLlmConfigSchema, testLlmConnectionSchema } from '../lib/validators'

export class LlmConfigController {
  static async get(req: Request, res: Response) {
    try {
      const clienteId = req.headers.cliente_id as string
      if (!clienteId) {
        return res.status(400).json({ success: false, message: 'cliente_id is required' })
      }

      const config = await LlmConfigService.getByClienteId(clienteId)

      return res.status(200).json({
        success: true,
        data: config ? { ...config, api_key: maskApiKey(config.api_key) } : null
      })
    } catch (error) {
      console.error('Error fetching LLM config:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const clienteId = req.headers.cliente_id as string
      if (!clienteId) {
        return res.status(400).json({ success: false, message: 'cliente_id is required' })
      }

      const validation = createLlmConfigSchema.safeParse(req.body)
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: validation.error.errors
        })
      }

      const config = await LlmConfigService.create(clienteId, validation.data)

      return res.status(201).json({
        success: true,
        data: { ...config, api_key: maskApiKey(config.api_key) },
        message: 'LLM configuration created successfully'
      })
    } catch (error) {
      console.error('Error creating LLM config:', error)
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const clienteId = req.headers.cliente_id as string
      if (!clienteId) {
        return res.status(400).json({ success: false, message: 'cliente_id is required' })
      }

      const validation = updateLlmConfigSchema.safeParse(req.body)
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: validation.error.errors
        })
      }

      const config = await LlmConfigService.update(clienteId, validation.data)

      return res.status(200).json({
        success: true,
        data: { ...config, api_key: maskApiKey(config.api_key) },
        message: 'LLM configuration updated successfully'
      })
    } catch (error) {
      console.error('Error updating LLM config:', error)
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const clienteId = req.headers.cliente_id as string
      if (!clienteId) {
        return res.status(400).json({ success: false, message: 'cliente_id is required' })
      }

      await LlmConfigService.delete(clienteId)

      return res.status(200).json({
        success: true,
        message: 'LLM configuration deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting LLM config:', error)
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  static async test(req: Request, res: Response) {
    try {
      const validation = testLlmConnectionSchema.safeParse(req.body)
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: validation.error.errors
        })
      }

      const { provider, model, api_key } = validation.data
      const result = await LlmProviderFactory.testConnection(provider, api_key, model)

      return res.status(200).json({
        success: result.success,
        message: result.message,
        data: { latencyMs: result.latencyMs }
      })
    } catch (error) {
      console.error('Error testing LLM connection:', error)
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}

function maskApiKey(key: string): string {
  if (!key || key.length < 8) return '****'
  return key.substring(0, 4) + '****' + key.substring(key.length - 4)
}
