import { Router } from 'express';
import { TipoAcessoController } from '../controllers/tipoAcessoController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TipoAcesso:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único do tipo de acesso
 *         nome:
 *           type: string
 *           description: Nome do tipo de acesso
 *         descricao:
 *           type: string
 *           nullable: true
 *           description: Descrição do tipo de acesso
 *         ativo:
 *           type: boolean
 *           description: Se o tipo de acesso está ativo
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data de atualização
 *     CreateTipoAcesso:
 *       type: object
 *       required:
 *         - nome
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome do tipo de acesso
 *         descricao:
 *           type: string
 *           description: Descrição do tipo de acesso
 *         ativo:
 *           type: boolean
 *           default: true
 *           description: Se o tipo de acesso está ativo
 *     UpdateTipoAcesso:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome do tipo de acesso
 *         descricao:
 *           type: string
 *           description: Descrição do tipo de acesso
 *         ativo:
 *           type: boolean
 *           description: Se o tipo de acesso está ativo
 */

/**
 * @swagger
 * /api/tipos-acesso:
 *   get:
 *     summary: Buscar todos os tipos de acesso
 *     tags: [Tipos de Acesso]
 *     responses:
 *       200:
 *         description: Lista de tipos de acesso
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
 *                     $ref: '#/components/schemas/TipoAcesso'
 *                 total:
 *                   type: integer
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/', TipoAcessoController.getAll);

/**
 * @swagger
 * /api/tipos-acesso/{id}:
 *   get:
 *     summary: Buscar tipo de acesso por ID
 *     tags: [Tipos de Acesso]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do tipo de acesso
 *     responses:
 *       200:
 *         description: Tipo de acesso encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TipoAcesso'
 *       404:
 *         description: Tipo de acesso não encontrado
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
router.get('/:id', TipoAcessoController.getById);

/**
 * @swagger
 * /api/tipos-acesso/nome/{nome}:
 *   get:
 *     summary: Buscar tipo de acesso por nome
 *     tags: [Tipos de Acesso]
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome do tipo de acesso
 *     responses:
 *       200:
 *         description: Tipo de acesso encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TipoAcesso'
 *       404:
 *         description: Tipo de acesso não encontrado
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
router.get('/nome/:nome', TipoAcessoController.getByNome);

/**
 * @swagger
 * /api/tipos-acesso:
 *   post:
 *     summary: Criar novo tipo de acesso
 *     tags: [Tipos de Acesso]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTipoAcesso'
 *     responses:
 *       201:
 *         description: Tipo de acesso criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TipoAcesso'
 *                 message:
 *                   type: string
 *                   example: Tipo de acesso criado com sucesso
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       409:
 *         description: Já existe um tipo de acesso com este nome
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
router.post('/', TipoAcessoController.create);

/**
 * @swagger
 * /api/tipos-acesso/{id}:
 *   put:
 *     summary: Atualizar tipo de acesso
 *     tags: [Tipos de Acesso]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do tipo de acesso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTipoAcesso'
 *     responses:
 *       200:
 *         description: Tipo de acesso atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TipoAcesso'
 *                 message:
 *                   type: string
 *                   example: Tipo de acesso atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Tipo de acesso não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       409:
 *         description: Já existe um tipo de acesso com este nome
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
router.put('/:id', TipoAcessoController.update);

/**
 * @swagger
 * /api/tipos-acesso/{id}:
 *   delete:
 *     summary: Deletar tipo de acesso
 *     tags: [Tipos de Acesso]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do tipo de acesso
 *     responses:
 *       200:
 *         description: Tipo de acesso deletado com sucesso
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
 *                   example: Tipo de acesso deletado com sucesso
 *       404:
 *         description: Tipo de acesso não encontrado
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
router.delete('/:id', TipoAcessoController.delete);

export default router;