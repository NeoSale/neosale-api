import { Router } from 'express';
import { ConfiguracaoController } from '../controllers/configuracaoController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Configuracao:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único da configuração
 *         chave:
 *           type: string
 *           description: Chave da configuração
 *         valor:
 *           type: string
 *           description: Valor da configuração
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         chave: "horario_inicio"
 *         valor: "08:00:00"
 *         created_at: "2024-01-15T10:30:00Z"
 *         updated_at: "2024-01-15T10:30:00Z"
 *     CreateConfiguracao:
 *       type: object
 *       required:
 *         - chave
 *         - valor
 *       properties:
 *         chave:
 *           type: string
 *           description: Chave da configuração
 *         valor:
 *           type: string
 *           description: Valor da configuração
 *       example:
 *         chave: "horario_inicio"
 *         valor: "08:00:00"
 *     UpdateConfiguracao:
 *       type: object
 *       properties:
 *         chave:
 *           type: string
 *           description: Chave da configuração
 *         valor:
 *           type: string
 *           description: Valor da configuração
 *       example:
 *         chave: "horario_inicio"
 *         valor: "09:00:00"
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *         error:
 *           type: string
 */

/**
 * @swagger
 * /api/configuracoes:
 *   get:
 *     summary: Buscar todas as configurações
 *     tags: [Configurações]
 *     responses:
 *       200:
 *         description: Lista de configurações retornada com sucesso
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
 *                     $ref: '#/components/schemas/Configuracao'
 *                 total:
 *                   type: number
 *                   example: 4
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/', ConfiguracaoController.getAll);

/**
 * @swagger
 * /api/configuracoes/{id}:
 *   get:
 *     summary: Buscar configuração por ID
 *     tags: [Configurações]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da configuração
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
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Configuracao'
 *       400:
 *         description: ID não fornecido
 *       404:
 *         description: Configuração não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', ConfiguracaoController.getById);

/**
 * @swagger
 * /api/configuracoes/chave/{chave}:
 *   get:
 *     summary: Buscar configuração por chave
 *     tags: [Configurações]
 *     parameters:
 *       - in: path
 *         name: chave
 *         required: true
 *         schema:
 *           type: string
 *         description: Chave da configuração
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
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Configuracao'
 *       400:
 *         description: Chave não fornecida
 *       404:
 *         description: Configuração não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/chave/:chave', ConfiguracaoController.getByChave);

/**
 * @swagger
 * /api/configuracoes:
 *   post:
 *     summary: Criar nova configuração
 *     tags: [Configurações]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateConfiguracao'
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
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Configuracao'
 *                 message:
 *                   type: string
 *                   example: "Configuração criada com sucesso"
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Configuração com esta chave já existe
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', ConfiguracaoController.create);

/**
 * @swagger
 * /api/configuracoes/{id}:
 *   put:
 *     summary: Atualizar configuração
 *     tags: [Configurações]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da configuração
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateConfiguracao'
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
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Configuracao'
 *                 message:
 *                   type: string
 *                   example: "Configuração atualizada com sucesso"
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Configuração não encontrada
 *       409:
 *         description: Configuração com esta chave já existe
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id', ConfiguracaoController.update);

/**
 * @swagger
 * /api/configuracoes/{id}:
 *   delete:
 *     summary: Deletar configuração
 *     tags: [Configurações]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da configuração
 *     responses:
 *       200:
 *         description: Configuração deletada com sucesso
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
 *                   example: "Configuração deletada com sucesso"
 *       400:
 *         description: ID não fornecido
 *       404:
 *         description: Configuração não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', ConfiguracaoController.delete);

export default router;