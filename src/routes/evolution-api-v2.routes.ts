import { Router } from 'express';
import { EvolutionApiV2Controller } from '../controllers/evolution-api-v2.controller';
const { body, param, query, validationResult } = require('express-validator');

// Middleware para processar erros de validação do express-validator
const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * @swagger
 * components:
 *   schemas:
 *     EvolutionApiV2Instance:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único da instância
 *         instance_name:
 *           type: string
 *           description: Nome da instância
 *         status:
 *           type: string
 *           enum: [connected, disconnected, connecting, close, error]
 *           description: Status da conexão da instância
 *         qr_code:
 *           type: string
 *           nullable: true
 *           description: Código QR para conexão
 *         webhook_url:
 *           type: string
 *           nullable: true
 *           description: URL do webhook
 *         serverUrl:
 *           type: string
 *           description: URL do servidor Evolution API V2
 *           example: "https://evo.consultor-ia.io"
 *         webhookUrl:
 *           type: string
 *           description: URL do webhook para receber eventos
 *           example: "https://evo.consultor-ia.io/webhook/whatsapp/instanceName"
 *         apiKey:
 *           type: string
 *           description: Chave de API da instância Evolution API V2
 *           example: "B6D711FCDE4D4FD5936544120E713976"
 *         cliente_id:
 *           type: string
 *           format: uuid
 *           description: ID do cliente proprietário
 *         id_agente:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID do agente responsável
 *         followup:
 *           type: boolean
 *           description: Indica se a instância está configurada para followup
 *         qtd_envios_diarios:
 *           type: integer
 *           default: 50
 *           description: Quantidade de envios diários permitidos
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *     CreateEvolutionApiV2Request:
 *       type: object
 *       required:
 *         - instance_name
 *         - integration
 *       properties:
 *         instance_name:
 *           type: string
 *           minLength: 3
 *           maxLength: 50
 *           pattern: '^[a-zA-Z0-9_-]+$'
 *           description: Nome da instância (apenas letras, números, _ e -)
 *         integration:
 *           type: string
 *           enum: ["WHATSAPP-BAILEYS", "WHATSAPP-BUSINESS"]
 *           description: Tipo de integração do WhatsApp
 *         qrcode:
 *           type: boolean
 *           default: true
 *           description: Se deve gerar QR Code para conexão
 *         id_agente:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID do agente responsável
 *         followup:
 *           type: boolean
 *           default: false
 *           description: Indica se a instância está configurada para followup
 *         qtd_envios_diarios:
 *           type: integer
 *           default: 50
 *           description: Quantidade de envios diários permitidos
 *         settings:
 *           type: object
 *           properties:
 *             reject_call:
 *               type: boolean
 *               default: false
 *               description: Rejeitar chamadas automaticamente
 *             msg_call:
 *               type: string
 *               default: ""
 *               description: Mensagem para chamadas rejeitadas
 *             groups_ignore:
 *               type: boolean
 *               default: false
 *               description: Ignorar mensagens de grupos
 *             always_online:
 *               type: boolean
 *               default: false
 *               description: Manter sempre online
 *             read_messages:
 *               type: boolean
 *               default: false
 *               description: Marcar mensagens como lidas automaticamente
 *             read_status:
 *               type: boolean
 *               default: false
 *               description: Ler status automaticamente
 *             sync_full_history:
 *               type: boolean
 *               default: false
 *               description: Sincronizar histórico completo
 *           description: Configurações da instância
 *         webhook_url:
 *           type: string
 *           format: uri
 *           nullable: true
 *           description: URL do webhook (opcional)
 *         webhook_events:
 *           type: array
 *           items:
 *             type: string
 *           default: []
 *           description: Lista de eventos do webhook
 *     EvolutionApiV2Response:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           oneOf:
 *             - $ref: '#/components/schemas/EvolutionApiV2Instance'
 *             - type: array
 *               items:
 *                 $ref: '#/components/schemas/EvolutionApiV2Instance'
 *         message:
 *           type: string
 *     SendTextRequestV2:
 *       type: object
 *       required:
 *         - number
 *         - text
 *       properties:
 *         number:
 *           type: string
 *           description: Número do destinatário (com código do país)
 *           example: "5511999999999"
 *         text:
 *           type: string
 *           description: Texto da mensagem (será processado para remover markdown e escapar caracteres especiais)
 *           example: "Olá! Esta é uma mensagem de teste."
 *     SendTextResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           description: Dados de resposta da Evolution API V2
 *         message:
 *           type: string
 *   parameters:
 *     EvolutionApiV2InstanceId:
 *       name: id
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *       description: ID da instância
 *     EvolutionApiV2InstanceName:
 *       name: instanceName
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *         minLength: 3
 *         maxLength: 50
 *         pattern: '^[a-zA-Z0-9_-]+$'
 *       description: Nome da instância
 */

