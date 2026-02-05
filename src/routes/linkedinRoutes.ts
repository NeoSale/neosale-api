import { Router } from 'express'
import { LinkedInController } from '../controllers/linkedinController'

const router = Router()

// ========== CONFIG CRUD ==========

/**
 * @swagger
 * /api/linkedin/config:
 *   get:
 *     summary: Busca configuracao LinkedIn do cliente
 *     tags: [LinkedIn]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteId'
 *     responses:
 *       200:
 *         description: Configuracao encontrada (ou null se nao existe)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/LinkedInConfig'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/config', LinkedInController.getConfig)

/**
 * @swagger
 * /api/linkedin/config:
 *   post:
 *     summary: Cria configuracao LinkedIn para o cliente
 *     tags: [LinkedIn]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLinkedInConfigRequest'
 *     responses:
 *       201:
 *         description: Configuracao criada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/LinkedInConfig'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/config', LinkedInController.createConfig)

/**
 * @swagger
 * /api/linkedin/config:
 *   put:
 *     summary: Atualiza configuracao LinkedIn do cliente
 *     tags: [LinkedIn]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateLinkedInConfigRequest'
 *     responses:
 *       200:
 *         description: Configuracao atualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/LinkedInConfig'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/config', LinkedInController.updateConfig)

/**
 * @swagger
 * /api/linkedin/config:
 *   delete:
 *     summary: Remove configuracao LinkedIn do cliente
 *     tags: [LinkedIn]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteId'
 *     responses:
 *       200:
 *         description: Configuracao removida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/config', LinkedInController.deleteConfig)

// ========== OAuth 2.0 ==========

/**
 * @swagger
 * /api/linkedin/auth/authorize:
 *   get:
 *     summary: Gera URL de autorizacao OAuth do LinkedIn
 *     description: Retorna a URL para redirecionar o usuario ao consentimento do LinkedIn
 *     tags: [LinkedIn]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteId'
 *     responses:
 *       200:
 *         description: URL gerada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     authorization_url:
 *                       type: string
 *                       description: URL para redirecionar o usuario
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/auth/authorize', LinkedInController.authorize)

/**
 * @swagger
 * /api/linkedin/auth/callback:
 *   get:
 *     summary: Callback OAuth do LinkedIn
 *     description: Processa o retorno do LinkedIn apos autorizacao. Troca o code por tokens e redireciona ao frontend.
 *     tags: [LinkedIn]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Authorization code do LinkedIn
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: cliente_id passado como state
 *       - in: query
 *         name: error
 *         schema:
 *           type: string
 *         description: Erro retornado pelo LinkedIn (se houver)
 *     responses:
 *       302:
 *         description: Redireciona para o frontend com status da conexao
 */
router.get('/auth/callback', LinkedInController.callback)

/**
 * @swagger
 * /api/linkedin/auth/refresh:
 *   post:
 *     summary: Forca renovacao do access token
 *     tags: [LinkedIn]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteId'
 *     responses:
 *       200:
 *         description: Token renovado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     valid:
 *                       type: boolean
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/auth/refresh', LinkedInController.refreshToken)

// ========== Status & Profile ==========

/**
 * @swagger
 * /api/linkedin/status:
 *   get:
 *     summary: Verifica status da conexao LinkedIn
 *     tags: [LinkedIn]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteId'
 *     responses:
 *       200:
 *         description: Status da conexao
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     configured:
 *                       type: boolean
 *                     connected:
 *                       type: boolean
 *                     token_expired:
 *                       type: boolean
 *                     linkedin_user_name:
 *                       type: string
 *                       nullable: true
 *                     last_error:
 *                       type: string
 *                       nullable: true
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/status', LinkedInController.getStatus)

/**
 * @swagger
 * /api/linkedin/profile:
 *   get:
 *     summary: Retorna perfil do usuario LinkedIn conectado
 *     tags: [LinkedIn]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteId'
 *     responses:
 *       200:
 *         description: Perfil do LinkedIn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     localizedFirstName:
 *                       type: string
 *                     localizedLastName:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/profile', LinkedInController.getProfile)

export default router
