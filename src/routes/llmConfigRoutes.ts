import { Router } from 'express'
import { LlmConfigController } from '../controllers/llmConfigController'

const router = Router()

/**
 * @swagger
 * /api/llm-config:
 *   get:
 *     summary: Get LLM configuration for the current client
 *     tags: [LLM Config]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: LLM configuration (null if not configured)
 */
router.get('/', LlmConfigController.get)

/**
 * @swagger
 * /api/llm-config:
 *   post:
 *     summary: Create LLM configuration
 *     tags: [LLM Config]
 *     parameters:
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
 *             required: [provider, model, api_key]
 *             properties:
 *               provider:
 *                 type: string
 *                 enum: [openai, anthropic, google]
 *               model:
 *                 type: string
 *               api_key:
 *                 type: string
 *               temperature:
 *                 type: number
 *               max_tokens:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: LLM configuration created
 */
router.post('/', LlmConfigController.create)

/**
 * @swagger
 * /api/llm-config:
 *   put:
 *     summary: Update LLM configuration
 *     tags: [LLM Config]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: LLM configuration updated
 */
router.put('/', LlmConfigController.update)

/**
 * @swagger
 * /api/llm-config:
 *   delete:
 *     summary: Delete LLM configuration
 *     tags: [LLM Config]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: LLM configuration deleted
 */
router.delete('/', LlmConfigController.delete)

/**
 * @swagger
 * /api/llm-config/test:
 *   post:
 *     summary: Test LLM connection
 *     tags: [LLM Config]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [provider, model, api_key]
 *             properties:
 *               provider:
 *                 type: string
 *                 enum: [openai, anthropic, google]
 *               model:
 *                 type: string
 *               api_key:
 *                 type: string
 *     responses:
 *       200:
 *         description: Test result with latency
 */
router.post('/test', LlmConfigController.test)

export default router
