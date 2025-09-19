import { Router } from 'express'
import { OrigemLeadsController } from '../controllers/origemLeadsController'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     OrigemLead:
 *       type: object
 *       required:
 *         - nome
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único da origem
 *         nome:
 *           type: string
 *           maxLength: 255
 *           description: Nome da origem
 *         cliente_id:
 *           type: string
 *           format: uuid
 *           description: ID do cliente associado
 *         embedding:
 *           type: object
 *           description: Dados de embedding para IA
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data de atualização
 *     CreateOrigemLead:
 *       type: object
 *       required:
 *         - nome
 *       properties:
 *         nome:
 *           type: string
 *           maxLength: 255
 *           description: Nome da origem
 *         cliente_id:
 *           type: string
 *           format: uuid
 *           description: ID do cliente associado
 *         embedding:
 *           type: object
 *           description: Dados de embedding para IA
 *     UpdateOrigemLead:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *           maxLength: 255
 *           description: Nome da origem
 *         cliente_id:
 *           type: string
 *           format: uuid
 *           description: ID do cliente associado
 *         embedding:
 *           type: object
 *           description: Dados de embedding para IA
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica se a operação foi bem-sucedida
 *         message:
 *           type: string
 *           description: Mensagem de resposta
 *         data:
 *           description: Dados retornados
 *         total:
 *           type: integer
 *           description: Total de registros (para listagens)
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *           description: Lista de erros de validação
 */

/**
 * @swagger
 * /api/origem-leads:
 *   get:
 *     summary: Listar todas as origens de leads
 *     tags: [Origem Leads]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         schema:
 *           type: string
 *           format: uuid
 *           default: 'f029ad69-3465-454e-ba85-e0cdb75c445f'
 *         description: ID do cliente para filtrar origens
 *     responses:
 *       200:
 *         description: Lista de origens retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/OrigemLead'
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', OrigemLeadsController.listarOrigens)

/**
 * @swagger
 * /api/origem-leads/buscar:
 *   get:
 *     summary: Buscar origem por nome
 *     tags: [Origem Leads]
 *     parameters:
 *       - in: query
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da origem para buscar
 *       - in: header
 *         name: cliente_id
 *         schema:
 *           type: string
 *           format: uuid
 *           default: 'f029ad69-3465-454e-ba85-e0cdb75c445f'
 *         description: ID do cliente para filtrar origens
 *     responses:
 *       200:
 *         description: Origem encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/OrigemLead'
 *       400:
 *         description: Parâmetro nome é obrigatório
 *       404:
 *         description: Origem não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/buscar', OrigemLeadsController.buscarOrigemPorNome)

/**
 * @swagger
 * /api/origem-leads/{id}:
 *   get:
 *     summary: Buscar origem por ID
 *     tags: [Origem Leads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da origem
 *       - in: header
 *         name: cliente_id
 *         schema:
 *           type: string
 *           format: uuid
 *           default: 'f029ad69-3465-454e-ba85-e0cdb75c445f'
 *         description: ID do cliente para filtrar origens
 *     responses:
 *       200:
 *         description: Origem encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/OrigemLead'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Origem não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', OrigemLeadsController.buscarOrigemPorId)

/**
 * @swagger
 * /api/origem-leads:
 *   post:
 *     summary: Criar nova origem de lead
 *     tags: [Origem Leads]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         schema:
 *           type: string
 *           format: uuid
 *           default: 'f029ad69-3465-454e-ba85-e0cdb75c445f'
 *         description: ID do cliente (usado se não fornecido no body)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrigemLead'
 *     responses:
 *       201:
 *         description: Origem criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/OrigemLead'
 *       400:
 *         description: Dados inválidos ou cliente ID inválido
 *       409:
 *         description: Já existe uma origem com este nome
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', OrigemLeadsController.criarOrigem)

/**
 * @swagger
 * /api/origem-leads/{id}:
 *   put:
 *     summary: Atualizar origem de lead
 *     tags: [Origem Leads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da origem
 *       - in: header
 *         name: cliente_id
 *         schema:
 *           type: string
 *           format: uuid
 *           default: 'f029ad69-3465-454e-ba85-e0cdb75c445f'
 *         description: ID do cliente para filtrar origens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrigemLead'
 *     responses:
 *       200:
 *         description: Origem atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/OrigemLead'
 *       400:
 *         description: Dados inválidos ou cliente ID inválido
 *       404:
 *         description: Origem não encontrada
 *       409:
 *         description: Já existe uma origem com este nome
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id', OrigemLeadsController.atualizarOrigem)

/**
 * @swagger
 * /api/origem-leads/{id}:
 *   delete:
 *     summary: Deletar origem de lead
 *     tags: [Origem Leads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da origem
 *       - in: header
 *         name: cliente_id
 *         schema:
 *           type: string
 *           format: uuid
 *           default: 'f029ad69-3465-454e-ba85-e0cdb75c445f'
 *         description: ID do cliente para filtrar origens
 *     responses:
 *       200:
 *         description: Origem deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Origem não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', OrigemLeadsController.deletarOrigem)

export default router