import { Router } from 'express'
import { BaseController } from '../controllers/baseController'
import { validateClienteId } from '../middleware/validate-cliente_id'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Base:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único da base
 *         nome:
 *           type: string
 *           description: Nome da base
 *         descricao:
 *           type: string
 *           description: Descrição da base
 *         cliente_id:
 *           type: string
 *           format: uuid
 *           description: ID do cliente
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data de atualização
 *     CreateBaseInput:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome da base
 *           example: "Base Principal"
 *         descricao:
 *           type: string
 *           description: Descrição da base
 *           example: "Base de dados principal do cliente"
 *     UpdateBaseInput:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome da base
 *         descricao:
 *           type: string
 *           description: Descrição da base
 *   parameters:
 *     ClienteIdHeaderBase:
 *       in: header
 *       name: cliente_id
 *       required: false
 *       schema:
 *         type: string
 *         format: uuid
 *         default: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *       description: ID do cliente (padrão se não fornecido)
 */

/**
 * @swagger
 * /api/base:
 *   post:
 *     summary: Criar uma nova base
 *     tags: [Base]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteIdHeaderBase'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBaseInput'
 *     responses:
 *       201:
 *         description: Base criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Base'
 *                 message:
 *                   type: string
 *                   example: "Base criada com sucesso"
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', validateClienteId, BaseController.criarBase)

/**
 * @swagger
 * /api/base:
 *   get:
 *     summary: Listar bases com paginação
 *     tags: [Base]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteIdHeaderBase'
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
 *           default: 10
 *         description: Número de itens por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo de busca (nome ou descrição)
 *     responses:
 *       200:
 *         description: Lista de bases
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     bases:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Base'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         hasNext:
 *                           type: boolean
 *                         hasPrev:
 *                           type: boolean
 *                 message:
 *                   type: string
 *                   example: "Bases listadas com sucesso"
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', validateClienteId, BaseController.listarBases)

/**
 * @swagger
 * /api/base/{id}:
 *   get:
 *     summary: Buscar base por ID
 *     tags: [Base]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteIdHeaderBase'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da base
 *     responses:
 *       200:
 *         description: Base encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Base'
 *                 message:
 *                   type: string
 *                   example: "Base encontrada"
 *       404:
 *         description: Base não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', validateClienteId, BaseController.buscarPorId)

/**
 * @swagger
 * /api/base/{id}:
 *   put:
 *     summary: Atualizar base
 *     tags: [Base]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteIdHeaderBase'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da base
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBaseInput'
 *     responses:
 *       200:
 *         description: Base atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Base'
 *                 message:
 *                   type: string
 *                   example: "Base atualizada com sucesso"
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Base não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id', validateClienteId, BaseController.atualizarBase)

/**
 * @swagger
 * /api/base/{id}:
 *   delete:
 *     summary: Excluir base
 *     tags: [Base]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteIdHeaderBase'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da base
 *     responses:
 *       200:
 *         description: Base excluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                   example: "Base excluída com sucesso"
 *       404:
 *         description: Base não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', validateClienteId, BaseController.excluirBase)

export default router