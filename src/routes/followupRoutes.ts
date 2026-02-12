import { Router } from 'express'
import { FollowupController } from '../controllers/followupController'
import { validateClienteId } from '../middleware/validate-cliente_id'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     FollowupConfig:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         cliente_id:
 *           type: string
 *           format: uuid
 *         is_active:
 *           type: boolean
 *           description: Se o follow-up automático está ativo
 *         max_attempts:
 *           type: integer
 *           description: Número máximo de tentativas de follow-up
 *           example: 3
 *         intervals:
 *           type: array
 *           items:
 *             type: integer
 *           description: Intervalos em minutos entre cada tentativa
 *           example: [30, 1440, 4320]
 *         sending_schedule:
 *           type: object
 *           description: Horário comercial por dia da semana (formato "HH:mm-HH:mm" ou "fechado")
 *           example:
 *             segunda: "08:00-18:00"
 *             terca: "08:00-18:00"
 *             quarta: "08:00-18:00"
 *             quinta: "08:00-18:00"
 *             sexta: "08:00-18:00"
 *             sabado: "fechado"
 *             domingo: "fechado"
 *         daily_send_limit:
 *           type: integer
 *           description: Limite diário de envios de follow-up
 *           example: 50
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     FollowupTracking:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         lead_id:
 *           type: string
 *           format: uuid
 *         cliente_id:
 *           type: string
 *           format: uuid
 *         status:
 *           type: string
 *           enum: [idle, waiting, in_progress, responded, exhausted, cancelled]
 *           description: Status do follow-up para este lead
 *         current_step:
 *           type: integer
 *           description: Etapa atual do follow-up (0 = não iniciado)
 *         next_send_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Próximo envio agendado
 *         last_ai_message_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Última mensagem enviada pela IA
 *         last_lead_message_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Última mensagem recebida do lead
 *         cycle_count:
 *           type: integer
 *           description: Número de ciclos de follow-up já executados
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     FollowupStats:
 *       type: object
 *       properties:
 *         active_followups:
 *           type: integer
 *           description: Quantidade de follow-ups ativos (waiting/in_progress)
 *         total_sent:
 *           type: integer
 *           description: Total de mensagens de follow-up enviadas
 *         total_responded:
 *           type: integer
 *           description: Total de leads que responderam
 *         response_rate:
 *           type: number
 *           description: Taxa de resposta (%)
 *           example: 35.5
 *         by_step:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               step:
 *                 type: integer
 *               sent:
 *                 type: integer
 *               responded:
 *                 type: integer
 */

// =============================================
// N8N ENDPOINTS (cliente_id comes in body)
// =============================================

