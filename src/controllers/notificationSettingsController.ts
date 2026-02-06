import { Request, Response } from 'express'
import { NotificationSettingsService } from '../services/notificationSettingsService'
import { LeadNotificationService } from '../services/leadNotificationService'

/**
 * Controller for notification settings endpoints
 */
export class NotificationSettingsController {
  /**
   * Get notification settings for current client
   * GET /api/settings/notifications
   */
  static async getSettings(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente_id'] as string

      if (!clienteId) {
        return res.status(400).json({ error: 'cliente_id header is required' })
      }

      const settings = await NotificationSettingsService.getByClienteId(clienteId)

      if (!settings) {
        return res.status(404).json({ error: 'Notification settings not found' })
      }

      return res.json(settings)
    } catch (error) {
      console.error('Error getting notification settings:', error)
      return res.status(500).json({ error: 'Failed to get notification settings' })
    }
  }

  /**
   * Create or update notification settings
   * PUT /api/settings/notifications
   */
  static async updateSettings(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente_id'] as string

      if (!clienteId) {
        return res.status(400).json({ error: 'cliente_id header is required' })
      }

      const settings = await NotificationSettingsService.upsert(clienteId, req.body)
      return res.json(settings)
    } catch (error) {
      console.error('Error updating notification settings:', error)
      return res.status(500).json({ error: 'Failed to update notification settings' })
    }
  }

  /**
   * Test email notification
   * POST /api/settings/notifications/test/email
   */
  static async testEmail(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente_id'] as string
      const { recipientEmail } = req.body

      if (!clienteId) {
        return res.status(400).json({ error: 'cliente_id header is required' })
      }

      if (!recipientEmail) {
        return res.status(400).json({ error: 'recipientEmail is required' })
      }

      const result = await LeadNotificationService.testEmail(clienteId, recipientEmail)
      return res.json(result)
    } catch (error) {
      console.error('Error testing email:', error)
      return res.status(500).json({ success: false, error: 'Failed to test email' })
    }
  }

  /**
   * Test WhatsApp notification
   * POST /api/settings/notifications/test/whatsapp
   */
  static async testWhatsApp(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente_id'] as string
      const { recipientPhone } = req.body

      if (!clienteId) {
        return res.status(400).json({ error: 'cliente_id header is required' })
      }

      if (!recipientPhone) {
        return res.status(400).json({ error: 'recipientPhone is required' })
      }

      const result = await LeadNotificationService.testWhatsApp(clienteId, recipientPhone)
      return res.json(result)
    } catch (error) {
      console.error('Error testing WhatsApp:', error)
      return res.status(500).json({ success: false, error: 'Failed to test WhatsApp' })
    }
  }
}
