import { Router } from 'express';
import { RevendedorController } from '../controllers/revendedorController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Revendedor:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único do revendedor
 *         nome:
 *           type: string
 *           description: Nome do revendedor
 *         email:
 *           type: string
 *           format: email
 *           description: Email do revendedor
 *         telefone:
 *           type: string
 *           nullable: true
 *           description: Telefone do revendedor
 *         endereco:
 *           type: string
 *           nullable: true
 *           description: Endereço do revendedor
 *         status:
 *           type: string
 *           enum: [ativo, inativo, suspenso]
 *           description: Status do revendedor
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data de atualização
 *     CreateRevendedor:
 *       type: object
 *       required:
 *         - nome
 *         - email
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome do revendedor
 *         email:
 *           type: string
 *           format: email
 *           description: Email do revendedor
 *         telefone:
 *           type: string
 *           description: Telefone do revendedor
 *         endereco:
 *           type: string
 *           description: Endereço do revendedor
 *         status:
 *           type: string
 *           enum: [ativo, inativo, suspenso]
 *           default: ativo
 *           description: Status do revendedor
 *     UpdateRevendedor:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome do revendedor
 *         email:
 *           type: string
 *           format: email
 *           description: Email do revendedor
 *         telefone:
 *           type: string
 *           description: Telefone do revendedor
 *         endereco:
 *           type: string
 *           description: Endereço do revendedor
 *         status:
 *           type: string
 *           enum: [ativo, inativo, suspenso]
 *           description: Status do revendedor
 */

/**
 * @swagger
 * /api/revendedores:
 *   get:
 *     summary: Buscar todos os revendedores
 *     tags: [Revendedores]
 *     responses:
 *       200:
 *         description: Lista de revendedores
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
 *                     $ref: '#/components/schemas/Revendedor'
 *                 total:
 *                   type: integer
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/', RevendedorController.getAll);

/**
 * @swagger
 * /api/revendedores/{id}:
 *   get:
 *     summary: Buscar revendedor por ID
 *     tags: [Revendedores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do revendedor
 *     responses:
 *       200:
 *         description: Revendedor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Revendedor'
 *       404:
 *         description: Revendedor não encontrado
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
router.get('/:id', RevendedorController.getById);

/**
 * @swagger
 * /api/revendedores/email/{email}:
 *   get:
 *     summary: Buscar revendedor por email
 *     tags: [Revendedores]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email do revendedor
 *     responses:
 *       200:
 *         description: Revendedor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Revendedor'
 *       404:
 *         description: Revendedor não encontrado
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
router.get('/email/:email', RevendedorController.getByEmail);

/**
 * @swagger
 * /api/revendedores/status/{status}:
 *   get:
 *     summary: Buscar revendedores por status
 *     tags: [Revendedores]
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ativo, inativo, suspenso]
 *         description: Status do revendedor
 *     responses:
 *       200:
 *         description: Lista de revendedores com o status especificado
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
 *                     $ref: '#/components/schemas/Revendedor'
 *                 total:
 *                   type: integer
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/status/:status', RevendedorController.getByStatus);

/**
 * @swagger
 * /api/revendedores:
 *   post:
 *     summary: Criar novo revendedor
 *     tags: [Revendedores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRevendedor'
 *     responses:
 *       201:
 *         description: Revendedor criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Revendedor'
 *                 message:
 *                   type: string
 *                   example: Revendedor criado com sucesso
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       409:
 *         description: Já existe um revendedor com este email
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
router.post('/', RevendedorController.create);

/**
 * @swagger
 * /api/revendedores/{id}:
 *   put:
 *     summary: Atualizar revendedor
 *     tags: [Revendedores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do revendedor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRevendedor'
 *     responses:
 *       200:
 *         description: Revendedor atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Revendedor'
 *                 message:
 *                   type: string
 *                   example: Revendedor atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Revendedor não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       409:
 *         description: Já existe um revendedor com este email
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
router.put('/:id', RevendedorController.update);

/**
 * @swagger
 * /api/revendedores/{id}:
 *   delete:
 *     summary: Deletar revendedor
 *     tags: [Revendedores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do revendedor
 *     responses:
 *       200:
 *         description: Revendedor deletado com sucesso
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
 *                   example: Revendedor deletado com sucesso
 *       404:
 *         description: Revendedor não encontrado
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
router.delete('/:id', RevendedorController.delete);

export default router;