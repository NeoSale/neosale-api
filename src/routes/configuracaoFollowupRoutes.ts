import { Router } from 'express'
import { ConfiguracaoFollowupController } from '../controllers/configuracaofollowupcontroller'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     DiaHorarioEnvio:
 *       type: object
 *       properties:
 *         segunda:
 *           type: string
 *           pattern: '^(\\d{2}:\\d{2}-\\d{2}:\\d{2}|fechado)$'
 *           example: "08:00-18:00"
 *           description: Horário de funcionamento na segunda-feira ou "fechado"
 *         terca:
 *           type: string
 *           pattern: '^(\\d{2}:\\d{2}-\\d{2}:\\d{2}|fechado)$'
 *           example: "08:00-18:00"
 *           description: Horário de funcionamento na terça-feira ou "fechado"
 *         quarta:
 *           type: string
 *           pattern: '^(\\d{2}:\\d{2}-\\d{2}:\\d{2}|fechado)$'
 *           example: "08:00-18:00"
 *           description: Horário de funcionamento na quarta-feira ou "fechado"
 *         quinta:
 *           type: string
 *           pattern: '^(\\d{2}:\\d{2}-\\d{2}:\\d{2}|fechado)$'
 *           example: "08:00-18:00"
 *           description: Horário de funcionamento na quinta-feira ou "fechado"
 *         sexta:
 *           type: string
 *           pattern: '^(\\d{2}:\\d{2}-\\d{2}:\\d{2}|fechado)$'
 *           example: "08:00-18:00"
 *           description: Horário de funcionamento na sexta-feira ou "fechado"
 *         sabado:
 *           type: string
 *           pattern: '^(\\d{2}:\\d{2}-\\d{2}:\\d{2}|fechado)$'
 *           example: "08:00-12:00"
 *           description: Horário de funcionamento no sábado ou "fechado"
 *         domingo:
 *           type: string
 *           pattern: '^(\\d{2}:\\d{2}-\\d{2}:\\d{2}|fechado)$'
 *           example: "fechado"
 *           description: Horário de funcionamento no domingo ou "fechado"
 *       required:
 *         - segunda
 *         - terca
 *         - quarta
 *         - quinta
 *         - sexta
 *         - sabado
 *         - domingo
 *
 *     ConfiguracaoFollowup:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único da configuração
 *         dia_horario_envio:
 *           $ref: '#/components/schemas/DiaHorarioEnvio'
 *         qtd_envio_diario:
 *           type: integer
 *           minimum: 1
 *           example: 50
 *           description: Quantidade máxima de envios por dia
 *         em_execucao:
 *           type: boolean
 *           example: false
 *           description: Indica se o follow-up está em execução
 *         ativo:
 *           type: boolean
 *           example: true
 *           description: Indica se a configuração está ativa
 *         cliente_id:
 *           type: string
 *           format: uuid
 *           description: ID do cliente proprietário da configuração
 *         cliente:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *               description: ID do cliente
 *             nome:
 *               type: string
 *               description: Nome do cliente
 *           description: Informações do cliente (disponível apenas em alguns endpoints)
 *         embedding:
 *           type: array
 *           items:
 *             type: number
 *           description: Vetor de embedding para busca semântica
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *       required:
 *         - id
 *         - dia_horario_envio
 *         - qtd_envio_diario
 *         - em_execucao
 *         - ativo
 *         - cliente_id
 *         - created_at
 *         - updated_at
 *
 *     CreateConfiguracaoFollowup:
 *       type: object
 *       properties:
 *         dia_horario_envio:
 *           $ref: '#/components/schemas/DiaHorarioEnvio'
 *         qtd_envio_diario:
 *           type: integer
 *           minimum: 1
 *           example: 50
 *           description: Quantidade máxima de envios por dia
 *         em_execucao:
 *           type: boolean
 *           example: false
 *           description: Indica se o follow-up está em execução
 *         ativo:
 *           type: boolean
 *           example: true
 *           description: Indica se a configuração está ativa
 *         cliente_id:
 *           type: string
 *           format: uuid
 *           description: ID do cliente proprietário da configuração
 *         embedding:
 *           type: array
 *           items:
 *             type: number
 *           description: Vetor de embedding para busca semântica
 *       required:
 *         - cliente_id
 *
 *     UpdateConfiguracaoFollowup:
 *       type: object
 *       properties:
 *         dia_horario_envio:
 *           $ref: '#/components/schemas/DiaHorarioEnvio'
 *         qtd_envio_diario:
 *           type: integer
 *           minimum: 1
 *           example: 50
 *           description: Quantidade máxima de envios por dia
 *         em_execucao:
 *           type: boolean
 *           example: false
 *           description: Indica se o follow-up está em execução
 *         ativo:
 *           type: boolean
 *           example: true
 *           description: Indica se a configuração está ativa
 *         cliente_id:
 *           type: string
 *           format: uuid
 *           description: ID do cliente proprietário da configuração
 *         embedding:
 *           type: array
 *           items:
 *             type: number
 *           description: Vetor de embedding para busca semântica
 *
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
 *           description: Dados retornados pela operação
 *         error:
 *           type: string
 *           description: Mensagem de erro (apenas em caso de falha)
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *           description: Lista de erros de validação (apenas em caso de falha)
 */

