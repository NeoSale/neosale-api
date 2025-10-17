import { Router } from 'express';
import { TipoAgenteController } from '../controllers/tipoAgenteController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TipoAgente:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único do tipo de agente
 *         nome:
 *           type: string
 *           description: Nome do tipo de agente
 *         ativo:
 *           type: boolean
 *           description: Se o tipo de agente está ativo
 *         embedding:
 *           type: array
 *           items:
 *             type: number
 *           nullable: true
 *           description: Vetor de embedding para o tipo de agente
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *     CreateTipoAgenteRequest:
 *       type: object
 *       required:
 *         - nome
 *       properties:
 *         nome:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           description: Nome do tipo de agente
 *         ativo:
 *           type: boolean
 *           default: true
 *           description: Se o tipo de agente está ativo
 *         embedding:
 *           type: array
 *           items:
 *             type: number
 *           description: Vetor de embedding para o tipo de agente
 *     UpdateTipoAgenteRequest:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           description: Nome do tipo de agente
 *         ativo:
 *           type: boolean
 *           description: Se o tipo de agente está ativo
 *         embedding:
 *           type: array
 *           items:
 *             type: number
 *           description: Vetor de embedding para o tipo de agente
 */

/**
 * @swagger
 * /api/tipos-agente:
 *   get:
 *     summary: Lista todos os tipos de agente
 *     tags: [Tipos de Agente]
 *     responses:
 *       200:
 *         description: Lista de tipos de agente retornada com sucesso
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
 *                     $ref: '#/components/schemas/TipoAgente'
 *                 total:
 *                   type: number
 *                   description: Total de registros
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', TipoAgenteController.getAll);

/**
 * @swagger
 * /api/tipos-agente/ativos:
 *   get:
 *     summary: Lista todos os tipos de agente ativos
 *     tags: [Tipos de Agente]
 *     responses:
 *       200:
 *         description: Lista de tipos de agente ativos retornada com sucesso
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
 *                     $ref: '#/components/schemas/TipoAgente'
 *                 total:
 *                   type: number
 *                   description: Total de registros
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/ativos', TipoAgenteController.getAtivos);

/**
 * @swagger
 * /api/tipos-agente/{id}:
 *   get:
 *     summary: Busca um tipo de agente por ID
 *     tags: [Tipos de Agente]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do tipo de agente
 *     responses:
 *       200:
 *         description: Tipo de agente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TipoAgente'
 *       400:
 *         description: ID não fornecido
 *       404:
 *         description: Tipo de agente não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', TipoAgenteController.getById);

/**
 * @swagger
 * /api/tipos-agente/nome/{nome}:
 *   get:
 *     summary: Busca um tipo de agente por nome
 *     tags: [Tipos de Agente]
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome do tipo de agente
 *     responses:
 *       200:
 *         description: Tipo de agente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TipoAgente'
 *       400:
 *         description: Nome não fornecido
 *       404:
 *         description: Tipo de agente não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/nome/:nome', TipoAgenteController.getByNome);

/**
 * @swagger
 * /api/tipos-agente:
 *   post:
 *     summary: Cria um novo tipo de agente
 *     tags: [Tipos de Agente]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTipoAgenteRequest'
 *     responses:
 *       201:
 *         description: Tipo de agente criado com sucesso
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
 *                   example: Tipo de agente criado com sucesso
 *                 data:
 *                   $ref: '#/components/schemas/TipoAgente'
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Tipo de agente já existe
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', TipoAgenteController.create);

/**
 * @swagger
 * /api/tipos-agente/{id}:
 *   put:
 *     summary: Atualiza um tipo de agente
 *     tags: [Tipos de Agente]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do tipo de agente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTipoAgenteRequest'
 *     responses:
 *       200:
 *         description: Tipo de agente atualizado com sucesso
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
 *                   example: Tipo de agente atualizado com sucesso
 *                 data:
 *                   $ref: '#/components/schemas/TipoAgente'
 *       400:
 *         description: Dados inválidos ou ID não fornecido
 *       404:
 *         description: Tipo de agente não encontrado
 *       409:
 *         description: Nome já existe
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id', TipoAgenteController.update);

/**
 * @swagger
 * /api/tipos-agente/{id}:
 *   delete:
 *     summary: Deleta um tipo de agente
 *     tags: [Tipos de Agente]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do tipo de agente
 *     responses:
 *       200:
 *         description: Tipo de agente deletado com sucesso
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
 *                   example: Tipo de agente deletado com sucesso
 *                 data:
 *                   $ref: '#/components/schemas/TipoAgente'
 *       400:
 *         description: ID não fornecido
 *       404:
 *         description: Tipo de agente não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', TipoAgenteController.delete);

export default router;