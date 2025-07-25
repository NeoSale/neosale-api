import { Router } from 'express';
import { ProvedorController } from '../controllers/provedorController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Provedor:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único do provedor
 *         nome:
 *           type: string
 *           description: Nome do provedor
 *         descricao:
 *           type: string
 *           nullable: true
 *           description: Descrição do provedor
 *         ativo:
 *           type: boolean
 *           description: Se o provedor está ativo
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data de atualização
 *     CreateProvedor:
 *       type: object
 *       required:
 *         - nome
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome do provedor
 *         descricao:
 *           type: string
 *           description: Descrição do provedor
 *         ativo:
 *           type: boolean
 *           default: true
 *           description: Se o provedor está ativo
 *     UpdateProvedor:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome do provedor
 *         descricao:
 *           type: string
 *           description: Descrição do provedor
 *         ativo:
 *           type: boolean
 *           description: Se o provedor está ativo
 */

/**
 * @swagger
 * /api/provedores:
 *   get:
 *     summary: Buscar todos os provedores
 *     tags: [Provedores]
 *     responses:
 *       200:
 *         description: Lista de provedores
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
 *                     $ref: '#/components/schemas/Provedor'
 *                 total:
 *                   type: integer
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/', ProvedorController.getAll);

/**
 * @swagger
 * /api/provedores/{id}:
 *   get:
 *     summary: Buscar provedor por ID
 *     tags: [Provedores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do provedor
 *     responses:
 *       200:
 *         description: Provedor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Provedor'
 *       404:
 *         description: Provedor não encontrado
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
router.get('/:id', ProvedorController.getById);

/**
 * @swagger
 * /api/provedores/nome/{nome}:
 *   get:
 *     summary: Buscar provedor por nome
 *     tags: [Provedores]
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome do provedor
 *     responses:
 *       200:
 *         description: Provedor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Provedor'
 *       404:
 *         description: Provedor não encontrado
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
router.get('/nome/:nome', ProvedorController.getByNome);

/**
 * @swagger
 * /api/provedores:
 *   post:
 *     summary: Criar novo provedor
 *     tags: [Provedores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProvedor'
 *     responses:
 *       201:
 *         description: Provedor criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Provedor'
 *                 message:
 *                   type: string
 *                   example: Provedor criado com sucesso
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       409:
 *         description: Já existe um provedor com este nome
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
router.post('/', ProvedorController.create);

/**
 * @swagger
 * /api/provedores/{id}:
 *   put:
 *     summary: Atualizar provedor
 *     tags: [Provedores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do provedor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProvedor'
 *     responses:
 *       200:
 *         description: Provedor atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Provedor'
 *                 message:
 *                   type: string
 *                   example: Provedor atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Provedor não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       409:
 *         description: Já existe um provedor com este nome
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
router.put('/:id', ProvedorController.update);

/**
 * @swagger
 * /api/provedores/{id}:
 *   delete:
 *     summary: Deletar provedor
 *     tags: [Provedores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do provedor
 *     responses:
 *       200:
 *         description: Provedor deletado com sucesso
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
 *                   example: Provedor deletado com sucesso
 *       404:
 *         description: Provedor não encontrado
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
router.delete('/:id', ProvedorController.delete);

export default router;