import { Router } from 'express'
import { FollowupControllerOld } from '../controllers/followupControllerOld'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     FollowupOld:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único do followup
 *         id_mensagem:
 *           type: string
 *           format: uuid
 *           description: ID da mensagem referenciada
 *         id_lead:
 *           type: string
 *           format: uuid
 *           description: ID do lead que recebeu a mensagem
 *         status:
 *           type: string
 *           enum: [sucesso, erro]
 *           description: Status do envio da mensagem
 *         erro:
 *           type: string
 *           description: Mensagem de erro (quando status = erro)
 *         mensagem_enviada:
 *           type: string
 *           description: Texto da mensagem que foi enviada
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data de atualização
 */

/**
 * @swagger
 * /api/followup:
 *   get:
 *     summary: Listar followups com paginação (OLD - Deprecated)
 *     tags: [Follow-up Old]
 *     deprecated: true
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Itens por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por mensagem ou status
 *     responses:
 *       200:
 *         description: Lista de followups
 *   post:
 *     summary: Criar novo followup (OLD - Deprecated)
 *     tags: [Follow-up Old]
 *     deprecated: true
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *     responses:
 *       201:
 *         description: Followup criado com sucesso
 */
router.get('/', FollowupControllerOld.listarOld)
router.post('/', FollowupControllerOld.criarOld)

// Rota específica deve vir antes das rotas com parâmetros
router.get('/leads-para-envio', FollowupControllerOld.buscarLeadsParaEnvioOld)

/**
 * @swagger
 * /api/followup/estatisticas-por-dia:
 *   get:
 *     summary: Buscar estatísticas de followups por dia (OLD - Deprecated)
 *     tags: [Follow-up Old]
 *     deprecated: true
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Estatísticas encontradas com sucesso
 */
router.get('/estatisticas-por-dia', FollowupControllerOld.buscarEstatisticasPorDiaOld)

/**
 * @swagger
 * /api/followup/detalhes-por-data:
 *   get:
 *     summary: Buscar detalhes de followups por data específica (OLD - Deprecated)
 *     tags: [Follow-up Old]
 *     deprecated: true
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *       - in: query
 *         name: data
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data no formato YYYY-MM-DD
 *     responses:
 *       200:
 *         description: Detalhes encontrados com sucesso
 */
router.get('/detalhes-por-data', FollowupControllerOld.buscarDetalhesPorDataOld)

/**
 * @swagger
 * /api/followup/{id}:
 *   get:
 *     summary: Buscar followup por ID (OLD - Deprecated)
 *     tags: [Follow-up Old]
 *     deprecated: true
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do followup
 *     responses:
 *       200:
 *         description: Followup encontrado
 *       404:
 *         description: Followup não encontrado
 *   put:
 *     summary: Atualizar followup (OLD - Deprecated)
 *     tags: [Follow-up Old]
 *     deprecated: true
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do followup
 *     responses:
 *       200:
 *         description: Followup atualizado com sucesso
 *   delete:
 *     summary: Deletar followup (OLD - Deprecated)
 *     tags: [Follow-up Old]
 *     deprecated: true
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do followup
 *     responses:
 *       200:
 *         description: Followup deletado com sucesso
 */
router.get('/:id', FollowupControllerOld.buscarPorIdOld)
router.put('/:id', FollowupControllerOld.atualizarOld)
router.delete('/:id', FollowupControllerOld.deletarOld)

/**
 * @swagger
 * /api/followup/lead/{leadId}:
 *   get:
 *     summary: Buscar followups por lead (OLD - Deprecated)
 *     tags: [Follow-up Old]
 *     deprecated: true
 *     parameters:
 *       - in: path
 *         name: leadId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do lead
 *     responses:
 *       200:
 *         description: Followups do lead
 */
router.get('/lead/:leadId', FollowupControllerOld.buscarPorLeadOld)

/**
 * @swagger
 * /api/followup/status/{status}:
 *   get:
 *     summary: Buscar followups por status (OLD - Deprecated)
 *     tags: [Follow-up Old]
 *     deprecated: true
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [sucesso, erro]
 *         description: Status do followup
 *     responses:
 *       200:
 *         description: Followups por status
 */
router.get('/status/:status', FollowupControllerOld.buscarPorStatusOld)

export default router
