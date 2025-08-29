import { Router } from 'express'
import { FollowupController } from '../controllers/followupController'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Followup:
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
 *     CreateFollowup:
 *       type: object
 *       required:
 *         - id_mensagem
 *         - id_lead
 *         - status
 *         - mensagem_enviada
 *       properties:
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
 *     UpdateFollowup:
 *       type: object
 *       properties:
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
 */

/**
 * @swagger
 * /api/followup:
 *   get:
 *     summary: Listar followups com paginação
 *     tags: [Followup]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Followup'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *   post:
  *     summary: Criar novo followup
  *     tags: [Followup]
  *     parameters:
  *       - in: header
  *         name: cliente_id
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
  *             $ref: '#/components/schemas/CreateFollowup'
 *     responses:
 *       201:
 *         description: Followup criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Followup'
 *                 message:
 *                   type: string
 */
router.get('/', FollowupController.listar)
router.post('/', FollowupController.criar)

// Rota específica deve vir antes das rotas com parâmetros
router.get('/leads-para-envio', FollowupController.buscarLeadsParaEnvio)

/**
 * @swagger
 * /api/followup/estatisticas-por-dia:
 *   get:
 *     summary: Buscar estatísticas de followups por dia
 *     tags: [Followup]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       data:
 *                         type: string
 *                         format: date
 *                         description: Data no formato YYYY-MM-DD
 *                       qtd_sucesso:
 *                         type: integer
 *                         description: Quantidade de followups com sucesso
 *                       qtd_erro:
 *                         type: integer
 *                         description: Quantidade de followups com erro
 *                       total:
 *                         type: integer
 *                         description: Total de followups no dia
 *       400:
 *         description: Erro na requisição
 */
router.get('/estatisticas-por-dia', FollowupController.buscarEstatisticasPorDia)

/**
 * @swagger
 * /api/followup/detalhes-por-data:
 *   get:
 *     summary: Buscar detalhes de followups por data específica
 *     tags: [Followup]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_lead:
 *                         type: string
 *                         format: uuid
 *                         description: ID do lead
 *                       nome_lead:
 *                         type: string
 *                         description: Nome do lead
 *                       telefone_lead:
 *                         type: string
 *                         description: Telefone do lead
 *                       horario:
 *                         type: string
 *                         format: date-time
 *                         description: Horário do envio
 *                       status:
 *                         type: string
 *                         enum: [sucesso, erro]
 *                         description: Status do followup
 *                       mensagem_enviada:
 *                         type: string
 *                         description: Mensagem que foi enviada
 *                       mensagem_erro:
 *                         type: string
 *                         description: Mensagem de erro (se houver)
 *       400:
 *         description: Erro na requisição
 */
router.get('/detalhes-por-data', FollowupController.buscarDetalhesPorData)

/**
 * @swagger
 * /api/followup/{id}:
 *   get:
 *     summary: Buscar followup por ID
 *     tags: [Followup]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Followup'
 *       404:
 *         description: Followup não encontrado
 *   put:
 *     summary: Atualizar followup
 *     tags: [Followup]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do followup
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFollowup'
 *     responses:
 *       200:
 *         description: Followup atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Followup'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Followup não encontrado
 *   delete:
 *     summary: Deletar followup
 *     tags: [Followup]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.get('/:id', FollowupController.buscarPorId)
router.put('/:id', FollowupController.atualizar)
router.delete('/:id', FollowupController.deletar)

/**
 * @swagger
 * /api/followup/lead/{leadId}:
 *   get:
 *     summary: Buscar followups por lead
 *     tags: [Followup]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Followup'
 */
router.get('/lead/:leadId', FollowupController.buscarPorLead)

/**
 * @swagger
 * /api/followup/status/{status}:
 *   get:
 *     summary: Buscar followups por status
 *     tags: [Followup]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Followup'
 */
router.get('/status/:status', FollowupController.buscarPorStatus)



/**
 * @swagger
 * /api/followup/leads-para-envio:
 *   get:
 *     summary: Buscar leads para envio de mensagens
 *     description: |
 *       Busca leads priorizados para envio de mensagens de followup:
 *       1. Leads com followup anterior que precisam da próxima mensagem (ordenados por data da próxima mensagem)
 *       2. Leads sem followup ainda (ordenados por data de criação)
 *     tags: [Followup]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *       - in: query
 *         name: quantidade
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Quantidade de leads a retornar
 *     responses:
 *       200:
 *         description: Leads encontrados para envio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       lead_id:
 *                         type: string
 *                         format: uuid
 *                       lead_nome:
 *                         type: string
 *                       lead_telefone:
 *                         type: string
 *                       lead_email:
 *                         type: string
 *                       lead_empresa:
 *                         type: string
 *                       lead_created_at:
 *                         type: string
 *                         format: date-time
 *                       mensagem_id:
 *                         type: string
 *                         format: uuid
 *                       mensagem_nome:
 *                         type: string
 *                       mensagem_texto:
 *                         type: string
 *                       mensagem_ordem:
 *                         type: integer
 *                       ultima_followup_data:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       proxima_mensagem_data:
 *                         type: string
 *                         format: date-time
 *                       tem_followup_anterior:
 *                         type: boolean
 *                       prioridade:
 *                         type: integer
 *                 total:
 *                   type: integer
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno do servidor
 */
export default router