const router = Router();
const evolutionApiV2Controller = new EvolutionApiV2Controller();

// Validation middleware - cliente_id agora vem via headers

const validateCreateInstance = [
  body('instanceName')
    .notEmpty()
    .withMessage('instanceName is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('instanceName must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('instanceName can only contain letters, numbers, underscores and hyphens'),
  body('integration')
    .notEmpty()
    .withMessage('integration is required')
    .isIn(['WHATSAPP-BAILEYS', 'WHATSAPP-BUSINESS'])
    .withMessage('integration must be WHATSAPP-BAILEYS or WHATSAPP-BUSINESS'),
  body('qrcode')
    .optional()
    .isBoolean()
    .withMessage('qrcode must be a boolean'),
  body('id_agente')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('id_agente must be a valid UUID'),
  body('followup')
    .optional()
    .isBoolean()
    .withMessage('followup must be a boolean'),
  body('qtd_envios_diarios')
    .optional()
    .isInt({ min: 1 })
    .withMessage('qtd_envios_diarios must be a positive integer'),
  body('settings')
    .optional()
    .isObject()
    .withMessage('settings must be an object'),
  body('settings.reject_call')
    .optional()
    .isBoolean()
    .withMessage('settings.reject_call must be a boolean'),
  body('settings.msg_call')
    .optional()
    .isString()
    .withMessage('settings.msg_call must be a string'),
  body('settings.groups_ignore')
    .optional()
    .isBoolean()
    .withMessage('settings.groups_ignore must be a boolean'),
  body('settings.always_online')
    .optional()
    .isBoolean()
    .withMessage('settings.always_online must be a boolean'),
  body('settings.read_messages')
    .optional()
    .isBoolean()
    .withMessage('settings.read_messages must be a boolean'),
  body('settings.read_status')
    .optional()
    .isBoolean()
    .withMessage('settings.read_status must be a boolean'),
  body('settings.sync_full_history')
    .optional()
    .isBoolean()
    .withMessage('settings.sync_full_history must be a boolean'),
  body('webhook_url')
    .optional({ nullable: true })
    .custom((value: any) => {
      if (value !== null && value !== '' && !value.match(/^https?:\/\/.+/)) {
        throw new Error('webhook_url must be a valid URL starting with http:// or https://');
      }
      return true;
    }),
  body('webhook_events')
    .optional()
    .isArray()
    .withMessage('webhook_events must be an array'),
  handleValidationErrors
];

const validateInstanceId = [
  param('id')
    .notEmpty()
    .withMessage('Instance ID is required'),
  handleValidationErrors
];

const validateInstanceName = [
  param('instanceName')
    .notEmpty()
    .withMessage('Instance name is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Instance name must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Instance name can only contain letters, numbers, underscores and hyphens'),
  handleValidationErrors
];

const validateGetBase64FromMediaMessage = [
  param('instance_name')
    .notEmpty()
    .withMessage('instance_name is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('instance_name must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('instance_name can only contain letters, numbers, underscores and hyphens'),
  body('message.key.id')
    .notEmpty()
    .withMessage('message.key.id is required'),
  body('convertToMp4')
    .optional()
    .isBoolean()
    .withMessage('convertToMp4 must be a boolean'),
  handleValidationErrors
];

const validateSendText = [
  param('instancename')
    .notEmpty()
    .withMessage('instancename is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('instancename must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('instancename can only contain letters, numbers, underscores and hyphens'),
  body('number')
    .notEmpty()
    .withMessage('number is required')
    .isString()
    .withMessage('number must be a string'),
  body('text')
    .notEmpty()
    .withMessage('text is required')
    .isString()
    .withMessage('text must be a string'),
  handleValidationErrors
];

const validateFetchProfilePictureUrl = [
  param('instance_name')
    .notEmpty()
    .withMessage('instance_name is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('instance_name must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('instance_name can only contain letters, numbers, underscores and hyphens'),
  body('number')
    .notEmpty()
    .withMessage('number is required')
    .isString()
    .withMessage('number must be a string'),
  handleValidationErrors
];

const validateSendPresence = [
  param('instance')
    .notEmpty()
    .withMessage('instance is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('instance must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('instance can only contain letters, numbers, underscores and hyphens'),
  body('number')
    .notEmpty()
    .withMessage('number is required')
    .isString()
    .withMessage('number must be a string'),
  body('presence')
    .notEmpty()
    .withMessage('presence is required')
    .isString()
    .withMessage('presence must be a string')
    .isIn(['composing', 'recording', 'paused'])
    .withMessage('presence must be one of: composing, recording, paused'),
  body('delay')
    .optional()
    .isInt({ min: 0 })
    .withMessage('delay must be a positive integer'),
  handleValidationErrors
];

const validateUpdateInstance = [
  body('instanceName')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('instanceName must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('instanceName can only contain letters, numbers, underscores and hyphens'),
  body('integration')
    .optional()
    .isIn(['WHATSAPP-BAILEYS', 'WHATSAPP-BUSINESS'])
    .withMessage('integration must be WHATSAPP-BAILEYS or WHATSAPP-BUSINESS'),
  body('qrcode')
    .optional()
    .isBoolean()
    .withMessage('qrcode must be a boolean'),
  body('id_agente')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('id_agente must be a valid UUID'),
  body('followup')
    .optional()
    .isBoolean()
    .withMessage('followup must be a boolean'),
  body('qtd_envios_diarios')
    .optional()
    .isInt({ min: 1 })
    .withMessage('qtd_envios_diarios must be a positive integer'),
  body('settings')
    .optional()
    .isObject()
    .withMessage('settings must be an object'),
  body('settings.reject_call')
    .optional()
    .isBoolean()
    .withMessage('settings.reject_call must be a boolean'),
  body('settings.msg_call')
    .optional()
    .isString()
    .withMessage('settings.msg_call must be a string'),
  body('settings.groups_ignore')
    .optional()
    .isBoolean()
    .withMessage('settings.groups_ignore must be a boolean'),
  body('settings.always_online')
    .optional()
    .isBoolean()
    .withMessage('settings.always_online must be a boolean'),
  body('settings.read_messages')
    .optional()
    .isBoolean()
    .withMessage('settings.read_messages must be a boolean'),
  body('settings.read_status')
    .optional()
    .isBoolean()
    .withMessage('settings.read_status must be a boolean'),
  body('settings.sync_full_history')
    .optional()
    .isBoolean()
    .withMessage('settings.sync_full_history must be a boolean'),
  body('webhook_url')
    .optional({ nullable: true })
    .custom((value: any) => {
      if (value !== null && value !== '' && !value.match(/^https?:\/\/.+/)) {
        throw new Error('webhook_url must be a valid URL starting with http:// or https://');
      }
      return true;
    }),
  body('webhook_events')
    .optional()
    .isArray()
    .withMessage('webhook_events must be an array'),
  handleValidationErrors
];

// Routes

/**
 * @swagger
 * /api/evolution-api-v2:
 *   get:
 *     summary: Listar todas as instâncias da Evolution API V2
 *     tags: [Evolution API V2]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteId'
 *     responses:
 *       200:
 *         description: Lista de instâncias recuperada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EvolutionApiV2Instance'
 *                 message:
 *                   type: string
 *                   example: Evolution API instances retrieved successfully
 *       400:
 *         description: Parâmetros inválidos
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
router.get('/', evolutionApiV2Controller.getAllInstances.bind(evolutionApiV2Controller));

/**
 * @swagger
 * /api/evolution-api-v2/{id}:
 *   get:
 *     summary: Buscar instância por ID
 *     tags: [Evolution API V2]
 *     parameters:
 *       - $ref: '#/components/parameters/EvolutionApiV2InstanceId'
 *       - $ref: '#/components/parameters/ClienteId'
 *     responses:
 *       200:
 *         description: Instância encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/EvolutionApiV2Instance'
 *                 message:
 *                   type: string
 *                   example: Evolution API instance retrieved successfully
 *       400:
 *         description: Parâmetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Instância não encontrada
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
router.get('/:id', validateInstanceId, evolutionApiV2Controller.getInstanceById.bind(evolutionApiV2Controller));

/**
 * @swagger
 * /api/evolution-api-v2/name/{instanceName}:
 *   get:
 *     summary: Buscar instância por nome
 *     tags: [Evolution API V2]
 *     parameters:
 *       - $ref: '#/components/parameters/EvolutionApiV2InstanceName'
 *       - $ref: '#/components/parameters/ClienteId'
 *     responses:
 *       200:
 *         description: Instância encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/EvolutionApiV2Instance'
 *                 message:
 *                   type: string
 *                   example: Evolution API instance retrieved successfully
 *       400:
 *         description: Parâmetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Instância não encontrada
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
router.get('/name/:instanceName', validateInstanceName, evolutionApiV2Controller.getInstanceByName.bind(evolutionApiV2Controller));

/**
 * @swagger
 * /api/evolution-api-v2:
 *   post:
 *     summary: Criar nova instância da Evolution API V2
 *     tags: [Evolution API V2]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEvolutionApiV2Request'
 *           example:
 *             instance_name: "teste"
 *             integration: "WHATSAPP-BAILEYS"
 *             qrcode: true
 *             id_agente: null
 *             followup: false
 *             qtd_envios_diarios: 50
 *             settings:
 *               reject_call: false
 *               msg_call: ""
 *               groups_ignore: false
 *               always_online: false
 *               read_messages: false
 *               read_status: false
 *               sync_full_history: false
 *             webhook_url: ""
 *             webhook_events: []
 *     responses:
 *       201:
 *         description: Instância criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/EvolutionApiV2Instance'
 *                 message:
 *                   type: string
 *                   example: Evolution API instance created successfully
 *       400:
 *         description: Dados inválidos ou instância já existe
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
router.post('/', validateCreateInstance, evolutionApiV2Controller.createInstance.bind(evolutionApiV2Controller));

/**
 * @swagger
 * /api/evolution-api-v2/{id}:
 *   delete:
 *     summary: Excluir instância da Evolution API V2
 *     tags: [Evolution API V2]
 *     parameters:
 *       - $ref: '#/components/parameters/EvolutionApiV2InstanceId'
 *       - $ref: '#/components/parameters/ClienteId'
 *     responses:
 *       200:
 *         description: Instância deletada com sucesso
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
 *                   example: Evolution API instance deleted successfully
 *       400:
 *         description: Parâmetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Instância não encontrada
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
router.delete('/:id', validateInstanceId, evolutionApiV2Controller.deleteInstance.bind(evolutionApiV2Controller));

/**
 * @swagger
 * /api/evolution-api-v2/{id}/connect:
 *   post:
 *     summary: Conectar instância da Evolution API V2
 *     tags: [Evolution API V2]
 *     parameters:
 *       - $ref: '#/components/parameters/EvolutionApiV2InstanceId'
 *       - $ref: '#/components/parameters/ClienteId'
 *     responses:
 *       200:
 *         description: Instância conectada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     qr_code:
 *                       type: string
 *                       description: QR Code para conectar o WhatsApp
 *                       example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 *                     status:
 *                       type: string
 *                       example: "connecting"
 *                 message:
 *                   type: string
 *                   example: Evolution API V2 instance connection initiated
 *       400:
 *         description: Parâmetros inválidos ou instância já conectada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Instância não encontrada
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
router.post('/:id/connect', validateInstanceId, evolutionApiV2Controller.connectInstance.bind(evolutionApiV2Controller));

/**
 * @swagger
 * /api/evolution-api-v2/disconnect/{id}:
 *   delete:
 *     summary: Desconectar uma instância do Evolution API V2
 *     description: Desconecta uma instância específica do Evolution API V2 chamando o endpoint logout/{instanceName}
 *     tags: [Evolution API V2]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da instância
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Instância desconectada com sucesso
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
 *                   example: "Instance disconnected successfully"
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Instância não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/disconnect/:id', validateInstanceId, evolutionApiV2Controller.disconnectInstance.bind(evolutionApiV2Controller));

/**
 * @swagger
 * /api/evolution-api-v2/restart/{id}:
 *   put:
 *     summary: Reiniciar uma instância do Evolution API V2
 *     description: Reinicia uma instância específica do Evolution API V2 chamando o endpoint /instance/restart
 *     tags: [Evolution API V2]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da instância
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Instância reiniciada com sucesso
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
 *                   example: "Instance restarted successfully"
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Instância não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/restart/:id', validateInstanceId, evolutionApiV2Controller.restartInstance.bind(evolutionApiV2Controller));

/**
 * @swagger
 * /api/evolution-api-v2/{id}:
 *   put:
 *     summary: Update Evolution API V2 instance
 *     description: Updates settings of a specific Evolution API V2 instance
 *     tags: [Evolution API V2]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the instance to update
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Client ID for authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               instance_name:
 *                 type: string
 *                 description: Name of the instance
 *                 example: "teste3"
 *               integration:
 *                 type: string
 *                 enum: [WHATSAPP-BAILEYS, WHATSAPP-BUSINESS]
 *                 description: Integration type
 *                 example: "WHATSAPP-BAILEYS"
 *               qrcode:
 *                 type: boolean
 *                 description: Whether to generate QR code
 *                 example: true
 *               id_agente:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: ID of the agent associated with this instance
 *                 example: null
 *               followup:
 *                 type: boolean
 *                 description: Whether this instance is for follow-up
 *                 example: false
 *               qtd_envios_diarios:
 *                 type: integer
 *                 minimum: 1
 *                 description: Daily sending limit
 *                 example: 50
 *               settings:
 *                 type: object
 *                 properties:
 *                   reject_call:
 *                     type: boolean
 *                     example: false
 *                   msg_call:
 *                     type: string
 *                     example: ""
 *                   groups_ignore:
 *                     type: boolean
 *                     example: false
 *                   always_online:
 *                     type: boolean
 *                     example: false
 *                   read_messages:
 *                     type: boolean
 *                     example: false
 *                   read_status:
 *                     type: boolean
 *                     example: false
 *                   sync_full_history:
 *                     type: boolean
 *                     example: false
 *               webhook_events:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: []
 *               webhook_url:
 *                 type: string
 *                 example: ""
 *     responses:
 *       200:
 *         description: Instance updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/EvolutionApiInstance'
 *                 message:
 *                   type: string
 *                   example: "Instance updated successfully"
 *       400:
 *         description: Bad request - Validation errors
 *       404:
 *         description: Instance not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', validateInstanceId, validateUpdateInstance, evolutionApiV2Controller.updateInstance.bind(evolutionApiV2Controller));

/**
 * @swagger
 * /api/evolution-api-v2/connect/{clientName}:
 *   get:
 *     summary: Get QR Code for instance connection
 *     tags: [Evolution API V2]
 *     parameters:
 *       - in: path
 *         name: clientName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the client instance
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Client ID for authentication
 *     responses:
 *       200:
 *         description: QR Code retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pairingCode:
 *                   type: string
 *                   nullable: true
 *                 code:
 *                   type: string
 *                 base64:
 *                   type: string
 *                 count:
 *                   type: integer
 *       400:
 *         description: Bad request - missing cliente_id header
 *       404:
 *         description: Instance not found or not owned by client
 *       500:
 *         description: Internal server error
 */
router.get('/connect/:clientName', evolutionApiV2Controller.getQRCode.bind(evolutionApiV2Controller));

/**
 * @swagger
 * /api/evolution-api-v2/cliente/{instanceName}:
 *   get:
 *     summary: Get cliente data by instance name
 *     tags: [Evolution API V2]
 *     parameters:
 *       - in: path
 *         name: instanceName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da instância
 *     responses:
 *       200:
 *         description: Cliente data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     cliente_id:
 *                       type: string
 *                       format: uuid
 *                       description: ID do cliente
 *                     nome:
 *                       type: string
 *                       description: Nome do cliente
 *                     nickname:
 *                       type: string
 *                       description: Nickname do cliente
 *                 message:
 *                   type: string
 *                   example: "Cliente data retrieved successfully"
 *       404:
 *         description: Instance not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/cliente/:instanceName', validateInstanceName, evolutionApiV2Controller.getClienteIdByInstanceName.bind(evolutionApiV2Controller));

/**
 * @swagger
 * /api/evolution-api-v2/getBase64FromMediaMessage/{instance_name}:
 *   post:
 *     tags:
 *       - Evolution API V2
 *     summary: Get base64 from media message
 *     description: Retrieve base64 data from a media message using Evolution API V2
 *     parameters:
 *       - in: path
 *         name: instance_name
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 3
 *           maxLength: 50
 *           pattern: '^[a-zA-Z0-9_-]+$'
 *         description: Nome da instância
 *       - in: header
 *         name: apikey
 *         required: true
 *         schema:
 *           type: string
 *         description: API key para autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: object
 *                 required:
 *                   - key
 *                 properties:
 *                   key:
 *                     type: object
 *                     required:
 *                       - id
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: ID da mensagem de mídia
 *               convertToMp4:
 *                 type: boolean
 *                 default: false
 *                 description: Converter para MP4 se aplicável
 *           example:
 *             message:
 *               key:
 *                 id: "message_key_id_here"
 *             convertToMp4: false
 *     responses:
 *       200:
 *         description: Media base64 retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     mediaType:
 *                       type: string
 *                       description: Tipo da mídia
 *                     size:
 *                       type: object
 *                       properties:
 *                         fileLength:
 *                           type: string
 *                           description: Tamanho do arquivo
 *                         height:
 *                           type: number
 *                           description: Altura da imagem
 *                         width:
 *                           type: number
 *                           description: Largura da imagem
 *                     mimetype:
 *                       type: string
 *                       description: Tipo MIME do arquivo
 *                     base64:
 *                       type: string
 *                       description: Dados em base64 da mídia
 *                 message:
 *                   type: string
 *                   example: "Media base64 retrieved successfully"
 *       400:
 *         description: Bad request - missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/getBase64FromMediaMessage/:instance_name', validateGetBase64FromMediaMessage, evolutionApiV2Controller.getBase64FromMediaMessage.bind(evolutionApiV2Controller));

/**
 * @swagger
 * /api/evolution-api-v2/message/sendText/{instancename}:
 *   post:
 *     summary: Enviar mensagem de texto
 *     description: Envia uma mensagem de texto através da instância especificada
 *     tags: [Evolution API V2]
 *     parameters:
 *       - name: instancename
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 3
 *           maxLength: 50
 *           pattern: '^[a-zA-Z0-9_-]+$'
 *         description: Nome da instância
 *       - name: apikey
 *         in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: Chave de API para autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendTextRequestV2'
 *     responses:
 *       200:
 *         description: Mensagem enviada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SendTextResponse'
 *       400:
 *         description: Dados inválidos ou header apikey ausente
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/message/sendText/:instancename', validateSendText, evolutionApiV2Controller.sendText.bind(evolutionApiV2Controller));

/**
 * @swagger
 * /api/evolution-api-v2/chat/fetchProfilePictureUrl/{instance_name}:
 *   post:
 *     summary: Fetch profile picture URL
 *     tags: [Evolution API V2]
 *     parameters:
 *       - in: path
 *         name: instance_name
 *         required: true
 *         schema:
 *           type: string
 *         description: Instance name
 *       - in: header
 *         name: apikey
 *         required: true
 *         schema:
 *           type: string
 *         description: API key for authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - number
 *             properties:
 *               number:
 *                 type: string
 *                 description: Phone number
 *                 example: "5511999999999"
 *     responses:
 *       200:
 *         description: Profile picture URL fetched successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/chat/fetchProfilePictureUrl/:instance_name', validateFetchProfilePictureUrl, evolutionApiV2Controller.fetchProfilePictureUrl.bind(evolutionApiV2Controller));

/**
 * @swagger
 * /api/evolution-api-v2/chat/sendPresence/{instance}:
 *   post:
 *     summary: Enviar presença no chat
 *     description: Envia uma presença (composing, recording, paused) para um número específico através da instância
 *     tags: [Evolution API V2]
 *     parameters:
 *       - name: instance
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 3
 *           maxLength: 50
 *           pattern: '^[a-zA-Z0-9_-]+$'
 *         description: Nome da instância
 *       - name: apikey
 *         in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: Chave de API para autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - number
 *               - options
 *             properties:
 *               number:
 *                 type: string
 *                 description: Número do destinatário (com código do país)
 *                 example: "5511999999999"
 *               options:
 *                 type: object
 *                 required:
 *                   - presence
 *                 properties:
 *                   presence:
 *                     type: string
 *                     enum: [composing, recording, paused]
 *                     description: Tipo de presença a ser enviada
 *                     example: "composing"
 *                   delay:
 *                     type: integer
 *                     minimum: 0
 *                     default: 1000
 *                     description: Delay em milissegundos
 *                     example: 1000
 *           example:
 *             number: "5511999999999"
 *             delay: 1000
 *             presence: "composing"
 *     responses:
 *       200:
 *         description: Presença enviada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: Dados de resposta da Evolution API V2
 *                 message:
 *                   type: string
 *                   example: "Presence sent successfully"
 *       400:
 *         description: Dados inválidos ou header apikey ausente
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
 *                   example: "Header apikey é obrigatório"
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
 *                   example: "Internal server error"
 */
router.post('/chat/sendPresence/:instance', validateSendPresence, evolutionApiV2Controller.sendPresence.bind(evolutionApiV2Controller));

/**
 * @swagger
 * /api/evolution-api-v2/chat/findContacts/{instanceName}:
 *   post:
 *     summary: Buscar contatos do WhatsApp
 *     tags: [Evolution API V2]
 *     parameters:
 *       - in: path
 *         name: instanceName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da instância
 *       - in: header
 *         name: apikey
 *         required: true
 *         schema:
 *           type: string
 *         description: API Key da Evolution API V2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - where
 *             properties:
 *               where:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID do contato (telefone)
 *                     example: "5511999999999"
 *     responses:
 *       200:
 *         description: Lista de contatos encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID do contato
 *                   pushName:
 *                     type: string
 *                     description: Nome do contato
 *                   profilePictureUrl:
 *                     type: string
 *                     description: URL da foto do perfil
 *                   owner:
 *                     type: string
 *                     description: Proprietário do contato
 *       400:
 *         description: Parâmetros inválidos
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
router.post('/chat/findContacts/:instanceName', evolutionApiV2Controller.findContacts.bind(evolutionApiV2Controller));

/**
 * @swagger
 * /api/evolution-api-v2/chat/contacts/{instanceName}:
 *   get:
 *     summary: Consultar contatos do WhatsApp conectado
 *     description: Busca contatos do WhatsApp através da instância conectada. Retorna todos os contatos se nenhum filtro for especificado, ou um contato específico se o ID for fornecido. A API Key é obtida automaticamente do arquivo .env.
 *     tags: [Evolution API V2]
 *     parameters:
 *       - in: path
 *         name: instanceName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da instância do WhatsApp
 *         example: "minha-instancia"
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: string
 *         description: ID do contato (número de telefone com código do país)
 *         example: "5511991386362@s.whatsapp.net"
 *     responses:
 *       200:
 *         description: Contatos recuperados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: ID do contato
 *                         example: "cmf7hak760upso84jucokbywq"
 *                       remoteJid:
 *                         type: string
 *                         description: JID remoto do contato
 *                         example: "5511991386362@s.whatsapp.net"
 *                       pushName:
 *                         type: string
 *                         description: Nome do contato
 *                         example: "BRAVALU Rafa"
 *                       profilePicUrl:
 *                         type: string
 *                         description: URL da foto do perfil
 *                         example: "https://pps.whatsapp.net/v/t61.24694-24/..."
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-09-05T23:40:54.594Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-09-05T23:40:54.890Z"
 *                       instanceId:
 *                         type: string
 *                         format: uuid
 *                         example: "1e93236f-81e4-4e7a-9f8a-f4543c67239c"
 *                       isGroup:
 *                         type: boolean
 *                         example: false
 *                       isSaved:
 *                         type: boolean
 *                         example: true
 *                       type:
 *                         type: string
 *                         example: "contact"
 *                 message:
 *                   type: string
 *                   example: "Contacts retrieved successfully"
 *       400:
 *         description: Parâmetros inválidos
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
 *                   example: "instanceName is required"
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
 *                   example: "Internal server error"
 */
router.get('/chat/contacts/:instanceName', evolutionApiV2Controller.getContacts.bind(evolutionApiV2Controller));

export default router;