/**
 * @swagger
 * /api/configuracoes-followup:
 *   get:
 *     summary: Buscar configuração de follow-up por cliente
 *     tags: [Configurações Follow-up]
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
 *         description: Configuração de follow-up recuperada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ConfiguracaoFollowup'
 *                 message:
 *                   type: string
 *                   example: "Configuração de follow-up recuperada com sucesso"
 *       400:
 *         description: Dados de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "cliente_id é obrigatório no cabeçalho da requisição"
 *       404:
 *         description: Configuração não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Configuração de follow-up não encontrada para este cliente"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Erro interno do servidor"
 *                 error:
 *                   type: string
 *                   example: "Mensagem de erro detalhada"
 */
router.get('/', ConfiguracaoFollowupController.getAll)

// Rota para buscar configurações de follow-up por status ativo
router.get('/ativo', ConfiguracaoFollowupController.getByAtivo)

/**
 * @swagger
 * /api/configuracoes-followup/ativo:
 *   get:
 *     summary: Buscar configurações de follow-up por status ativo
 *     description: Retorna todas as configurações de follow-up filtradas por status ativo
 *     tags: [Configurações Follow-up]
 *     parameters:
 *       - in: query
 *         name: ativo
 *         required: true
 *         schema:
 *           type: boolean
 *         description: Status ativo das configurações (true para ativas, false para inativas)
 *         example: true
 *     responses:
 *       200:
 *         description: Configurações encontradas com sucesso
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
 *                         $ref: '#/components/schemas/ConfiguracaoFollowup'
 *       400:
 *         description: Parâmetro ativo é obrigatório
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

/**
 * @swagger
 * /api/configuracoes-followup/{em_execucao}:
 *   put:
 *     summary: Atualizar status de execução da configuração de follow-up
 *     description: Atualiza o status de execução (em_execucao) de uma configuração de follow-up específica do cliente
 *     tags: [Configurações Follow-up]
 *     parameters:
 *       - in: path
 *         name: em_execucao
 *         required: true
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: Novo status de execução (true ou false)
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente proprietário da configuração
 *     responses:
 *       200:
 *         description: Status de execução atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ConfiguracaoFollowup'
 *       400:
 *         description: Dados de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Configuração não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.put('/:em_execucao', ConfiguracaoFollowupController.updateEmExecucao)

/**
 * @swagger
 * /api/configuracoes-followup/{index}:
 *   put:
 *     summary: Atualizar índice da configuração de follow-up
 *     description: Atualiza o índice de uma configuração de follow-up específica do cliente
 *     tags: [Configurações Follow-up]
 *     parameters:
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: integer
 *         description: Novo valor do índice para a configuração
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente proprietário da configuração
 *     responses:
 *       200:
 *         description: Índice atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ConfiguracaoFollowup'
 *       400:
 *         description: Dados de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Configuração não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.put('/:index', ConfiguracaoFollowupController.updateIndex)

/**
 * @swagger
 * /api/configuracoes-followup/{id}:
 *   get:
 *     summary: Buscar configuração de follow-up por ID
 *     description: Retorna uma configuração de follow-up específica pelo seu ID
 *     tags: [Configurações Follow-up]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único da configuração de follow-up
 *     responses:
 *       200:
 *         description: Configuração encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ConfiguracaoFollowup'
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Configuração não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/:id', ConfiguracaoFollowupController.getById)



/**
 * @swagger
 * /api/configuracoes-followup:
 *   post:
 *     summary: Criar nova configuração de follow-up
 *     description: Cria uma nova configuração de follow-up no sistema
 *     tags: [Configurações Follow-up]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateConfiguracaoFollowup'
 *           example:
 *             dia_horario_envio:
 *               segunda: "08:00-18:00"
 *               terca: "08:00-18:00"
 *               quarta: "08:00-18:00"
 *               quinta: "08:00-18:00"
 *               sexta: "08:00-18:00"
 *               sabado: "08:00-12:00"
 *               domingo: "fechado"
 *             qtd_envio_diario: 50
 *             em_execucao: false
 *             cliente_id: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *     responses:
 *       201:
 *         description: Configuração criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ConfiguracaoFollowup'
 *       400:
 *         description: Dados de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/', ConfiguracaoFollowupController.create)

/**
 * @swagger
 * /api/configuracoes-followup/{id}:
 *   put:
 *     summary: Atualizar configuração de follow-up
 *     description: Atualiza uma configuração de follow-up existente
 *     tags: [Configurações Follow-up]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único da configuração de follow-up
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateConfiguracaoFollowup'
 *           example:
 *             qtd_envio_diario: 75
 *             em_execucao: true
 *     responses:
 *       200:
 *         description: Configuração atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ConfiguracaoFollowup'
 *       400:
 *         description: Dados de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Configuração não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.put('/:id', ConfiguracaoFollowupController.update)

/**
 * @swagger
 * /api/configuracoes-followup/{id}:
 *   delete:
 *     summary: Deletar configuração de follow-up
 *     description: Remove uma configuração de follow-up do sistema
 *     tags: [Configurações Follow-up]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único da configuração de follow-up
 *     responses:
 *       200:
 *         description: Configuração deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Configuração não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.delete('/:id', ConfiguracaoFollowupController.delete)

export default router