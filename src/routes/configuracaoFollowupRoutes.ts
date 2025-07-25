import { Router } from 'express';
import { ConfiguracaoFollowupController } from '../controllers/configuracaoFollowupController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ConfiguracaoFollowup:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único da configuração de followup
 *         nome:
 *           type: string
 *           description: Nome da configuração
 *         descricao:
 *           type: string
 *           nullable: true
 *           description: Descrição da configuração
 *         intervalo_horas:
 *           type: integer
 *           description: Intervalo em horas para o followup
 *         max_tentativas:
 *           type: integer
 *           description: Número máximo de tentativas
 *         ativo:
 *           type: boolean
 *           description: Se a configuração está ativa
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data de atualização
 *     CreateConfiguracaoFollowup:
 *       type: object
 *       required:
 *         - nome
 *         - intervalo_horas
 *         - max_tentativas
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome da configuração
 *         descricao:
 *           type: string
 *           description: Descrição da configuração
 *         intervalo_horas:
 *           type: integer
 *           minimum: 1
 *           description: Intervalo em horas para o followup
 *         max_tentativas:
 *           type: integer
 *           minimum: 1
 *           description: Número máximo de tentativas
 *         ativo:
 *           type: boolean
 *           default: true
 *           description: Se a configuração está ativa
 *     UpdateConfiguracaoFollowup:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome da configuração
 *         descricao:
 *           type: string
 *           description: Descrição da configuração
 *         intervalo_horas:
 *           type: integer
 *           minimum: 1
 *           description: Intervalo em horas para o followup
 *         max_tentativas:
 *           type: integer
 *           minimum: 1
 *           description: Número máximo de tentativas
 *         ativo:
 *           type: boolean
 *           description: Se a configuração está ativa
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *         errors:
 *           type: array
 *           items:
 *             type: object
 */

/**
 * @swagger
 * /api/configuracoes-followup:
 *   get:
 *     summary: Buscar todas as configurações de followup
 *     tags: [Configurações Followup]
 *     responses:
 *       200:
 *         description: Lista de configurações de followup
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ConfiguracaoFollowup'
 *                 total:
 *                   type: integer
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/', ConfiguracaoFollowupController.getAll);

/**
 * @swagger
 * /api/configuracoes-followup/{id}:
 *   get:
 *     summary: Buscar configuração de followup por ID
 *     tags: [Configurações Followup]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da configuração de followup
 *     responses:
 *       200:
 *         description: Configuração de followup encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ConfiguracaoFollowup'
 *       404:
 *         description: Configuração de followup não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/:id', ConfiguracaoFollowupController.getById);

/**
 * @swagger
 * /api/configuracoes-followup:
 *   post:
 *     summary: Criar nova configuração de followup
 *     tags: [Configurações Followup]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateConfiguracaoFollowup'
 *     responses:
 *       201:
 *         description: Configuração de followup criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ConfiguracaoFollowup'
 *                 message:
 *                   type: string
 *                   example: Configuração de followup criada com sucesso
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/', ConfiguracaoFollowupController.create);

/**
 * @swagger
 * /api/configuracoes-followup/{id}:
 *   put:
 *     summary: Atualizar configuração de followup
 *     tags: [Configurações Followup]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da configuração de followup
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateConfiguracaoFollowup'
 *     responses:
 *       200:
 *         description: Configuração de followup atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ConfiguracaoFollowup'
 *                 message:
 *                   type: string
 *                   example: Configuração de followup atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Configuração de followup não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.put('/:id', ConfiguracaoFollowupController.update);

/**
 * @swagger
 * /api/configuracoes-followup/{id}:
 *   delete:
 *     summary: Deletar configuração de followup
 *     tags: [Configurações Followup]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da configuração de followup
 *     responses:
 *       200:
 *         description: Configuração de followup deletada com sucesso
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
 *                   example: Configuração de followup deletada com sucesso
 *       404:
 *         description: Configuração de followup não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.delete('/:id', ConfiguracaoFollowupController.delete);

export default router;