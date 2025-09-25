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
 *         - cliente_id
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único da qualificação
 *         nome:
 *           type: string
 *           maxLength: 255
 *           description: Nome da qualificação
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
 *     CreateQualificacao:
 *       type: object
 *       required:
 *         - nome
 *       properties:
 *         nome:
 *           type: string
 *           maxLength: 255
 *           description: Nome da qualificação
 *         cliente_id:
 *           type: string
 *           format: uuid
 *           description: ID do cliente associado
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
 *         cliente_id:
 *           type: string
 *           format: uuid
 *           description: ID do cliente associado
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
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           default: 'f029ad69-3465-454e-ba85-e0cdb75c445f'
 *         description: ID do cliente para filtrar qualificações
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
 *       400:
 *         description: cliente_id é obrigatório
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
 *       - in: header
 *         name: cliente_id
 *         schema:
 *           type: string
 *           format: uuid
 *           default: 'f029ad69-3465-454e-ba85-e0cdb75c445f'
 *         description: ID do cliente para filtrar qualificações
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
 *       - in: header
 *         name: cliente_id
 *         schema:
 *           type: string
 *           format: uuid
 *           default: 'f029ad69-3465-454e-ba85-e0cdb75c445f'
 *         description: ID do cliente para filtrar qualificações
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
 *         description: Dados inválidos ou cliente ID inválido
 *       404:
 *         description: Qualificação não encontrada
 *       409:
 *         description: Já existe uma qualificação com este nome para este cliente
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
 *       - in: header
 *         name: cliente_id
 *         schema:
 *           type: string
 *           format: uuid
 *           default: 'f029ad69-3465-454e-ba85-e0cdb75c445f'
 *         description: ID do cliente para filtrar qualificações
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