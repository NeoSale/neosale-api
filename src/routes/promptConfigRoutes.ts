import { Router } from 'express'
import { PromptConfigController } from '../controllers/promptConfigController'

const router = Router()

/**
 * @swagger
 * /api/prompt-config:
 *   get:
 *     summary: Get all prompt configurations for the current client
 *     tags: [Prompt Config]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of prompt configurations
 */
router.get('/', PromptConfigController.getAll)

/**
 * @swagger
 * /api/prompt-config/{context}:
 *   get:
 *     summary: Get prompt configuration by context
 *     tags: [Prompt Config]
 *     parameters:
 *       - in: path
 *         name: context
 *         required: true
 *         schema:
 *           type: string
 *           enum: [follow_up, prospeccao, google_calendar]
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Prompt configuration (null if not configured, includes defaultPrompt)
 */
router.get('/:context', PromptConfigController.getByContext)

/**
 * @swagger
 * /api/prompt-config/{context}:
 *   put:
 *     summary: Create or update prompt configuration for a context
 *     tags: [Prompt Config]
 *     parameters:
 *       - in: path
 *         name: context
 *         required: true
 *         schema:
 *           type: string
 *           enum: [follow_up, prospeccao, google_calendar]
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [prompt]
 *             properties:
 *               prompt:
 *                 type: string
 *               changed_by:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Prompt configuration updated
 */
router.put('/:context', PromptConfigController.upsert)

/**
 * @swagger
 * /api/prompt-config/{context}:
 *   delete:
 *     summary: Delete prompt configuration for a context
 *     tags: [Prompt Config]
 *     responses:
 *       200:
 *         description: Prompt configuration deleted
 */
router.delete('/:context', PromptConfigController.delete)

/**
 * @swagger
 * /api/prompt-config/{context}/history:
 *   get:
 *     summary: Get prompt change history for a context
 *     tags: [Prompt Config]
 *     responses:
 *       200:
 *         description: List of previous prompts
 */
router.get('/:context/history', PromptConfigController.getHistory)

export default router
