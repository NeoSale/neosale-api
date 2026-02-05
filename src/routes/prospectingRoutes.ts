import { Router } from 'express'
import { ProspectingController } from '../controllers/prospectingController'
import { SequenceController } from '../controllers/sequenceController'

const router = Router()

// ========== STATS ==========

/**
 * @swagger
 * /api/prospecting/stats:
 *   get:
 *     summary: Retorna estatísticas gerais da prospecção
 *     tags: [Prospecção]
 *     responses:
 *       200:
 *         description: Estatísticas retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProspectStats'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/stats', ProspectingController.getStats)

// ========== SETORES ==========

/**
 * @swagger
 * /api/prospecting/setores:
 *   get:
 *     summary: Lista setores ativos das sequencias de prospeccao
 *     description: Retorna setores distintos que possuem sequencias ativas em prospection_sequences
 *     tags: [Prospecção]
 *     responses:
 *       200:
 *         description: Lista de setores ativos
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
 *                     type: string
 *                   example: [clinicas, energia_solar, imobiliarias]
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/setores', ProspectingController.getSetores)

// ========== PROSPECTS ==========

/**
 * @swagger
 * /api/prospecting/prospects:
 *   get:
 *     summary: Lista prospects com filtros e paginação
 *     tags: [Prospecção]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [novo, contato_enviado, conexao_aceita, respondeu, qualificado, em_negociacao, cliente, desqualificado]
 *         description: Filtrar por status do prospect
 *       - in: query
 *         name: setor
 *         schema:
 *           type: string
 *           enum: [clinicas, energia_solar, imobiliarias]
 *         description: Filtrar por setor
 *       - in: query
 *         name: min_score
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *         description: Score mínimo para filtro
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Busca por nome, cargo ou empresa
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página atual
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Itens por página
 *     responses:
 *       200:
 *         description: Lista de prospects
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
 *                     $ref: '#/components/schemas/LinkedInProspect'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/prospects', ProspectingController.getProspects)

/**
 * @swagger
 * /api/prospecting/prospects/{id}:
 *   get:
 *     summary: Retorna um prospect por ID
 *     tags: [Prospecção]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do prospect
 *     responses:
 *       200:
 *         description: Prospect encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/LinkedInProspect'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/prospects/:id', ProspectingController.getProspectById)

/**
 * @swagger
 * /api/prospecting/prospects/{id}:
 *   patch:
 *     summary: Atualiza campos de um prospect
 *     tags: [Prospecção]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do prospect
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProspectRequest'
 *     responses:
 *       200:
 *         description: Prospect atualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/LinkedInProspect'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/prospects/:id', ProspectingController.updateProspect)

/**
 * @swagger
 * /api/prospecting/prospects/{id}/route-maya:
 *   post:
 *     summary: Roteia prospect para SDR Maya (WhatsApp)
 *     description: Envia o prospect para atendimento automatizado via WhatsApp pela Maya
 *     tags: [Prospecção]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do prospect
 *     responses:
 *       200:
 *         description: Prospect roteado para Maya com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/prospects/:id/route-maya', ProspectingController.routeToMaya)

/**
 * @swagger
 * /api/prospecting/prospects/{id}/brief:
 *   post:
 *     summary: Gera briefing com IA para o prospect
 *     description: Usa IA para gerar um resumo de qualificação do prospect
 *     tags: [Prospecção]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do prospect
 *     responses:
 *       200:
 *         description: Briefing gerado com sucesso
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
 *                     brief:
 *                       type: string
 *                       description: Texto do briefing gerado pela IA
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/prospects/:id/brief', ProspectingController.generateBrief)

// ========== MANUAL TRIGGERS ==========

/**
 * @swagger
 * /api/prospecting/run:
 *   post:
 *     summary: Executa prospecção manual
 *     description: Dispara o processo de prospecção ativa manualmente
 *     tags: [Prospecção]
 *     responses:
 *       200:
 *         description: Prospecção executada com sucesso
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
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/run', ProspectingController.triggerProspecting)

/**
 * @swagger
 * /api/prospecting/qualify:
 *   post:
 *     summary: Executa qualificação manual
 *     description: Dispara o processo de qualificação de prospects manualmente
 *     tags: [Prospecção]
 *     responses:
 *       200:
 *         description: Qualificação executada com sucesso
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
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/qualify', ProspectingController.triggerQualification)

// ========== ACTIVITIES ==========

/**
 * @swagger
 * /api/prospecting/activities:
 *   get:
 *     summary: Lista atividades de prospecção
 *     tags: [Prospecção]
 *     parameters:
 *       - in: query
 *         name: prospect_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por prospect
 *       - in: query
 *         name: acao
 *         schema:
 *           type: string
 *           enum: [conexao_enviada, conexao_aceita, dms_enviada, resposta_recebida, qualificacao_executada, whatsapp_enviado, status_alterado, nota_adicionada]
 *         description: Filtrar por tipo de ação
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Limite de registros
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset para paginação
 *     responses:
 *       200:
 *         description: Lista de atividades
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
 *                     $ref: '#/components/schemas/ProspectionActivity'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/activities', ProspectingController.getActivities)

// ========== SCHEDULER ==========

/**
 * @swagger
 * /api/prospecting/scheduler/status:
 *   get:
 *     summary: Retorna status do scheduler de prospecção
 *     tags: [Prospecção]
 *     responses:
 *       200:
 *         description: Status do scheduler
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SchedulerStatus'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/scheduler/status', ProspectingController.getSchedulerStatus)

// ========== SEQUENCES ==========

/**
 * @swagger
 * /api/prospecting/sequences:
 *   get:
 *     summary: Lista todas as sequências de prospecção
 *     tags: [Sequências]
 *     responses:
 *       200:
 *         description: Lista de sequências
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
 *                     $ref: '#/components/schemas/ProspectionSequence'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/sequences', SequenceController.getSequences)

/**
 * @swagger
 * /api/prospecting/sequences/{id}:
 *   get:
 *     summary: Retorna uma sequência por ID
 *     tags: [Sequências]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da sequência
 *     responses:
 *       200:
 *         description: Sequência encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProspectionSequence'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/sequences/:id', SequenceController.getSequenceById)

/**
 * @swagger
 * /api/prospecting/sequences:
 *   post:
 *     summary: Cria uma nova sequência de prospecção
 *     tags: [Sequências]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSequenceRequest'
 *     responses:
 *       201:
 *         description: Sequência criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProspectionSequence'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/sequences', SequenceController.createSequence)

/**
 * @swagger
 * /api/prospecting/sequences/{id}:
 *   put:
 *     summary: Atualiza uma sequência existente
 *     tags: [Sequências]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da sequência
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSequenceRequest'
 *     responses:
 *       200:
 *         description: Sequência atualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProspectionSequence'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/sequences/:id', SequenceController.updateSequence)

/**
 * @swagger
 * /api/prospecting/sequences/{id}:
 *   delete:
 *     summary: Remove uma sequência de prospecção
 *     tags: [Sequências]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da sequência
 *     responses:
 *       200:
 *         description: Sequência removida com sucesso
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
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/sequences/:id', SequenceController.deleteSequence)

export default router
