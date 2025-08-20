import { Router } from 'express';
import { ChatController } from '../controllers/chatController';
import { validateRequest } from '../middleware/validate-request';
import { createChatHistorySchema, updateChatHistorySchema, sessionIdParamSchema, idParamSchema, numericIdParamSchema, paginationSchema } from '../lib/validators';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatHistory:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único da mensagem
 *           example: 1
 *         session_id:
 *           type: string
 *           format: uuid
 *           description: ID da sessão (referencia o ID do lead)
 *           example: "aa9d7cb7-aea2-44cd-9862-b6a9659aaef9"
 *         message:
 *           type: object
 *           description: Conteúdo da mensagem em formato JSON
 *           example: {"type":"ai","content":"Olá! Como posso ajudar?","tool_calls":[],"additional_kwargs":{},"response_metadata":{},"invalid_tool_calls":[]}
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data e hora de criação
 *           example: "2024-01-15T10:30:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data e hora da última atualização
 *           example: "2024-01-15T10:30:00Z"
 *       required:
 *         - session_id
 *         - message
 *     
 *     CreateChatHistoryRequest:
 *       type: object
 *       properties:
 *         session_id:
 *           type: string
 *           format: uuid
 *           description: ID da sessão (referencia o ID do lead)
 *           example: "aa9d7cb7-aea2-44cd-9862-b6a9659aaef9"
 *         message:
 *           type: object
 *           description: Conteúdo da mensagem em formato JSON
 *           example: {"type":"ai","content":"Olá! Como posso ajudar?","tool_calls":[],"additional_kwargs":{},"response_metadata":{},"invalid_tool_calls":[]}
 *       required:
 *         - session_id
 *         - message
 *     
 *     UpdateChatHistoryRequest:
 *       type: object
 *       properties:
 *         message:
 *           type: object
 *           description: Conteúdo da mensagem em formato JSON
 *           example: {"type":"ai","content":"Mensagem atualizada","tool_calls":[],"additional_kwargs":{},"response_metadata":{},"invalid_tool_calls":[]}
 *         status:
 *           type: string
 *           enum: [sucesso, erro]
 *           description: Status da mensagem
 *           example: "sucesso"
 *         erro:
 *           type: string
 *           description: Descrição do erro (opcional)
 *           example: "Erro ao processar mensagem"
 *     
 *     ChatHistoryResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ChatHistory'
 *         - type: object
 *           properties:
 *             id:
 *               type: integer
 *               description: ID único da mensagem
 *     
 *     ChatHistoriesListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Mensagens de chat encontradas"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ChatHistoryResponse'
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               example: 100
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 50
 *             totalPages:
 *               type: integer
 *               example: 2
 *     
 *     GroupedChatHistoryResponse:
 *       type: object
 *       properties:
 *         session_id:
 *           type: string
 *           format: uuid
 *           description: ID da sessão (ID do lead)
 *           example: "aa9d7cb7-aea2-44cd-9862-b6a9659aaef9"
 *         nome:
 *           type: string
 *           description: Nome do lead
 *           example: "João Silva"
 *         telefone:
 *           type: string
 *           description: Telefone do lead
 *           example: "+5511999999999"
 *         profile_picture_url:
 *           type: string
 *           description: URL da foto de perfil do lead
 *           example: "https://example.com/profile.jpg"
 *         ultima_mensagem:
 *           type: object
 *           description: Última mensagem da conversa
 *           example: {"type":"human","content":"Olá, preciso de ajuda"}
 *         data_ultima_mensagem:
 *           type: string
 *           format: date-time
 *           description: Data e hora da última mensagem
 *           example: "2024-01-15T10:30:00Z"
 *     
 *     GroupedChatHistoriesListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Registros de chat agrupados encontrados"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/GroupedChatHistoryResponse'
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               example: 100
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 50
 *             totalPages:
 *               type: integer
 *               example: 2
 *     
 *     LeadWithLastMessage:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único do lead
 *           example: "aa9d7cb7-aea2-44cd-9862-b6a9659aaef9"
 *         session_id:
 *           type: string
 *           format: uuid
 *           description: ID da sessão (mesmo que o ID do lead)
 *           example: "aa9d7cb7-aea2-44cd-9862-b6a9659aaef9"
 *         nome:
 *           type: string
 *           description: Nome do lead
 *           example: "João Silva"
 *         ultima_mensagem:
 *           type: object
 *           nullable: true
 *           description: Última mensagem do lead
 *           example: {"type":"human","content":"Olá, tenho interesse no produto"}
 *         data_ultima_mensagem:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Data da última mensagem
 *           example: "2024-01-15T10:30:00Z"
 *         profile_picture_url:
 *           type: string
 *           format: uri
 *           nullable: true
 *           description: URL da foto de perfil do lead
 *           example: "https://example.com/profile.jpg"
 *         telefone:
 *           type: string
 *           nullable: true
 *           description: Número de telefone do lead
 *           example: "+5511999999999"
 *     
 *     LeadsWithLastMessageResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Leads com última mensagem encontrados"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LeadWithLastMessage'
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               example: 100
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 50
 *             totalPages:
 *               type: integer
 *               example: 2
 */

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Criar nova mensagem de chat (apenas gravar na tabela)
 *     description: Grava uma mensagem na tabela n8n_chat_histories sem integração com Evolution API
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateChatHistoryRequest'
 *     responses:
 *       201:
 *         description: Mensagem de chat criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Mensagem de chat criada com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/ChatHistoryResponse'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Lead não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', validateRequest(createChatHistorySchema), ChatController.createSimpleChatHistory);

