import { Router } from 'express';
import { ConfiguracoesController } from '../controllers/configuracoesController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Configuracoes:
 *       type: object
 *       properties:
 *         cliente_id:
 *           type: string
 *           format: uuid
 *           description: ID do cliente (chave primária)
 *         horario_inicio:
 *           type: string
 *           description: Horário de início
 *         horario_fim:
 *           type: string
 *           description: Horário de fim
 *         qtd_envio_diario:
 *           type: integer
 *           description: Quantidade de envios diários
 *         somente_dias_uteis:
 *           type: boolean
 *           description: Se deve enviar apenas em dias úteis
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data de atualização
 *         apiKeyOpenAI:
 *           type: string
 *           description: Chave da API OpenAI
 *         PromptSDR:
 *           type: string
 *           description: Prompt para SDR
 *         PromptCalendar:
 *           type: string
 *           description: Prompt para Calendar
 *         UsaCalendar:
 *           type: string
 *           description: Usa Calendar
 *     CreateConfiguracoes:
 *       type: object
 *       required:
 *         - horario_inicio
 *         - horario_fim
 *         - qtd_envio_diario
 *         - somente_dias_uteis
 *       properties:
 *         horario_inicio:
 *           type: string
 *           description: Horário de início
 *         horario_fim:
 *           type: string
 *           description: Horário de fim
 *         qtd_envio_diario:
 *           type: integer
 *           description: Quantidade de envios diários
 *         somente_dias_uteis:
 *           type: boolean
 *           description: Se deve enviar apenas em dias úteis
 *         apiKeyOpenAI:
 *           type: string
 *           description: Chave da API OpenAI
 *         PromptSDR:
 *           type: string
 *           description: Prompt para SDR
 *         PromptCalendar:
 *           type: string
 *           description: Prompt para Calendar
 *         UsaCalendar:
 *           type: string
 *           description: Usa Calendar
 */

/**
 * @swagger
 * /api/configuracoes:
 *   get:
 *     summary: Lista todas as configurações
 *     tags: [Configurações]
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
 *         description: Lista de configurações
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
 *                     $ref: '#/components/schemas/Configuracoes'
 *                 total:
 *                   type: integer
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', ConfiguracoesController.getAll);

/**
 * @swagger
 * /api/configuracoes/cliente:
 *   get:
 *     summary: Obtém uma configuração por cliente_id
 *     tags: [Configurações]
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
 *         description: Configuração encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Configuracoes'
 *       404:
 *         description: Configuração não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/cliente', ConfiguracoesController.getById);

/**
 * @swagger
 * /api/configuracoes:
 *   post:
 *     summary: Cria uma nova configuração
 *     tags: [Configurações]
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
 *             $ref: '#/components/schemas/CreateConfiguracoes'
 *     responses:
 *       201:
 *         description: Configuração criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Configuracoes'
 *                 message:
 *                   type: string
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', ConfiguracoesController.create);

/**
 * @swagger
 * /api/configuracoes/cliente:
 *   put:
 *     summary: Atualiza uma configuração
 *     tags: [Configurações]
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
 *             $ref: '#/components/schemas/CreateConfiguracoes'
 *     responses:
 *       200:
 *         description: Configuração atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Configuracoes'
 *                 message:
 *                   type: string
 *       404:
 *         description: Configuração não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/cliente', ConfiguracoesController.update);

/**
 * @swagger
 * /api/configuracoes/cliente:
 *   delete:
 *     summary: Remove uma configuração
 *     tags: [Configurações]
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
 *         description: Configuração removida com sucesso
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
 *         description: Configuração não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/cliente', ConfiguracoesController.delete);

export default router;