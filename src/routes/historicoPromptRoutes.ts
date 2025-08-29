import { Router } from 'express';
import { HistoricoPromptController } from '../controllers/historicoPromptController';
import { validateClienteId } from '../middleware/validate-cliente-id';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     HistoricoPrompt:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único do histórico de prompt
 *         agente_id:
 *           type: string
 *           format: uuid
 *           description: ID do agente vinculado
 *         prompt:
 *           type: string
 *           nullable: true
 *           description: Prompt do agente
 *         prompt_agendamento:
 *           type: string
 *           nullable: true
 *           description: Prompt de agendamento do agente
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data de atualização
 *         agente:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             nome:
 *               type: string
 *             cliente_id:
 *               type: string
 *               format: uuid
 *     CreateHistoricoPromptInput:
 *       type: object
 *       required:
 *         - agente_id
 *       properties:
 *         agente_id:
 *           type: string
 *           format: uuid
 *           description: ID do agente
 *         prompt:
 *           type: string
 *           nullable: true
 *           description: Prompt do agente
 *         prompt_agendamento:
 *           type: string
 *           nullable: true
 *           description: Prompt de agendamento do agente
 *     UpdateHistoricoPromptInput:
 *       type: object
 *       properties:
 *         prompt:
 *           type: string
 *           nullable: true
 *           description: Prompt do agente
 *         prompt_agendamento:
 *           type: string
 *           nullable: true
 *           description: Prompt de agendamento do agente
 */

/**
 * @swagger
 * /api/historico-prompt:
 *   get:
 *     summary: Lista todos os históricos de prompt
 *     tags: [Histórico de Prompt]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Lista de históricos de prompt
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
 *                     $ref: '#/components/schemas/HistoricoPrompt'
 *                 total:
 *                   type: number
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', validateClienteId, HistoricoPromptController.getAll);

/**
 * @swagger
 * /api/historico-prompt/{id}:
 *   get:
 *     summary: Busca histórico de prompt por ID
 *     tags: [Histórico de Prompt]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do histórico de prompt
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Histórico de prompt encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/HistoricoPrompt'
 *       404:
 *         description: Histórico de prompt não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', validateClienteId, HistoricoPromptController.getById);

/**
 * @swagger
 * /api/historico-prompt/agente/{agenteId}:
 *   get:
 *     summary: Busca históricos de prompt por agente
 *     tags: [Histórico de Prompt]
 *     parameters:
 *       - in: path
 *         name: agenteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do agente
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Lista de históricos de prompt do agente
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
 *                     $ref: '#/components/schemas/HistoricoPrompt'
 *                 total:
 *                   type: number
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/agente/:agenteId', validateClienteId, HistoricoPromptController.getByAgenteId);

/**
 * @swagger
 * /api/historico-prompt:
 *   post:
 *     summary: Cria um novo histórico de prompt
 *     tags: [Histórico de Prompt]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateHistoricoPromptInput'
 *     responses:
 *       201:
 *         description: Histórico de prompt criado com sucesso
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
 *                   $ref: '#/components/schemas/HistoricoPrompt'
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', validateClienteId, HistoricoPromptController.create);

/**
 * @swagger
 * /api/historico-prompt/{id}:
 *   put:
 *     summary: Atualiza um histórico de prompt
 *     tags: [Histórico de Prompt]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do histórico de prompt
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateHistoricoPromptInput'
 *     responses:
 *       200:
 *         description: Histórico de prompt atualizado com sucesso
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
 *                   $ref: '#/components/schemas/HistoricoPrompt'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Histórico de prompt não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id', validateClienteId, HistoricoPromptController.update);

/**
 * @swagger
 * /api/historico-prompt/{id}:
 *   delete:
 *     summary: Deleta um histórico de prompt
 *     tags: [Histórico de Prompt]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do histórico de prompt
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Histórico de prompt deletado com sucesso
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
 *                   $ref: '#/components/schemas/HistoricoPrompt'
 *       404:
 *         description: Histórico de prompt não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', validateClienteId, HistoricoPromptController.delete);

export default router;