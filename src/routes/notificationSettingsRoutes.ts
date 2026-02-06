import { Router } from 'express'
import { NotificationSettingsController } from '../controllers/notificationSettingsController'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Notification Settings
 *   description: Email and WhatsApp notification configuration
 */

/**
 * @swagger
 * /api/settings/notifications:
 *   get:
 *     summary: Get notification settings for current client
 *     tags: [Notification Settings]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification settings
 *       404:
 *         description: Settings not found
 */
router.get('/', NotificationSettingsController.getSettings)

/**
 * @swagger
 * /api/settings/notifications:
 *   put:
 *     summary: Create or update notification settings
 *     tags: [Notification Settings]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated settings
 */
router.put('/', NotificationSettingsController.updateSettings)

/**
 * @swagger
 * /api/settings/notifications/test/email:
 *   post:
 *     summary: Test email notification
 *     tags: [Notification Settings]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipientEmail:
 *                 type: string
 *     responses:
 *       200:
 *         description: Test result
 */
router.post('/test/email', NotificationSettingsController.testEmail)

/**
 * @swagger
 * /api/settings/notifications/test/whatsapp:
 *   post:
 *     summary: Test WhatsApp notification
 *     tags: [Notification Settings]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipientPhone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Test result
 */
router.post('/test/whatsapp', NotificationSettingsController.testWhatsApp)

export default router
