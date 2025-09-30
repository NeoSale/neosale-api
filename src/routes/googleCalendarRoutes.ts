import { Router } from 'express'
import { GoogleCalendarController } from '../controllers/googleCalendarController'
import { validateClienteId } from '../middleware/validate-cliente-id'
import { verificarTokenGoogle } from '../middleware/google-auth.middleware'

const router = Router()

// Aplicar validação de cliente_id em todas as rotas
router.use(validateClienteId)

/**
 * @swagger
 * components:
 *   schemas:
 *     GoogleCalendarIntegracao:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único da configuração
 *         cliente_id:
 *           type: string
 *           format: uuid
 *           description: ID do cliente
 *         nome:
 *           type: string
 *           description: Nome da integração
 *         client_id:
 *           type: string
 *           description: Client ID do Google OAuth
 *         client_secret:
 *           type: string
 *           description: Client Secret do Google OAuth
 *         redirect_uri:
 *           type: string
 *           format: uri
 *           description: URI de redirecionamento OAuth
 *         scope:
 *           type: string
 *           description: Escopo das permissões OAuth
 *         access_token:
 *           type: string
 *           description: Token de acesso OAuth
 *         refresh_token:
 *           type: string
 *           description: Token de atualização OAuth
 *         token_expiry:
 *           type: string
 *           format: date-time
 *           description: Data de expiração do token
 *         ativo:
 *           type: boolean
 *           description: Se a configuração está ativa
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data de atualização
 *     
 *     CreateGoogleCalendarIntegracao:
 *       type: object
 *       required:
 *         - nome
 *         - client_id
 *         - client_secret
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome da integração
 *         client_id:
 *           type: string
 *           description: Client ID do Google OAuth
 *         client_secret:
 *           type: string
 *           description: Client Secret do Google OAuth
 *         redirect_uri:
 *           type: string
 *           format: uri
 *           description: URI de redirecionamento OAuth
 *         scope:
 *           type: string
 *           description: Escopo das permissões OAuth
 *           default: "https://www.googleapis.com/auth/calendar"
 *         ativo:
 *           type: boolean
 *           description: Se a configuração está ativa
 *           default: true
 *     
 *     UpdateGoogleCalendarIntegracao:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome da integração
 *         client_id:
 *           type: string
 *           description: Client ID do Google OAuth
 *         client_secret:
 *           type: string
 *           description: Client Secret do Google OAuth
 *         redirect_uri:
 *           type: string
 *           format: uri
 *           description: URI de redirecionamento OAuth
 *         scope:
 *           type: string
 *           description: Escopo das permissões OAuth
 *         ativo:
 *           type: boolean
 *           description: Se a configuração está ativa
 *     
 *     GoogleCalendarAgendamento:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único do agendamento
 *         cliente_id:
 *           type: string
 *           format: uuid
 *           description: ID do cliente
 *         configuracao_id:
 *           type: string
 *           format: uuid
 *           description: ID da configuração utilizada
 *         google_event_id:
 *           type: string
 *           description: ID do evento no Google Calendar
 *         titulo:
 *           type: string
 *           description: Título do agendamento
 *         descricao:
 *           type: string
 *           description: Descrição do agendamento
 *         data_inicio:
 *           type: string
 *           format: date-time
 *           description: Data e hora de início
 *         data_fim:
 *           type: string
 *           format: date-time
 *           description: Data e hora de fim
 *         timezone:
 *           type: string
 *           description: Fuso horário do agendamento
 *         localizacao:
 *           type: string
 *           description: Local do agendamento
 *         participantes:
 *           type: array
 *           items:
 *             type: string
 *             format: email
 *           description: Lista de emails dos participantes
 *         status:
 *           type: string
 *           enum: [confirmed, tentative, cancelled]
 *           description: Status do agendamento
 *         visibilidade:
 *           type: string
 *           enum: [default, public, private, confidential]
 *           description: Visibilidade do agendamento
 *         lembrete_minutos:
 *           type: integer
 *           description: Minutos antes do evento para lembrete
 *         recorrencia:
 *           type: string
 *           description: Regra de recorrência
 *         link_meet:
 *           type: string
 *           format: uri
 *           description: Link do Google Meet
 *         criado_por:
 *           type: string
 *           format: email
 *           description: Email de quem criou o agendamento
 *         sincronizado:
 *           type: boolean
 *           description: Se está sincronizado com Google Calendar
 *         sincronizado_em:
 *           type: string
 *           format: date-time
 *           description: Data da última sincronização
 *         erro_sincronizacao:
 *           type: string
 *           description: Erro da última tentativa de sincronização
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data de atualização
 *     
 *     CreateGoogleCalendarAgendamento:
 *       type: object
 *       required:
 *         - titulo
 *         - data_inicio
 *         - data_fim
 *       properties:
 *         configuracao_id:
 *           type: string
 *           format: uuid
 *           description: ID da configuração (opcional, usa a ativa se não informado)
 *         titulo:
 *           type: string
 *           maxLength: 255
 *           description: Título do agendamento
 *         descricao:
 *           type: string
 *           description: Descrição do agendamento
 *         data_inicio:
 *           type: string
 *           format: date-time
 *           description: Data e hora de início
 *         data_fim:
 *           type: string
 *           format: date-time
 *           description: Data e hora de fim
 *         timezone:
 *           type: string
 *           description: Fuso horário do agendamento
 *           default: "America/Sao_Paulo"
 *         localizacao:
 *           type: string
 *           description: Local do agendamento
 *         participantes:
 *           type: array
 *           items:
 *             type: string
 *             format: email
 *           description: Lista de emails dos participantes
 *         status:
 *           type: string
 *           enum: [confirmed, tentative, cancelled]
 *           description: Status do agendamento
 *           default: "confirmed"
 *         visibilidade:
 *           type: string
 *           enum: [default, public, private, confidential]
 *           description: Visibilidade do agendamento
 *           default: "default"
 *         lembrete_minutos:
 *           type: integer
 *           minimum: 0
 *           maximum: 40320
 *           description: Minutos antes do evento para lembrete
 *           default: 15
 *         recorrencia:
 *           type: string
 *           description: Regra de recorrência
 *         criado_por:
 *           type: string
 *           format: email
 *           description: Email de quem criou o agendamento
 */

