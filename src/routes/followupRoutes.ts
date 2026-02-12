import { Router } from 'express'
import { FollowupController } from '../controllers/followupController'
import { validateClienteId } from '../middleware/validate-cliente_id'

const router = Router()

// N8N endpoints (cliente_id comes in body, no header validation)
router.post('/trigger', FollowupController.trigger)
router.post('/cancel', FollowupController.cancel)
router.post('/opt-out', FollowupController.optOut)

// CRM endpoints (cliente_id comes in header)
router.get('/config', validateClienteId, FollowupController.getConfig)
router.put('/config', validateClienteId, FollowupController.updateConfig)
router.get('/tracking/:leadId', validateClienteId, FollowupController.getTracking)
router.post('/tracking/:leadId/cancel', validateClienteId, FollowupController.cancelTracking)
router.get('/stats', validateClienteId, FollowupController.getStats)

export default router
