import { Router } from 'express'
import { LeadController } from '../controllers/leadController'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Lead:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         nome:
 *           type: string
 *         email:
 *           type: string
 *         telefone:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *     PaginationResponse:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *         limit:
 *           type: integer
 *         total:
 *           type: integer
 *         totalPages:
 *           type: integer
 *         hasNext:
 *           type: boolean
 *         hasPrev:
 *           type: boolean
 */

/**
 * @swagger
 * /api/leads:
 *   get:
 *     summary: Lista todos os leads
 *     tags: [Leads]
 *     responses:
 *       200:
 *         description: Lista de leads
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
 *                     $ref: '#/components/schemas/Lead'
 *                 message:
 *                   type: string
 */
router.get('/', LeadController.listarLeads)

/**
 * @swagger
 * /api/leads/paginated:
 *   get:
 *     summary: Lista leads com paginação
 *     tags: [Leads]
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
 *           maximum: 100
 *         description: Itens por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo de busca
 *     responses:
 *       200:
 *         description: Lista paginada de leads
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
 *                     $ref: '#/components/schemas/Lead'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 *                 message:
 *                   type: string
 */
router.get('/paginated', LeadController.listarLeadsPaginados)

/**
 * @swagger
 * /api/leads/stats:
 *   get:
 *     summary: Obter estatísticas dos leads
 *     tags: [Leads]
 *     responses:
 *       200:
 *         description: Estatísticas dos leads
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                       description: Total de leads
 *                     withEmail:
 *                       type: number
 *                       description: Leads com email
 *                     qualified:
 *                       type: number
 *                       description: Leads qualificados
 *                     new:
 *                       type: number
 *                       description: Leads novos (últimos 7 dias)
 *                     byStatus:
 *                       type: object
 *                       additionalProperties:
 *                         type: number
 *                       description: Leads agrupados por status
 *                 message:
 *                   type: string
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/stats', LeadController.obterEstatisticas)

/**
 * @swagger
 * /api/leads:
 *   post:
 *     summary: Cria um novo lead
 *     tags: [Leads]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome do lead
 *               telefone:
 *                 type: string
 *                 description: Telefone do lead
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do lead (opcional)
 *               empresa:
 *                 type: string
 *                 description: Empresa do lead (opcional)
 *               cargo:
 *                 type: string
 *                 description: Cargo do lead (opcional)
 *               origem_id:
                 type: string
                 format: uuid
                 description: ID da origem do lead (opcional, usa 'outbound' como padrão)
 *             required:
               - nome
               - telefone
 *             example:
 *               nome: "João Silva"
 *               telefone: "(11) 99999-9999"
 *               email: "joao@email.com"
 *               empresa: "Empresa XYZ"
 *               cargo: "Gerente"
 *               origem_id: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       201:
 *         description: Lead criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Lead'
 *       400:
 *         description: Dados inválidos ou lead já existe
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', LeadController.criarLead)

/**
 * @swagger
 * /api/leads/import:
 *   post:
 *     summary: Importa leads
 *     tags: [Leads]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leads:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nome:
 *                       type: string
 *                     email:
 *                       type: string
 *                     telefone:
 *                       type: string
 *     responses:
 *       201:
 *         description: Leads importados com sucesso
 */
router.post('/import', LeadController.importLeads)

/**
 * @swagger
 * /api/leads/bulk:
 *   post:
 *     summary: Importa leads em lote (bulk)
 *     tags: [Leads]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leads:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nome:
 *                       type: string
 *                       description: Nome do lead
 *                     email:
                       type: string
                       format: email
                       description: Email do lead (opcional)
                     telefone:
                       type: string
                       description: Telefone do lead
                   required:
                     - nome
                     - telefone
 *             example:
 *               leads:
 *                 - nome: "Bruno 01"
 *                   email: "bruno01@bruno.com"
 *                   telefone: "11982212127"
 *                 - nome: "Bruno 02"
 *                   telefone: "11982212128"
 *     responses:
 *       201:
 *         description: Leads importados em lote com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Lead'
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/bulk', LeadController.bulkImportLeads)

/**
 * @swagger
 * /api/leads/import/info:
 *   get:
 *     summary: Obtém informações sobre importação
 *     tags: [Leads]
 *     responses:
 *       200:
 *         description: Informações de importação
 */
