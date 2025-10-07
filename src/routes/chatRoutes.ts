import { Router } from 'express';
import ChatController from '../controllers/chatController';
import { validateClienteId } from '../middleware/validate-cliente-id';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Chat:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único da mensagem
 *         lead_id:
 *           type: string
 *           format: uuid
 *           description: ID do lead
 *         cliente_id:
 *           type: string
 *           format: uuid
 *           description: ID do cliente
 *         instance_id:
 *           type: string
 *           format: uuid
 *           description: ID da instância da Evolution API
 *         tipo:
 *           type: string
 *           enum: [human, ai]
 *           description: Tipo da mensagem
 *         mensagem:
 *           type: string
 *           description: Conteúdo da mensagem
 *         source:
 *           type: string
 *           description: Origem da mensagem
 *         status:
 *           type: string
 *           enum: [sucesso, erro]
 *           description: Status da mensagem
 *         erro:
 *           type: string
 *           description: Descrição do erro (se houver)
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *     CreateChatRequest:
 *       type: object
 *       required:
 *         - lead_id
 *         - tipo
 *         - mensagem
 *         - source
 *       properties:
 *         lead_id:
 *           type: string
 *           format: uuid
 *           description: ID do lead
 *         instance_id:
 *           type: string
 *           format: uuid
 *           description: ID da instância da Evolution API
 *         tipo:
 *           type: string
 *           enum: [human, ai]
 *           description: Tipo da mensagem
 *         mensagem:
 *           type: string
 *           description: Conteúdo da mensagem
 *         source:
 *           type: string
 *           description: Origem da mensagem
 *         status:
 *           type: string
 *           enum: [sucesso, erro]
 *           description: Status da mensagem (opcional)
 *         erro:
 *           type: string
 *           description: Descrição do erro (opcional)
 *     UpdateChatRequest:
 *       type: object
 *       properties:
 *         tipo:
 *           type: string
 *           enum: [human, ai]
 *           description: Tipo da mensagem
 *         mensagem:
 *           type: string
 *           description: Conteúdo da mensagem
 *         instance_id:
 *           type: string
 *           format: uuid
 *           description: ID da instância da Evolution API
 *         source:
 *           type: string
 *           description: Origem da mensagem
 *         status:
 *           type: string
 *           enum: [sucesso, erro]
 *           description: Status da mensagem
 *         erro:
 *           type: string
 *           description: Descrição do erro
 */

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Criar nova mensagem de chat
 *     tags: [Chat]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *         example: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *     security:
 *       - ClienteId: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateChatRequest'
 *     responses:
 *       201:
 *         description: Mensagem criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Chat'
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', validateClienteId, ChatController.create);

/**
 * @swagger
 * /api/chat:
 *   get:
 *     summary: Listar todas as mensagens com paginação
 *     tags: [Chat]
 *     security:
 *       - ClienteId: []
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *         example: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *     responses:
 *       200:
 *         description: Lista de mensagens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Chat'
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
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 */
router.get('/', validateClienteId, ChatController.getAll);

/**
 * @swagger
 * /api/chat/{id}:
 *   get:
 *     summary: Buscar mensagem por ID
 *     tags: [Chat]
 *     security:
 *       - ClienteId: []
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *         example: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da mensagem
 *     responses:
 *       200:
 *         description: Mensagem encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Chat'
 *       404:
 *         description: Mensagem não encontrada
 */
router.get('/:id', validateClienteId, ChatController.getById);

/**
 * @swagger
 * /api/chat/lead/{leadId}:
 *   get:
 *     summary: Buscar mensagens por lead
 *     tags: [Chat]
 *     security:
 *       - ClienteId: []
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *         example: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *       - in: path
 *         name: leadId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do lead
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 50
 *         description: Limite de itens por página
 *     responses:
 *       200:
 *         description: Mensagens do lead
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Chat'
 *                 pagination:
 *                   type: object
 */
router.get('/lead/:leadId', validateClienteId, ChatController.getByLeadId);

/**
 * @swagger
 * /api/chat/sendText:
 *   post:
 *     summary: Criar nova mensagem de chat com integração
 *     tags: [Chat]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *         example: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *     security:
 *       - ClienteId: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateChatRequest'
 *     responses:
 *       201:
 *         description: Mensagem criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Chat'
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/sendText', validateClienteId, ChatController.createChatSendText);

/**
 * @swagger
 * /api/chat/{id}:
 *   put:
 *     summary: Atualizar mensagem
 *     tags: [Chat]
 *     security:
 *       - ClienteId: []
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *         example: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da mensagem
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateChatRequest'
 *     responses:
 *       200:
 *         description: Mensagem atualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Chat'
 *       404:
 *         description: Mensagem não encontrada
 */
router.put('/:id', validateClienteId, ChatController.update);

/**
 * @swagger
 * /api/chat/{id}:
 *   delete:
 *     summary: Deletar mensagem
 *     tags: [Chat]
 *     security:
 *       - ClienteId: []
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *         example: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da mensagem
 *     responses:
 *       200:
 *         description: Mensagem deletada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Mensagem não encontrada
 */
router.delete('/:id', validateClienteId, ChatController.delete);

/**
 * @swagger
 * /api/chat/lead/{leadId}:
 *   delete:
 *     summary: Deletar todas as mensagens de um lead
 *     tags: [Chat]
 *     security:
 *       - ClienteId: []
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *         example: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *       - in: path
 *         name: leadId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do lead
 *     responses:
 *       200:
 *         description: Mensagens deletadas
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
router.delete('/lead/:leadId', validateClienteId, ChatController.deleteByLeadId);

export default router;