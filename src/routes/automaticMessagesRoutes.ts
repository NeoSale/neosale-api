import { Router } from 'express'
import { AutomaticMessagesController } from '../controllers/automaticMessagesController'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     AutomaticMessage:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único da mensagem automática
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
 *     CreateAutomaticMessage:
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
 *     UpdateAutomaticMessage:
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
 *     AutomaticMessagesConfig:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único da configuração
 *         dia_horario_envio:
 *           type: object
 *           description: Horários de envio por dia da semana
 *           properties:
 *             segunda:
 *               type: string
 *               example: "08:00-18:00"
 *             terca:
 *               type: string
 *               example: "08:00-18:00"
 *             quarta:
 *               type: string
 *               example: "08:00-18:00"
 *             quinta:
 *               type: string
 *               example: "08:00-18:00"
 *             sexta:
 *               type: string
 *               example: "08:00-18:00"
 *             sabado:
 *               type: string
 *               example: "08:00-12:00"
 *             domingo:
 *               type: string
 *               example: "fechado"
 *         qtd_envio_diario:
 *           type: integer
 *           description: Quantidade máxima de envios por dia
 *           example: 50
 *         em_execucao:
 *           type: boolean
 *           description: Indica se o envio está em execução
 *         ativo:
 *           type: boolean
 *           description: Indica se a configuração está ativa
 *         cliente_id:
 *           type: string
 *           format: uuid
 *           description: ID do cliente proprietário
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data de atualização
 *     CreateAutomaticMessagesConfig:
 *       type: object
 *       required:
 *         - cliente_id
 *       properties:
 *         dia_horario_envio:
 *           type: object
 *           description: Horários de envio por dia da semana
 *         qtd_envio_diario:
 *           type: integer
 *           description: Quantidade máxima de envios por dia
 *         ativo:
 *           type: boolean
 *           description: Indica se a configuração está ativa
 *         cliente_id:
 *           type: string
 *           format: uuid
 *           description: ID do cliente proprietário
 *     UpdateAutomaticMessagesConfig:
 *       type: object
 *       properties:
 *         dia_horario_envio:
 *           type: object
 *           description: Horários de envio por dia da semana
 *         qtd_envio_diario:
 *           type: integer
 *           description: Quantidade máxima de envios por dia
 *         ativo:
 *           type: boolean
 *           description: Indica se a configuração está ativa
 *         em_execucao:
 *           type: boolean
 *           description: Indica se o envio está em execução
 */

/**
 * @swagger
 * /api/automatic-messages:
 *   get:
 *     summary: Listar mensagens automáticas com paginação
 *     tags: [Automatic Messages]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
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
 *         description: Lista de mensagens automáticas
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
 *                     $ref: '#/components/schemas/AutomaticMessage'
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
 *     summary: Criar nova mensagem automática
 *     tags: [Automatic Messages]
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
 *             $ref: '#/components/schemas/CreateAutomaticMessage'
 *     responses:
 *       201:
 *         description: Mensagem automática criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AutomaticMessage'
 *                 message:
 *                   type: string
 */
router.get('/', AutomaticMessagesController.listar)
router.post('/', AutomaticMessagesController.criar)

// Rota específica deve vir antes das rotas com parâmetros
router.get('/leads-para-envio', AutomaticMessagesController.buscarLeadsParaEnvio)

/**
 * @swagger
 * /api/automatic-messages/estatisticas-por-dia:
 *   get:
 *     summary: Buscar estatísticas de mensagens automáticas por dia
 *     tags: [Automatic Messages]
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
 *                         description: Quantidade de mensagens com sucesso
 *                       qtd_erro:
 *                         type: integer
 *                         description: Quantidade de mensagens com erro
 *                       total:
 *                         type: integer
 *                         description: Total de mensagens no dia
 *       400:
 *         description: Erro na requisição
 */
router.get('/estatisticas-por-dia', AutomaticMessagesController.buscarEstatisticasPorDia)

/**
 * @swagger
 * /api/automatic-messages/detalhes-por-data:
 *   get:
 *     summary: Buscar detalhes de mensagens automáticas por data específica
 *     tags: [Automatic Messages]
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
 *                         description: Status da mensagem
 *                       mensagem_enviada:
 *                         type: string
 *                         description: Mensagem que foi enviada
 *                       mensagem_erro:
 *                         type: string
 *                         description: Mensagem de erro (se houver)
 *       400:
 *         description: Erro na requisição
 */
router.get('/detalhes-por-data', AutomaticMessagesController.buscarDetalhesPorData)

// =====================================================
// ROTAS DE CONFIGURAÇÃO (devem vir ANTES de /:id)
// =====================================================

