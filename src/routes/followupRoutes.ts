import { Router } from 'express'
import { FollowupController } from '../controllers/followupController'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Followup:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único do followup
 *         id_mensagem:
 *           type: string
 *           format: uuid
 *           description: ID da mensagem referenciada
 *         id_lead:
 *           type: string
 *           format: uuid
 *           description: ID do lead que recebeu a mensagem
 *         status:
 *           type: string
 *           enum: [sucesso, erro]
 *           description: Status do envio da mensagem
 *         erro:
 *           type: string
 *           description: Mensagem de erro (quando status = erro)
 *         mensagem_enviada:
 *           type: string
 *           description: Texto da mensagem que foi enviada
 *         embedding:
 *           type: array
 *           items:
 *             type: number
 *           description: Embedding para LLM
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data de atualização
 *     CreateFollowup:
 *       type: object
 *       required:
 *         - id_mensagem
 *         - id_lead
 *         - status
 *         - mensagem_enviada
 *       properties:
 *         id_mensagem:
 *           type: string
 *           format: uuid
 *           description: ID da mensagem referenciada
 *         id_lead:
 *           type: string
 *           format: uuid
 *           description: ID do lead que recebeu a mensagem
 *         status:
 *           type: string
 *           enum: [sucesso, erro]
 *           description: Status do envio da mensagem
 *         erro:
 *           type: string
 *           description: Mensagem de erro (quando status = erro)
 *         mensagem_enviada:
 *           type: string
 *           description: Texto da mensagem que foi enviada
 *         embedding:
 *           type: array
 *           items:
 *             type: number
 *           description: Embedding para LLM
 *     UpdateFollowup:
 *       type: object
 *       properties:
 *         id_mensagem:
 *           type: string
 *           format: uuid
 *           description: ID da mensagem referenciada
 *         id_lead:
 *           type: string
 *           format: uuid
 *           description: ID do lead que recebeu a mensagem
 *         status:
 *           type: string
 *           enum: [sucesso, erro]
 *           description: Status do envio da mensagem
 *         erro:
 *           type: string
 *           description: Mensagem de erro (quando status = erro)
 *         mensagem_enviada:
 *           type: string
 *           description: Texto da mensagem que foi enviada
 *         embedding:
 *           type: array
 *           items:
 *             type: number
 *           description: Embedding para LLM
 */

/**
 * @swagger
 * /api/followups:
 *   get:
 *     summary: Listar followups com paginação
 *     tags: [Followups]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Itens por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por mensagem ou status
 *     responses:
 *       200:
 *         description: Lista de followups
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Followup'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *   post:
 *     summary: Criar novo followup
 *     tags: [Followups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFollowup'
 *     responses:
 *       201:
 *         description: Followup criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Followup'
 *                 message:
 *                   type: string
 */
router.get('/', FollowupController.listar)
router.post('/', FollowupController.criar)

/**
 * @swagger
 * /api/followups/{id}:
 *   get:
 *     summary: Buscar followup por ID
 *     tags: [Followups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do followup
 *     responses:
 *       200:
 *         description: Followup encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Followup'
 *       404:
 *         description: Followup não encontrado
 *   put:
 *     summary: Atualizar followup
 *     tags: [Followups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do followup
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFollowup'
 *     responses:
 *       200:
 *         description: Followup atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Followup'
 *                 message:
 *                   type: string
 *   delete:
 *     summary: Deletar followup
 *     tags: [Followups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do followup
 *     responses:
 *       200:
 *         description: Followup deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.get('/:id', FollowupController.buscarPorId)
router.put('/:id', FollowupController.atualizar)
router.delete('/:id', FollowupController.deletar)

/**
 * @swagger
 * /api/followups/lead/{leadId}:
 *   get:
 *     summary: Buscar followups por lead
 *     tags: [Followups]
 *     parameters:
 *       - in: path
 *         name: leadId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do lead
 *     responses:
 *       200:
 *         description: Followups do lead
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Followup'
 */
router.get('/lead/:leadId', FollowupController.buscarPorLead)

/**
 * @swagger
 * /api/followups/status/{status}:
 *   get:
 *     summary: Buscar followups por status
 *     tags: [Followups]
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [sucesso, erro]
 *         description: Status do followup
 *     responses:
 *       200:
 *         description: Followups por status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Followup'
 */
router.get('/status/:status', FollowupController.buscarPorStatus)

/**
 * @swagger
 * /api/followups/embedding:
 *   get:
 *     summary: Buscar followups com embedding
 *     tags: [Followups]
 *     responses:
 *       200:
 *         description: Followups com embedding
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Followup'
 */
router.get('/embedding', FollowupController.buscarComEmbedding)

export default router