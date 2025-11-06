import { Router } from 'express'
import { LeadController } from '../controllers/leadController'
import { validateClienteId } from '../middleware/validate-cliente_id'

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
 *         empresa:
 *           type: string
 *         cargo:
 *           type: string
 *         contador:
 *           type: integer
 *         escritorio:
 *           type: string
 *         responsavel:
 *           type: string
 *         cnpj:
 *           type: string
 *         cpf:
 *           type: string
 *         observacao:
 *           type: string
 *         segmento:
 *           type: string
 *         erp_atual:
 *           type: string
 *         origem:
 *           type: string
 *           enum: [inbound, outbound]
 *           description: Origem do lead (inbound ou outbound). Se não informado, será usado outbound como padrão
 *         origem_id:
 *           type: string
 *           format: uuid
 *         qualificacao_id:
 *           type: string
 *           format: uuid
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
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteId'
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
 *                 total:
 *                   type: integer
 *                   description: Total de leads encontrados
 *                 message:
 *                   type: string
 */
// Rota original que recebe cliente_id via header
router.get('/', LeadController.listarLeads)

/**
 * @swagger
 * /api/leads/paginated:
 *   get:
 *     summary: Lista leads com paginação
 *     tags: [Leads]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteId'
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
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteId'
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
 *     summary: Criar um novo lead
 *     tags: [Leads]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteId'
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
 *               contador:
 *                 type: string
 *                 description: Contador (opcional)
 *               escritorio:
 *                 type: string
 *                 description: Escritório (opcional)
 *               responsavel:
 *                 type: string
 *                 description: Responsável (opcional)
 *               cnpj:
 *                 type: string
 *                 description: CNPJ (opcional)
 *               cpf:
 *                 type: string
 *                 description: CPF (opcional)
 *               observacao:
 *                 type: string
 *                 description: Observação (opcional)
 *               segmento:
 *                 type: string
 *                 description: Segmento (opcional)
 *               erp_atual:
 *                 type: string
 *                 description: ERP Atual (opcional)
 *               origem_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID da origem do lead (opcional, usa 'outbound' como padrão)
 *               qualificacao_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID da qualificação (opcional)
 *               profile_picture_url:
 *                 type: string
 *                 nullable: true
 *                 description: URL da foto de perfil do lead (opcional)
 *             required:
 *               - nome
 *               - telefone
 *             example:
 *               nome: "João Silva"
 *               telefone: "(11) 99999-9999"
 *               email: "joao@email.com"
 *               empresa: "Empresa XYZ"
 *               cargo: "Gerente"
 *               contador: "1"
 *               escritorio: "Escritório Central"
 *               responsavel: "Maria Santos"
 *               cnpj: "12.345.678/0001-90"
 *               cpf: "123.456.789-01"
 *               observacao: "Cliente interessado em ERP"
 *               segmento: "Tecnologia"
 *               erp_atual: "SAP"
 *               origem_id: "123e4567-e89b-12d3-a456-426614174000"
 *               qualificacao_id: "456e7890-e89b-12d3-a456-426614174001"
 *               profile_picture_url: "https://example.com/profile.jpg"
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
router.post('/', validateClienteId, LeadController.criarLead)

/**
 * @swagger
 * /api/leads/import:
 *   post:
 *     summary: Importa leads
 *     tags: [Leads]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteId'
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
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteId'
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
 *                       type: string
 *                       format: email
 *                       description: Email do lead (opcional)
 *                     telefone:
 *                       type: string
 *                       description: Telefone do lead
 *                   required:
 *                     - nome
 *                     - telefone
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
 *               empresa:
 *                 type: string
 *                 description: Empresa do lead
 *               cargo:
 *                 type: string
 *                 description: Cargo do lead
 *               contador:
 *                 type: string
 *                 description: Contador
 *               escritorio:
 *                 type: string
 *                 description: Escritório
 *               responsavel:
 *                 type: string
 *                 description: Responsável
 *               cnpj:
 *                 type: string
 *                 description: CNPJ
 *               cpf:
 *                 type: string
 *                 description: CPF
 *               observacao:
 *                 type: string
 *                 description: Observação
 *               segmento:
 *                 type: string
 *                 description: Segmento
 *               erp_atual:
 *                 type: string
 *                 description: ERP Atual
 *               origem_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID da origem
 *               qualificacao_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID da qualificação
 *               profile_picture_url:
 *                 type: string
 *                 nullable: true
 *                 description: URL da foto de perfil do lead
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
 *               profile_picture_url: "https://example.com/profile.jpg"
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
 * /api/leads/telefone/{telefone}:
 *   get:
 *     summary: Busca um lead específico por telefone
 *     tags: [Leads]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteId'
 *       - in: path
 *         name: telefone
 *         required: true
 *         schema:
 *           type: string
 *         description: Telefone do lead
 *         example: "5511999999999"
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
 *       400:
 *         description: Telefone não fornecido ou cliente_id é obrigatório no header
 *       404:
 *         description: Lead não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/telefone/:telefone', validateClienteId, LeadController.buscarPorTelefone)

/**
 * @swagger
 * /api/leads/debug/cliente_id:
 *   get:
 *     summary: Teste para verificar se cliente_id está sendo recebido
 *     tags: [Leads]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteId'
 *     responses:
 *       200:
 *         description: cliente_id recebido com sucesso
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
 *                     cliente_id:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *       400:
 *         description: cliente_id é obrigatório
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/debug/cliente_id', LeadController.testeClienteId)

/**
 * @swagger
 * /api/leads/{id}/ai-habilitada:
 *   put:
 *     summary: Atualizar campo ai_habilitada do lead
 *     tags: [Leads]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteId'
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
 *             required:
 *               - ai_habilitada
 *             properties:
 *               ai_habilitada:
 *                 type: boolean
 *                 description: Indica se a IA está habilitada para este lead
 *                 example: true
 *     responses:
 *       200:
 *         description: Campo ai_habilitada atualizado com sucesso
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
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     nome:
 *                       type: string
 *                     ai_habilitada:
 *                       type: boolean
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Lead não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id/ai-habilitada', validateClienteId, LeadController.atualizarAiHabilitada)

/**
 * @swagger
 * /api/leads/{id}/qualificacao:
 *   put:
 *     summary: Atualiza a qualificação de um lead pelo nome da qualificação
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
 *             required:
 *               - qualificacao
 *             properties:
 *               qualificacao:
 *                 type: string
 *                 description: Nome da qualificação
 *                 example: "Novo"
 *     responses:
 *       200:
 *         description: Qualificação do lead atualizada com sucesso
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
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     nome:
 *                       type: string
 *                     qualificacao_id:
 *                       type: string
 *                       format: uuid
 *                     qualificacao:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         nome:
 *                           type: string
 *                         descricao:
 *                           type: string
 *       400:
 *         description: Dados inválidos ou qualificação não encontrada
 *       404:
 *         description: Lead não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id/qualificacao', LeadController.atualizarQualificacao)

/**
 * @swagger
 * /api/leads/{id}:
 *   get:
 *     summary: Buscar lead por ID
 *     tags: [Leads]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteId'
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do lead
 *     responses:
 *       200:
 *         description: Lead encontrado com sucesso
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

/**
 * @swagger
 * /api/leads/relatorio/diario:
 *   get:
 *     summary: Gerar relatório diário de atualizações de leads
 *     tags: [Leads]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteId'
 *       - name: data
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-11-05"
 *         description: Data do relatório (formato YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Relatório gerado com sucesso
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
 *                   example: "Relatório diário gerado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: string
 *                       example: "2024-11-05"
 *                     periodo:
 *                       type: object
 *                       properties:
 *                         inicio:
 *                           type: string
 *                           format: date-time
 *                         fim:
 *                           type: string
 *                           format: date-time
 *                     totais:
 *                       type: object
 *                       properties:
 *                         criados:
 *                           type: integer
 *                           example: 15
 *                         atualizados:
 *                           type: integer
 *                           example: 23
 *                         deletados:
 *                           type: integer
 *                           example: 2
 *                         total:
 *                           type: integer
 *                           example: 38
 *                     distribuicao:
 *                       type: object
 *                       properties:
 *                         por_qualificacao:
 *                           type: object
 *                           example: {"Novo": 8, "Engajado": 5, "Decidido": 2}
 *                         por_origem:
 *                           type: object
 *                           example: {"WhatsApp": 10, "Site": 3, "CRM": 2}
 *                     detalhes:
 *                       type: object
 *                       properties:
 *                         leads_criados:
 *                           type: array
 *                           items:
 *                             type: object
 *                         leads_atualizados:
 *                           type: array
 *                           items:
 *                             type: object
 *                         leads_deletados:
 *                           type: array
 *                           items:
 *                             type: object
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/relatorio/diario', LeadController.gerarRelatorioDiario)

export { router as leadRoutes }