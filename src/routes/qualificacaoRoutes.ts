import { Router } from 'express'
import { QualificacaoController } from '../controllers/qualificacaoController'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Qualificacao:
 *       type: object
 *       required:
 *         - nome
 *         - tipo_agente
 *         - descricao
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único da qualificação
 *         nome:
 *           type: string
 *           maxLength: 255
 *           description: Nome da qualificação
 *         tipo_agente:
 *           type: array
 *           items:
 *             type: string
 *           description: Tipos de agente que podem usar esta qualificação
 *         descricao:
 *           type: string
 *           description: Descrição detalhada da qualificação
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
 *     CreateQualificacao:
 *       type: object
 *       required:
 *         - nome
 *         - tipo_agente
 *         - descricao
 *       properties:
 *         nome:
 *           type: string
 *           maxLength: 255
 *           description: Nome da qualificação
 *         tipo_agente:
 *           type: array
 *           items:
 *             type: string
 *           description: Tipos de agente que podem usar esta qualificação
 *         descricao:
 *           type: string
 *           description: Descrição detalhada da qualificação
 *         embedding:
 *           type: object
 *           description: Dados de embedding para IA
 *     UpdateQualificacao:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *           maxLength: 255
 *           description: Nome da qualificação
 *         tipo_agente:
 *           type: array
 *           items:
 *             type: string
 *           description: Tipos de agente que podem usar esta qualificação
 *         descricao:
 *           type: string
 *           description: Descrição detalhada da qualificação
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica se a operação foi bem-sucedida
 *         message:
 *           type: string
 *           description: Mensagem descritiva do resultado
 *         data:
 *           type: object
 *           description: Dados retornados pela operação
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *           description: Lista de erros de validação (quando aplicável)
 */

/**
 * @swagger
 * /api/qualificacoes:
 *   get:
 *     summary: Listar qualificações
 *     tags: [Qualificações]
 *     responses:
 *       200:
 *         description: Lista de qualificações retornada com sucesso
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
 *                         $ref: '#/components/schemas/Qualificacao'
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', QualificacaoController.listarQualificacoes)

/**
 * @swagger
 * /api/qualificacoes/{id}:
 *   get:
 *     summary: Buscar qualificação por ID
 *     tags: [Qualificações]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da qualificação
 *     responses:
 *       200:
 *         description: Qualificação encontrada
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Qualificacao'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Qualificação não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', QualificacaoController.buscarQualificacaoPorId)

/**
 * @swagger
 * /api/qualificacoes:
 *   post:
 *     summary: Criar nova qualificação
 *     tags: [Qualificações]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateQualificacao'
 *     responses:
 *       201:
 *         description: Qualificação criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Qualificacao'
 *       400:
 *         description: Dados inválidos ou cliente ID inválido
 *       409:
 *         description: Já existe uma qualificação com este nome para este cliente
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', QualificacaoController.criarQualificacao)

/**
 * @swagger
 * /api/qualificacoes/{id}:
 *   put:
 *     summary: Atualizar qualificação
 *     tags: [Qualificações]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da qualificação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateQualificacao'
 *     responses:
 *       200:
 *         description: Qualificação atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Qualificacao'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Qualificação não encontrada
 *       409:
 *         description: Já existe uma qualificação com este nome
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id', QualificacaoController.atualizarQualificacao)

/**
 * @swagger
 * /api/qualificacoes/{id}:
 *   delete:
 *     summary: Deletar qualificação
 *     tags: [Qualificações]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da qualificação
 *     responses:
 *       200:
 *         description: Qualificação deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Qualificação não encontrada
 *       409:
 *         description: Qualificação está sendo usada por leads e não pode ser deletada
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', QualificacaoController.deletarQualificacao)

export default router