/**
 * @swagger
 * /api/followup/trigger:
 *   post:
 *     summary: Dispara o ciclo de follow-up para um lead
 *     description: |
 *       Endpoint principal chamado pelo N8N após a IA responder ao lead.
 *       Cancela automaticamente todos os follow-ups pendentes anteriores do lead
 *       e inicia um novo ciclo de follow-up (se a config estiver ativa).
 *       Fluxo: cancela eventos anteriores → enfileira ai_message_sent → processa imediatamente.
 *     tags: [Follow-up]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lead_id
 *               - cliente_id
 *             properties:
 *               lead_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID do lead
 *               cliente_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID do cliente
 *           example:
 *             lead_id: "3a214ef7-5d7a-45b4-86a9-80c123456789"
 *             cliente_id: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *     responses:
 *       200:
 *         description: Follow-up enfileirado com sucesso
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
 *                   example: "Follow-up trigger enqueued"
 *       400:
 *         description: Dados inválidos (lead_id ou cliente_id ausente/inválido)
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/trigger', FollowupController.trigger)

/**
 * @swagger
 * /api/followup/cancel:
 *   post:
 *     summary: Cancela o follow-up de um lead (lead respondeu)
 *     description: |
 *       Chamado quando o lead envia uma mensagem. Enfileira evento lead_message_received
 *       que cancela todos os follow-ups pendentes e atualiza o tracking para "responded".
 *     tags: [Follow-up]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lead_id
 *             properties:
 *               lead_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID do lead
 *               cliente_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID do cliente (opcional, pode vir no header)
 *           example:
 *             lead_id: "3a214ef7-5d7a-45b4-86a9-80c123456789"
 *     responses:
 *       200:
 *         description: Cancelamento enfileirado com sucesso
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
 *                   example: "Follow-up cancellation enqueued"
 *       400:
 *         description: lead_id ausente ou inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/cancel', FollowupController.cancel)

/**
 * @swagger
 * /api/followup/opt-out:
 *   post:
 *     summary: Lead optou por não receber mais mensagens
 *     description: |
 *       Chamado quando o lead envia palavras como "parar" ou "cancelar".
 *       Cancela todos os follow-ups pendentes e marca o tracking como cancelled.
 *       Mantém ai_habilitada = true (BR-10).
 *     tags: [Follow-up]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lead_id
 *               - cliente_id
 *             properties:
 *               lead_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID do lead
 *               cliente_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID do cliente
 *           example:
 *             lead_id: "3a214ef7-5d7a-45b4-86a9-80c123456789"
 *             cliente_id: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *     responses:
 *       200:
 *         description: Opt-out enfileirado com sucesso
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
 *                   example: "Opt-out enqueued"
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/opt-out', FollowupController.optOut)

// =============================================
// CRM ENDPOINTS (cliente_id comes in header)
// =============================================

/**
 * @swagger
 * /api/followup/config:
 *   get:
 *     summary: Busca a configuração de follow-up do cliente
 *     tags: [Follow-up]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteId'
 *     responses:
 *       200:
 *         description: Configuração encontrada (ou null se não existir)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/FollowupConfig'
 *       500:
 *         description: Erro interno do servidor
 *   put:
 *     summary: Cria ou atualiza a configuração de follow-up
 *     tags: [Follow-up]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_active:
 *                 type: boolean
 *                 description: Ativar/desativar follow-up automático
 *               max_attempts:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 description: Número máximo de tentativas
 *               intervals:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   minimum: 1
 *                 description: Intervalos em minutos entre cada tentativa
 *               sending_schedule:
 *                 type: object
 *                 description: Horário comercial por dia da semana
 *                 properties:
 *                   segunda:
 *                     type: string
 *                     example: "08:00-18:00"
 *                   terca:
 *                     type: string
 *                     example: "08:00-18:00"
 *                   quarta:
 *                     type: string
 *                     example: "08:00-18:00"
 *                   quinta:
 *                     type: string
 *                     example: "08:00-18:00"
 *                   sexta:
 *                     type: string
 *                     example: "08:00-18:00"
 *                   sabado:
 *                     type: string
 *                     example: "fechado"
 *                   domingo:
 *                     type: string
 *                     example: "fechado"
 *               daily_send_limit:
 *                 type: integer
 *                 minimum: 1
 *                 description: Limite diário de envios
 *           example:
 *             is_active: true
 *             max_attempts: 3
 *             intervals: [30, 1440, 4320]
 *             sending_schedule:
 *               segunda: "08:00-18:00"
 *               terca: "08:00-18:00"
 *               quarta: "08:00-18:00"
 *               quinta: "08:00-18:00"
 *               sexta: "08:00-18:00"
 *               sabado: "fechado"
 *               domingo: "fechado"
 *             daily_send_limit: 50
 *     responses:
 *       200:
 *         description: Configuração salva com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/FollowupConfig'
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/config', validateClienteId, FollowupController.getConfig)
router.put('/config', validateClienteId, FollowupController.updateConfig)

/**
 * @swagger
 * /api/followup/tracking/{leadId}:
 *   get:
 *     summary: Busca o tracking de follow-up de um lead
 *     tags: [Follow-up]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteId'
 *       - in: path
 *         name: leadId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do lead
 *     responses:
 *       200:
 *         description: Tracking encontrado (ou null se não existir)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/FollowupTracking'
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/tracking/:leadId', validateClienteId, FollowupController.getTracking)

/**
 * @swagger
 * /api/followup/tracking/{leadId}/cancel:
 *   post:
 *     summary: Cancela manualmente o follow-up de um lead (via CRM)
 *     description: |
 *       Enfileira um evento lead_message_received para cancelar o follow-up.
 *       Mesmo efeito que se o lead tivesse respondido.
 *     tags: [Follow-up]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteId'
 *       - in: path
 *         name: leadId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do lead
 *     responses:
 *       200:
 *         description: Follow-up cancelado com sucesso
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
 *                   example: "Follow-up cancelled for lead"
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/tracking/:leadId/cancel', validateClienteId, FollowupController.cancelTracking)

/**
 * @swagger
 * /api/followup/stats:
 *   get:
 *     summary: Busca estatísticas de follow-up do cliente
 *     tags: [Follow-up]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteId'
 *     responses:
 *       200:
 *         description: Estatísticas de follow-up
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/FollowupStats'
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/stats', validateClienteId, FollowupController.getStats)

export default router