/**
 * @swagger
 * /api/chat/sendText:
 *   post:
 *     summary: Criar nova mensagem de chat com integração
 *     description: Grava uma mensagem na tabela n8n_chat_histories e envia via Evolution API
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateChatHistoryRequest'
 *     responses:
 *       201:
 *         description: Mensagem de chat criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Mensagem de chat criada com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/ChatHistoryResponse'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Lead não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/sendText', validateRequest(createChatHistorySchema), ChatController.createChatHistory);

/**
 * @swagger
 * /api/chat/cliente:
 *   get:
 *     summary: Buscar conversas agrupadas por session_id com dados dos leads
 *     description: Retorna as conversas agrupadas por session_id, incluindo dados do lead (nome, telefone, foto) e a última mensagem de cada conversa
 *     tags: [Chat]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *         example: "d1cdfe73-7553-47c6-ba4b-8c54b9b87481"
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
 *           maximum: 100
 *           default: 50
 *         description: Número de itens por página
 *     responses:
 *       200:
 *         description: Conversas agrupadas encontradas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupedChatHistoriesListResponse'
 *       400:
 *         description: cliente_id é obrigatório
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/cliente', ChatController.getChatHistoriesByClienteId);

/**
 * @swagger
 * /api/chat/session/{session_id}:
 *   get:
 *     summary: Buscar mensagens de chat por session_id (ID do lead)
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: session_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da sessão (ID do lead)
 *         example: "aa9d7cb7-aea2-44cd-9862-b6a9659aaef9"
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
 *           maximum: 100
 *           default: 50
 *         description: Número de itens por página
 *     responses:
 *       200:
 *         description: Mensagens de chat encontradas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatHistoriesListResponse'
 *       400:
 *         description: session_id inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/session/:session_id', ChatController.getChatHistoriesBySessionId);

/**
 * @swagger
 * /api/chat/{id}:
 *   get:
 *     summary: Buscar mensagem de chat por ID
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da mensagem
 *         example: 1
 *     responses:
 *       200:
 *         description: Mensagem de chat encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Mensagem de chat encontrada"
 *                 data:
 *                   $ref: '#/components/schemas/ChatHistoryResponse'
 *       404:
 *         description: Mensagem não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
// Debug middleware
router.get('/:id', (req, res, next) => {
  console.log('Debug - req.params:', req.params);
  console.log('Debug - req.params.id type:', typeof req.params.id);
  console.log('Debug - numericIdParamSchema:', numericIdParamSchema);
  const testParse = numericIdParamSchema.safeParse(req.params);
  console.log('Debug - test parse result:', testParse);
  next();
}, validateRequest(numericIdParamSchema, 'params'), ChatController.getChatHistoryById);

/**
 * @swagger
 * /api/chat/{id}:
 *   put:
 *     summary: Atualizar mensagem de chat
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da mensagem
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateChatHistoryRequest'
 *     responses:
 *       200:
 *         description: Mensagem de chat atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Mensagem de chat atualizada com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/ChatHistoryResponse'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Mensagem não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id', validateRequest(numericIdParamSchema, 'params'), validateRequest(updateChatHistorySchema), ChatController.updateChatHistory);

/**
 * @swagger
 * /api/chat/{id}:
 *   delete:
 *     summary: Deletar mensagem de chat
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da mensagem
 *         example: 1
 *     responses:
 *       200:
 *         description: Mensagem de chat deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Mensagem de chat deletada com sucesso"
 *       404:
 *         description: Mensagem não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', validateRequest(numericIdParamSchema, 'params'), ChatController.deleteChatHistory);

/**
 * @swagger
 * /api/chat/ultima_mensagem/{session_id}:
 *   get:
 *     summary: Buscar mensagens por tipo e conteúdo
 *     description: Busca mensagens de um tipo específico para um session_id com filtro opcional por conteúdo
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: session_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da sessão
 *       - in: query
 *         name: message_type
 *         schema:
 *           type: string
 *           default: human
 *         description: Tipo da mensagem
 *     responses:
 *       200:
 *         description: Mensagens encontradas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatHistoriesListResponse'
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/ultima_mensagem/:session_id', ChatController.getMessagesBySessionIDType);

/**
 * @swagger
 * /api/chat/session/{session_id}:
 *   delete:
 *     summary: Deletar todas as mensagens de uma sessão
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: session_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da sessão (ID do lead)
 *         example: "aa9d7cb7-aea2-44cd-9862-b6a9659aaef9"
 *     responses:
 *       200:
 *         description: Todas as mensagens da sessão foram deletadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Todas as mensagens da sessão foram deletadas com sucesso"
 *       400:
 *         description: session_id inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/session/:session_id', ChatController.deleteChatHistoriesBySessionId);

/**
 * @swagger
 * /api/chat/{session_id}/mark-error:
 *   post:
 *     summary: Marcar última mensagem como erro
 *     description: Marca a última mensagem de um tipo específico (AI ou Human) de uma sessão como erro, atualizando os campos status e erro
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: session_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da sessão (ID do lead)
 *         example: "aa9d7cb7-aea2-44cd-9862-b6a9659aaef9"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message_type
 *             properties:
 *               message_type:
 *                 type: string
 *                 enum: [ai, human]
 *                 description: Tipo da mensagem a ser marcada como erro
 *                 example: "ai"
 *               error_message:
 *                 type: string
 *                 description: Mensagem de erro personalizada (opcional)
 *                 example: "Erro ao processar mensagem do usuário"
 *     responses:
 *       200:
 *         description: Última mensagem marcada como erro com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Última mensagem do tipo 'ai' marcada como erro com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/ChatHistoryResponse'
 *       400:
 *         description: session_id inválido ou tipo de mensagem inválido
 *       404:
 *         description: Nenhuma mensagem encontrada para esta sessão e tipo
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/:session_id/mark-error', validateRequest(sessionIdParamSchema, 'params'), ChatController.markLastMessageAsError);

export default router;