/**
 * @swagger
 * /api/automatic-messages/configuracao:
 *   get:
 *     summary: Buscar configuração de mensagens automáticas por cliente
 *     description: Retorna a configuração de mensagens automáticas do cliente especificado no header
 *     tags: [Automatic Messages - Configuração]
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
 *         description: Configuração encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AutomaticMessagesConfig'
 *                 message:
 *                   type: string
 *       400:
 *         description: cliente_id não fornecido ou inválido
 *       404:
 *         description: Configuração não encontrada para este cliente
 *       500:
 *         description: Erro interno do servidor
 *   post:
 *     summary: Criar configuração de mensagens automáticas
 *     description: Cria uma nova configuração de mensagens automáticas para um cliente
 *     tags: [Automatic Messages - Configuração]
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
 *             $ref: '#/components/schemas/CreateAutomaticMessagesConfig'
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
 *                 data:
 *                   $ref: '#/components/schemas/AutomaticMessagesConfig'
 *                 message:
 *                   type: string
 *       400:
 *         description: Dados de entrada inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/configuracao', AutomaticMessagesController.getConfiguracao)
router.post('/configuracao', AutomaticMessagesController.createConfiguracao)

/**
 * @swagger
 * /api/automatic-messages/configuracao/ativo:
 *   get:
 *     summary: Buscar configurações por status ativo
 *     description: Retorna todas as configurações de mensagens automáticas filtradas por status ativo/inativo
 *     tags: [Automatic Messages - Configuração]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *       - in: query
 *         name: ativo
 *         required: true
 *         schema:
 *           type: boolean
 *         description: Status ativo (true/false)
 *     responses:
 *       200:
 *         description: Configurações encontradas com sucesso
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
 *                     $ref: '#/components/schemas/AutomaticMessagesConfig'
 *                 message:
 *                   type: string
 *       400:
 *         description: Parâmetro ativo não fornecido
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/configuracao/ativo', AutomaticMessagesController.getConfiguracaoByAtivo)

/**
 * @swagger
 * /api/automatic-messages/configuracao/{id}:
 *   get:
 *     summary: Buscar configuração por ID
 *     description: Retorna uma configuração de mensagens automáticas específica pelo seu ID
 *     tags: [Automatic Messages - Configuração]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da configuração
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
 *                   $ref: '#/components/schemas/AutomaticMessagesConfig'
 *                 message:
 *                   type: string
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Configuração não encontrada
 *       500:
 *         description: Erro interno do servidor
 *   put:
 *     summary: Atualizar configuração por ID
 *     description: Atualiza uma configuração de mensagens automáticas existente
 *     tags: [Automatic Messages - Configuração]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da configuração
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAutomaticMessagesConfig'
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
 *                 data:
 *                   $ref: '#/components/schemas/AutomaticMessagesConfig'
 *                 message:
 *                   type: string
 *       400:
 *         description: Dados de entrada inválidos ou cliente_id não fornecido
 *       404:
 *         description: Configuração não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/configuracao/:id', AutomaticMessagesController.getConfiguracaoById)
router.put('/configuracao/:id', AutomaticMessagesController.updateConfiguracaoById)

/**
 * @swagger
 * /api/automatic-messages/{id}:
 *   get:
 *     summary: Buscar mensagem automática por ID
 *     tags: [Automatic Messages]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da mensagem automática
 *     responses:
 *       200:
 *         description: Mensagem automática encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AutomaticMessage'
 *       404:
 *         description: Mensagem automática não encontrada
 *   put:
 *     summary: Atualizar mensagem automática
 *     tags: [Automatic Messages]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da mensagem automática
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAutomaticMessage'
 *     responses:
 *       200:
 *         description: Mensagem automática atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AutomaticMessage'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Mensagem automática não encontrada
 *   delete:
 *     summary: Deletar mensagem automática
 *     tags: [Automatic Messages]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da mensagem automática
 *     responses:
 *       200:
 *         description: Mensagem automática deletada com sucesso
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
router.get('/:id', AutomaticMessagesController.buscarPorId)
router.put('/:id', AutomaticMessagesController.atualizar)
router.delete('/:id', AutomaticMessagesController.deletar)

/**
 * @swagger
 * /api/automatic-messages/lead/{leadId}:
 *   get:
 *     summary: Buscar mensagens automáticas por lead
 *     tags: [Automatic Messages]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *       - in: path
 *         name: leadId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do lead
 *     responses:
 *       200:
 *         description: Mensagens automáticas do lead
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
 *                     $ref: '#/components/schemas/AutomaticMessage'
 */
router.get('/lead/:leadId', AutomaticMessagesController.buscarPorLead)

/**
 * @swagger
 * /api/automatic-messages/status/{status}:
 *   get:
 *     summary: Buscar mensagens automáticas por status
 *     tags: [Automatic Messages]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [sucesso, erro]
 *         description: Status da mensagem automática
 *     responses:
 *       200:
 *         description: Mensagens automáticas por status
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
 *                     $ref: '#/components/schemas/AutomaticMessage'
 */
router.get('/status/:status', AutomaticMessagesController.buscarPorStatus)



/**
 * @swagger
 * /api/automatic-messages/leads-para-envio:
 *   get:
 *     summary: Buscar leads para envio de mensagens
 *     description: |
 *       Busca leads priorizados para envio de mensagens automáticas:
 *       1. Leads com mensagem anterior que precisam da próxima mensagem (ordenados por data da próxima mensagem)
 *       2. Leads sem mensagem ainda (ordenados por data de criação)
 *     tags: [Automatic Messages]
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
 *                       lead_ai_habilitada:
 *                         type: boolean
 *                         description: Indica se a IA está habilitada para este lead
 *                       mensagem_id:
 *                         type: string
 *                         format: uuid
 *                       mensagem_nome:
 *                         type: string
 *                       mensagem_texto:
 *                         type: string
 *                       mensagem_ordem:
 *                         type: integer
 *                       ultima_mensagem_data:
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
