import { Router } from 'express';
import { ClienteController } from '../controllers/clienteController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Cliente:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único do cliente
 *         nome:
 *           type: string
 *           description: Nome do cliente
 *         email:
 *           type: string
 *           format: email
 *           description: Email do cliente
 *         telefone:
 *           type: string
 *           nullable: true
 *           description: Telefone do cliente
 *         endereco:
 *           type: string
 *           nullable: true
 *           description: Endereço do cliente
 *         revendedor_id:
 *           type: string
 *           format: uuid
 *           description: ID do revendedor associado
 *         status:
 *           type: string
 *           enum: [ativo, inativo, suspenso]
 *           description: Status do cliente
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data de atualização
 *         revendedor:
 *           type: object
 *           nullable: true
 *           description: Dados do revendedor associado
 *     CreateCliente:
 *       type: object
 *       required:
 *         - nome
 *         - email
 *         - revendedor_id
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome do cliente
 *         email:
 *           type: string
 *           format: email
 *           description: Email do cliente
 *         telefone:
 *           type: string
 *           description: Telefone do cliente
 *         endereco:
 *           type: string
 *           description: Endereço do cliente
 *         revendedor_id:
 *           type: string
 *           format: uuid
 *           description: ID do revendedor associado
 *         status:
 *           type: string
 *           enum: [ativo, inativo, suspenso]
 *           default: ativo
 *           description: Status do cliente
 *     UpdateCliente:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome do cliente
 *         email:
 *           type: string
 *           format: email
 *           description: Email do cliente
 *         telefone:
 *           type: string
 *           description: Telefone do cliente
 *         endereco:
 *           type: string
 *           description: Endereço do cliente
 *         revendedor_id:
 *           type: string
 *           format: uuid
 *           description: ID do revendedor associado
 *         status:
 *           type: string
 *           enum: [ativo, inativo, suspenso]
 *           description: Status do cliente
 */

/**
 * @swagger
 * /api/clientes/all:
 *   get:
 *     summary: Buscar todos os clientes sem filtros
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Lista de todos os clientes
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
 *                     $ref: '#/components/schemas/Cliente'
 *                 total:
 *                   type: integer
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/all', ClienteController.getAllClientes);

/**
 * @swagger
 * /api/clientes:
 *   get:
 *     summary: Buscar todos os clientes
 *     tags: [Clientes]
 *     parameters:
 *       - in: header
 *         name: revendedor_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do revendedor
 *     responses:
 *       200:
 *         description: Lista de clientes
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
 *                     $ref: '#/components/schemas/Cliente'
 *                 total:
 *                   type: integer
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/', ClienteController.getAll);

/**
 * @swagger
 * /api/clientes/{id}:
 *   get:
 *     summary: Buscar cliente por ID
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Cliente'
 *       404:
 *         description: Cliente não encontrado
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
router.get('/:id', ClienteController.getById);

/**
 * @swagger
 * /api/clientes/email/{email}:
 *   get:
 *     summary: Buscar cliente por email
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email do cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Cliente'
 *       404:
 *         description: Cliente não encontrado
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
router.get('/email/:email', ClienteController.getByEmail);

/**
 * @swagger
 * /api/clientes/revendedor/{revendedorId}:
 *   get:
 *     summary: Buscar clientes por revendedor
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: revendedorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do revendedor
 *     responses:
 *       200:
 *         description: Lista de clientes do revendedor
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
 *                     $ref: '#/components/schemas/Cliente'
 *                 total:
 *                   type: integer
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/revendedor/:revendedorId', ClienteController.getByRevendedor);

/**
 * @swagger
 * /api/clientes/status/{status}:
 *   get:
 *     summary: Buscar clientes por status
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ativo, inativo, suspenso]
 *         description: Status do cliente
 *     responses:
 *       200:
 *         description: Lista de clientes com o status especificado
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
 *                     $ref: '#/components/schemas/Cliente'
 *                 total:
 *                   type: integer
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/status/:status', ClienteController.getByStatus);

/**
 * @swagger
 * /api/clientes:
 *   post:
 *     summary: Criar novo cliente
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCliente'
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Cliente'
 *                 message:
 *                   type: string
 *                   example: Cliente criado com sucesso
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       409:
 *         description: Já existe um cliente com este email
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
router.post('/', ClienteController.create);

/**
 * @swagger
 * /api/clientes/{id}:
 *   put:
 *     summary: Atualizar cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
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
 *             $ref: '#/components/schemas/UpdateCliente'
 *     responses:
 *       200:
 *         description: Cliente atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Cliente'
 *                 message:
 *                   type: string
 *                   example: Cliente atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Cliente não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       409:
 *         description: Já existe um cliente com este email
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
router.put('/:id', ClienteController.update);

/**
 * @swagger
 * /api/clientes/{id}:
 *   delete:
 *     summary: Deletar cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Cliente deletado com sucesso
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
 *                   example: Cliente deletado com sucesso
 *       404:
 *         description: Cliente não encontrado
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
router.delete('/:id', ClienteController.delete);

export default router;