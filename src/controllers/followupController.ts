import { Request, Response } from 'express'
import { EventQueueService } from '../services/eventQueueService'
import { EventQueueProcessor } from '../schedulers/eventQueueProcessor'
import { FollowupService } from '../services/followupService'
import {
  followupTriggerSchema,
  followupCancelSchema,
  followupOptOutSchema,
  updateFollowupConfigSchema,
} from '../lib/validators'

export class FollowupController {
  // =============================================
  // N8N ENDPOINTS (cliente_id comes in body)
  // =============================================

  static async trigger(req: Request, res: Response) {
    try {
      const parsed = followupTriggerSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: parsed.error.errors[0].message })
      }

      const { lead_id, cliente_id } = parsed.data

      // Cancel any existing pending events for this lead BEFORE enqueuing new one.
      // This prevents duplicate pending events when trigger is called multiple times.
      const cancelled = await EventQueueService.cancelByLeadId(lead_id)
      if (cancelled > 0) {
        console.log(`[FollowupController] Pre-cancelled ${cancelled} pending events for lead ${lead_id}`)
      }

      await EventQueueService.enqueue(
        cliente_id,
        'ai_message_sent',
        { lead_id, cliente_id },
        undefined,
        2
      )

      // Process immediately
      EventQueueProcessor.triggerImmediate().catch(console.error)

      return res.json({ success: true, message: 'Follow-up trigger enqueued' })
    } catch (error: any) {
      console.error('[FollowupController] trigger error:', error.message)
      return res.status(500).json({ success: false, error: error.message })
    }
  }

  static async cancel(req: Request, res: Response) {
    try {
      const parsed = followupCancelSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: parsed.error.errors[0].message })
      }

      const { lead_id } = parsed.data
      const cliente_id = req.body.cliente_id || req.headers['cliente_id'] as string

      await EventQueueService.enqueue(
        cliente_id || 'system',
        'lead_message_received',
        { lead_id },
        undefined,
        1
      )

      // Process immediately (high priority)
      EventQueueProcessor.triggerImmediate().catch(console.error)

      return res.json({ success: true, message: 'Follow-up cancellation enqueued' })
    } catch (error: any) {
      console.error('[FollowupController] cancel error:', error.message)
      return res.status(500).json({ success: false, error: error.message })
    }
  }

  static async optOut(req: Request, res: Response) {
    try {
      const parsed = followupOptOutSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: parsed.error.errors[0].message })
      }

      const { lead_id, cliente_id } = parsed.data

      await EventQueueService.enqueue(
        cliente_id,
        'lead_opted_out',
        { lead_id, cliente_id },
        undefined,
        1
      )

      // Process immediately
      EventQueueProcessor.triggerImmediate().catch(console.error)

      return res.json({ success: true, message: 'Opt-out enqueued' })
    } catch (error: any) {
      console.error('[FollowupController] optOut error:', error.message)
      return res.status(500).json({ success: false, error: error.message })
    }
  }

  // =============================================
  // CRM ENDPOINTS (cliente_id comes in header)
  // =============================================

  static async getConfig(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente_id'] as string
      const config = await FollowupService.getConfig(clienteId)

      return res.json({
        success: true,
        data: config,
      })
    } catch (error: any) {
      console.error('[FollowupController] getConfig error:', error.message)
      return res.status(500).json({ success: false, error: error.message })
    }
  }

  static async updateConfig(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente_id'] as string
      const parsed = updateFollowupConfigSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: parsed.error.errors[0].message })
      }

      const config = await FollowupService.upsertConfig(clienteId, parsed.data)

      return res.json({
        success: true,
        data: config,
      })
    } catch (error: any) {
      console.error('[FollowupController] updateConfig error:', error.message)
      return res.status(500).json({ success: false, error: error.message })
    }
  }

  static async getTracking(req: Request, res: Response) {
    try {
      const { leadId } = req.params
      const tracking = await FollowupService.getTrackingByLead(leadId)

      return res.json({
        success: true,
        data: tracking,
      })
    } catch (error: any) {
      console.error('[FollowupController] getTracking error:', error.message)
      return res.status(500).json({ success: false, error: error.message })
    }
  }

  static async cancelTracking(req: Request, res: Response) {
    try {
      const { leadId } = req.params
      const clienteId = req.headers['cliente_id'] as string

      // Enqueue lead_message_received (same effect as lead responding)
      await EventQueueService.enqueue(
        clienteId,
        'lead_message_received',
        { lead_id: leadId },
        undefined,
        1
      )

      EventQueueProcessor.triggerImmediate().catch(console.error)

      return res.json({ success: true, message: 'Follow-up cancelled for lead' })
    } catch (error: any) {
      console.error('[FollowupController] cancelTracking error:', error.message)
      return res.status(500).json({ success: false, error: error.message })
    }
  }

  static async getStats(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente_id'] as string
      const stats = await FollowupService.getStats(clienteId)

      return res.json({
        success: true,
        data: stats,
      })
    } catch (error: any) {
      console.error('[FollowupController] getStats error:', error.message)
      return res.status(500).json({ success: false, error: error.message })
    }
  }
}