// ===== ROTAS DE CONFIGURAÇÃO =====

/**
 * @swagger
 * /api/google-calendar/integracoes:
 *   get:
 *     summary: Lista todas as Integrações do Google Calendar
 *     tags: [Google Calendar - Integrações]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           default: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Lista de Integrações retornada com sucesso
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
 *                     $ref: '#/components/schemas/GoogleCalendarIntegracao'
 *                 total:
 *                   type: integer
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/integracoes', GoogleCalendarController.listarConfiguracoes)

/**
 * @swagger
 * /api/google-calendar/integracoes/ativa:
 *   get:
 *     summary: Busca a configuração ativa do cliente
 *     tags: [Google Calendar - Integrações]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           default: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Configuração ativa encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/GoogleCalendarIntegracao'
 *       404:
 *         description: Nenhuma configuração ativa encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/integracoes/ativa', GoogleCalendarController.buscarConfiguracaoAtiva)

/**
 * @swagger
 * /api/google-calendar/integracoes/{id}:
 *   get:
 *     summary: Busca uma configuração por ID
 *     tags: [Google Calendar - Integrações]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da configuração
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           default: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Configuração encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/GoogleCalendarIntegracao'
 *       404:
 *         description: Configuração não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/integracoes/:id', GoogleCalendarController.buscarConfiguracaoPorId)

/**
 * @swagger
 * /api/google-calendar/integracoes:
 *   post:
 *     summary: Cria uma nova configuração do Google Calendar
 *     tags: [Google Calendar - Integrações]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           default: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *         description: ID do cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGoogleCalendarIntegracao'
 *     responses:
 *       201:
 *         description: Configuração criada com sucesso
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
 *                   $ref: '#/components/schemas/GoogleCalendarIntegracao'
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/integracoes', GoogleCalendarController.criarConfiguracao)

/**
 * @swagger
 * /api/google-calendar/integracoes/{id}:
 *   put:
 *     summary: Atualiza uma configuração existente
 *     tags: [Google Calendar - Integrações]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da configuração
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           default: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *         description: ID do cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGoogleCalendarIntegracao'
 *     responses:
 *       200:
 *         description: Configuração atualizada com sucesso
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
 *                   $ref: '#/components/schemas/GoogleCalendarIntegracao'
 *       404:
 *         description: Configuração não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/integracoes/:id', GoogleCalendarController.atualizarConfiguracao)

/**
 * @swagger
 * /api/google-calendar/integracoes/{id}:
 *   delete:
 *     summary: Deleta uma configuração
 *     tags: [Google Calendar - Integrações]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da configuração
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           default: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Configuração deletada com sucesso
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
 *         description: Configuração não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/integracoes/:id', GoogleCalendarController.deletarConfiguracao)

// ===== ROTAS DE AGENDAMENTOS =====

/**
 * @swagger
 * /api/google-calendar/agendamentos:
 *   get:
 *     summary: Lista todos os agendamentos
 *     tags: [Google Calendar - Agendamentos]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           default: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *         description: ID do cliente
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
 *         description: Itens por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Busca por título ou descrição
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [confirmed, tentative, cancelled]
 *         description: Filtro por status
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtro por data de início (maior ou igual)
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtro por data de fim (menor ou igual)
 *       - in: query
 *         name: sincronizado
 *         schema:
 *           type: boolean
 *         description: Filtro por status de sincronização
 *     responses:
 *       200:
 *         description: Lista de agendamentos retornada com sucesso
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
 *                     $ref: '#/components/schemas/GoogleCalendarAgendamento'
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
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/agendamentos', verificarTokenGoogle, GoogleCalendarController.listarAgendamentos)

/**
 * @swagger
 * /api/google-calendar/agendamentos/{id}:
 *   get:
 *     summary: Busca um agendamento por ID
 *     tags: [Google Calendar - Agendamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do agendamento
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           default: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Agendamento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/GoogleCalendarAgendamento'
 *       404:
 *         description: Agendamento não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/agendamentos/:id', verificarTokenGoogle, GoogleCalendarController.buscarAgendamentoPorId)

/**
 * @swagger
 * /api/google-calendar/agendamentos:
 *   post:
 *     summary: Cria um novo agendamento
 *     tags: [Google Calendar - Agendamentos]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           default: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *         description: ID do cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGoogleCalendarAgendamento'
 *     responses:
 *       201:
 *         description: Agendamento criado com sucesso
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
 *                   $ref: '#/components/schemas/GoogleCalendarAgendamento'
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/agendamentos', verificarTokenGoogle, GoogleCalendarController.criarAgendamento)

/**
 * @swagger
 * /api/google-calendar/agendamentos/{id}:
 *   put:
 *     summary: Atualiza um agendamento existente
 *     tags: [Google Calendar - Agendamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do agendamento
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           default: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *         description: ID do cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGoogleCalendarAgendamento'
 *     responses:
 *       200:
 *         description: Agendamento atualizado com sucesso
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
 *                   $ref: '#/components/schemas/GoogleCalendarAgendamento'
 *       404:
 *         description: Agendamento não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/agendamentos/:id', verificarTokenGoogle, GoogleCalendarController.atualizarAgendamento)

/**
 * @swagger
 * /api/google-calendar/agendamentos/{id}:
 *   delete:
 *     summary: Deleta um agendamento
 *     tags: [Google Calendar - Agendamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do agendamento
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           default: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Agendamento deletado com sucesso
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
 *         description: Agendamento não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/agendamentos/:id', verificarTokenGoogle, GoogleCalendarController.deletarAgendamento)

// ===== ROTAS DE AUTENTICAÇÃO E TOKENS =====

/**
 * @swagger
 * /api/google-calendar/auth/authorize:
 *   get:
 *     summary: Gera URL de autorização OAuth do Google
 *     tags: [Google Calendar - Autenticação]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           default: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: URL de autorização gerada com sucesso
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
 *                     authorization_url:
 *                       type: string
 *                       format: uri
 *                     configuracao_id:
 *                       type: string
 *                       format: uuid
 *                     redirect_uri:
 *                       type: string
 *                       format: uri
 *       404:
 *         description: Nenhuma configuração ativa encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/auth/authorize', GoogleCalendarController.gerarUrlAutorizacao)

/**
 * @swagger
 * /api/google-calendar/auth/callback:
 *   get:
 *     summary: Processa callback do OAuth e gera access token
 *     tags: [Google Calendar - Autenticação]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           default: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *         description: ID do cliente
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Código de autorização do Google
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da configuração
 *     responses:
 *       200:
 *         description: Autorização processada com sucesso
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
 *                   properties:
 *                     configuracao_id:
 *                       type: string
 *                       format: uuid
 *                     status:
 *                       type: string
 *       400:
 *         description: Código de autorização ou state não fornecido
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/auth/callback', GoogleCalendarController.processarCallback)

/**
 * @swagger
 * /api/google-calendar/integracoes/{id}/tokens:
 *   put:
 *     summary: Atualiza tokens OAuth de uma configuração
 *     tags: [Google Calendar - Autenticação]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da configuração
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           default: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *         description: ID do cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - access_token
 *             properties:
 *               access_token:
 *                 type: string
 *                 description: Token de acesso OAuth
 *               refresh_token:
 *                 type: string
 *                 description: Token de atualização OAuth
 *               token_expiry:
 *                 type: string
 *                 format: date-time
 *                 description: Data de expiração do token
 *     responses:
 *       200:
 *         description: Tokens atualizados com sucesso
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
 *                   properties:
 *                     configuracao_id:
 *                       type: string
 *                       format: uuid
 *                     token_expiry:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Configuração não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/integracoes/:id/tokens', GoogleCalendarController.atualizarTokens)

/**
 * @swagger
 * /api/google-calendar/agendamentos/{id}/sync:
 *   post:
 *     summary: Sincroniza agendamento com Google Calendar
 *     tags: [Google Calendar - Sincronização]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do agendamento
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           default: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *         description: ID do cliente
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               force_sync:
 *                 type: boolean
 *                 description: Forçar sincronização mesmo se já sincronizado
 *                 default: false
 *     responses:
 *       200:
 *         description: Agendamento sincronizado com sucesso
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
 *                   $ref: '#/components/schemas/GoogleCalendarAgendamento'
 *       404:
 *         description: Agendamento não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/agendamentos/:id/sync', verificarTokenGoogle, GoogleCalendarController.sincronizarAgendamento)

/**
 * @swagger
 * /api/google-calendar/health:
 *   get:
 *     summary: Verifica status da conexão do serviço
 *     tags: [Google Calendar - Sistema]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           default: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Status da conexão
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
 *                     database_connected:
 *                       type: boolean
 *                     service_status:
 *                       type: string
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/health', GoogleCalendarController.verificarConexao)

export default router