router.get('/import/info', LeadController.getImportInfo)

/**
 * @swagger
 * /api/leads/{id}/agendar:
 *   post:
 *     summary: Agenda um lead
 *     tags: [Leads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data_agendamento:
 *                 type: string
 *                 format: date-time
 *               observacoes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lead agendado com sucesso
 */
router.post('/:id/agendar', LeadController.agendarLead)

/**
 * @swagger
 * /api/leads/{id}/mensagem:
 *   post:
 *     summary: Envia mensagem para um lead
 *     tags: [Leads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mensagem:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 enum: [whatsapp, email, sms]
 *     responses:
 *       200:
 *         description: Mensagem enviada com sucesso
 */
router.post('/:id/mensagem', LeadController.enviarMensagem)

/**
 * @swagger
 * /api/leads/{id}/etapa:
 *   put:
 *     summary: Atualiza etapa do funil do lead
 *     tags: [Leads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               etapa_funil_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Etapa atualizada com sucesso
 */
router.put('/:id/etapa', LeadController.atualizarEtapa)

/**
 * @swagger
 * /api/leads/{id}/status:
 *   put:
 *     summary: Atualiza status de negociação do lead
 *     tags: [Leads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status_negociacao_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 */
router.put('/:id/status', LeadController.atualizarStatus)

/**
 * @swagger
 * /api/leads/{id}:
 *   put:
 *     summary: Atualiza um lead
 *     tags: [Leads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do lead
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome do lead
 *               telefone:
 *                 type: string
 *                 description: Telefone do lead
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do lead
 *               origem_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID da origem
 *               status_agendamento:
 *                 type: boolean
 *                 description: Status de agendamento
 *               etapa_funil_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID da etapa do funil
 *               status_negociacao_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID do status de negociação
 *             example:
 *               nome: "João Silva"
 *               telefone: "(11) 99999-9999"
 *               email: "joao@email.com"
 *     responses:
 *       200:
 *         description: Lead atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Lead'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Lead não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id', LeadController.atualizarLead)

/**
 * @swagger
 * /api/leads/{id}:
 *   delete:
 *     summary: Exclui um lead
 *     tags: [Leads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do lead
 *     responses:
 *       200:
 *         description: Lead excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Lead não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', LeadController.excluirLead)

/**
 * @swagger
 * /api/leads/{id}/mensagem:
 *   put:
 *     summary: Atualiza status de mensagem enviada do lead
 *     tags: [Leads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do lead
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo_mensagem:
 *                 type: string
 *                 enum: [mensagem_1, mensagem_2, mensagem_3]
 *                 description: Tipo da mensagem a ser atualizada
 *               enviada:
 *                 type: boolean
 *                 description: Status de envio da mensagem
 *               data:
 *                 type: string
 *                 format: date-time
 *                 description: Data e hora do envio (opcional)
 *             required:
 *               - tipo_mensagem
 *               - enviada
 *             example:
 *               tipo_mensagem: "mensagem_1"
 *               enviada: true
 *               data: "2024-01-15T10:30:00Z"
 *     responses:
 *       200:
 *         description: Status de mensagem atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Lead não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id/mensagem', LeadController.atualizarMensagem)

/**
 * @swagger
 * /api/leads/{id}:
 *   get:
 *     summary: Busca um lead específico por ID
 *     tags: [Leads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do lead
 *     responses:
 *       200:
 *         description: Lead encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Lead'
 *       404:
 *         description: Lead não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', LeadController.buscarLead)

export { router as leadRoutes }