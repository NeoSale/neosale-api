import { Router } from 'express';
import { EvolutionApiController } from '../controllers/evolution-api.controller';
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
 *     EvolutionApiInstance:
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
 *           description: URL do servidor Evolution API
 *           example: "https://evo.consultor-ia.io"
 *         webhookUrl:
 *           type: string
 *           description: URL do webhook para receber eventos
 *           example: "https://evo.consultor-ia.io/webhook/whatsapp/instanceName"
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
 *           description: Data da última atualização
 *     CreateEvolutionApiRequest:
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
 *     EvolutionApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           oneOf:
 *             - $ref: '#/components/schemas/EvolutionApiInstance'
 *             - type: array
 *               items:
 *                 $ref: '#/components/schemas/EvolutionApiInstance'
 *         message:
 *           type: string
 *   parameters:
 *     EvolutionApiInstanceId:
 *       name: id
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *       description: ID da instância
 *     EvolutionApiInstanceName:
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
const evolutionApiController = new EvolutionApiController();

// Validation middleware - cliente_id agora vem via headers

const validateCreateInstance = [
  body('instance_name')
    .notEmpty()
    .withMessage('instance_name is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('instance_name must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('instance_name can only contain letters, numbers, underscores and hyphens'),
  body('integration')
    .notEmpty()
    .withMessage('integration is required')
    .isIn(['WHATSAPP-BAILEYS', 'WHATSAPP-BUSINESS'])
    .withMessage('integration must be WHATSAPP-BAILEYS or WHATSAPP-BUSINESS'),
  body('qrcode')
    .optional()
    .isBoolean()
    .withMessage('qrcode must be a boolean'),
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
      if (value === null || value === undefined || value === '') {
        return true;
      }
      if (typeof value === 'string' && /^https?:\/\/.+/.test(value)) {
        return true;
      }
      throw new Error('webhook_url must be a valid URL or null');
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

const validateUpdateInstance = [
  body('instance_name')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('instance_name must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('instance_name can only contain letters, numbers, underscores and hyphens'),
  body('integration')
    .optional()
    .isIn(['WHATSAPP-BAILEYS', 'WHATSAPP-BUSINESS'])
    .withMessage('integration must be WHATSAPP-BAILEYS or WHATSAPP-BUSINESS'),
  body('qrcode')
    .optional()
    .isBoolean()
    .withMessage('qrcode must be a boolean'),
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
 * /api/evolution-api:
 *   get:
 *     summary: Listar todas as instâncias da Evolution API
 *     tags: [Evolution API]
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
 *                     $ref: '#/components/schemas/EvolutionApiInstance'
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
router.get('/', evolutionApiController.getAllInstances.bind(evolutionApiController));

/**
 * @swagger
 * /api/evolution-api/{id}:
 *   get:
 *     summary: Buscar instância por ID
 *     tags: [Evolution API]
 *     parameters:
 *       - $ref: '#/components/parameters/EvolutionApiInstanceId'
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
 *                   $ref: '#/components/schemas/EvolutionApiInstance'
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
router.get('/:id', validateInstanceId, evolutionApiController.getInstanceById.bind(evolutionApiController));

/**
 * @swagger
 * /api/evolution-api/name/{instanceName}:
 *   get:
 *     summary: Buscar instância por nome
 *     tags: [Evolution API]
 *     parameters:
 *       - $ref: '#/components/parameters/EvolutionApiInstanceName'
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
 *                   $ref: '#/components/schemas/EvolutionApiInstance'
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
router.get('/name/:instanceName', validateInstanceName, evolutionApiController.getInstanceByName.bind(evolutionApiController));

/**
 * @swagger
 * /api/evolution-api:
 *   post:
 *     summary: Criar nova instância da Evolution API
 *     tags: [Evolution API]
 *     parameters:
 *       - $ref: '#/components/parameters/ClienteId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEvolutionApiRequest'
 *           example:
 *             instance_name: "teste"
 *             integration: "WHATSAPP-BAILEYS"
 *             qrcode: true
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
 *                   $ref: '#/components/schemas/EvolutionApiInstance'
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
router.post('/', validateCreateInstance, evolutionApiController.createInstance.bind(evolutionApiController));

/**
 * @swagger
 * /api/evolution-api/{id}:
 *   delete:
 *     summary: Deletar instância da Evolution API
 *     tags: [Evolution API]
 *     parameters:
 *       - $ref: '#/components/parameters/EvolutionApiInstanceId'
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
router.delete('/:id', validateInstanceId, evolutionApiController.deleteInstance.bind(evolutionApiController));

/**
 * @swagger
 * /api/evolution-api/{id}/connect:
 *   post:
 *     summary: Conectar instância da Evolution API
 *     tags: [Evolution API]
 *     parameters:
 *       - $ref: '#/components/parameters/EvolutionApiInstanceId'
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
 *                   example: Evolution API instance connection initiated
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
router.post('/:id/connect', validateInstanceId, evolutionApiController.connectInstance.bind(evolutionApiController));

/**
 * @swagger
 * /api/evolution-api/disconnect/{id}:
 *   delete:
 *     summary: Desconectar uma instância do Evolution API
 *     description: Desconecta uma instância específica do Evolution API chamando o endpoint logout/{instanceName}
 *     tags: [Evolution API]
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
router.delete('/disconnect/:id', validateInstanceId, evolutionApiController.disconnectInstance.bind(evolutionApiController));

/**
 * @swagger
 * /api/evolution-api/restart/{id}:
 *   put:
 *     summary: Reiniciar uma instância do Evolution API
 *     description: Reinicia uma instância específica do Evolution API chamando o endpoint /instance/restart
 *     tags: [Evolution API]
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
router.put('/restart/:id', validateInstanceId, evolutionApiController.restartInstance.bind(evolutionApiController));

/**
 * @swagger
 * /api/evolution-api/{id}:
 *   put:
 *     summary: Update Evolution API instance
 *     description: Updates settings of a specific Evolution API instance
 *     tags: [Evolution API]
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
router.put('/:id', validateInstanceId, validateUpdateInstance, evolutionApiController.updateInstance.bind(evolutionApiController));

/**
 * @swagger
 * /api/evolution-api/connect/{clientName}:
 *   get:
 *     summary: Get QR Code for instance connection
 *     tags: [Evolution API]
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
router.get('/connect/:clientName', evolutionApiController.getQRCode.bind(evolutionApiController));

/**
 * @swagger
 * /api/evolution-api/cliente/{instanceName}:
 *   get:
 *     summary: Get cliente_id by instance name
 *     tags: [Evolution API]
 *     parameters:
 *       - in: path
 *         name: instanceName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da instância
 *     responses:
 *       200:
 *         description: Cliente ID retrieved successfully
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
 *                 message:
 *                   type: string
 *                   example: "Cliente ID retrieved successfully"
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
router.get('/cliente/:instanceName', validateInstanceName, evolutionApiController.getClienteIdByInstanceName.bind(evolutionApiController));

/**
 * @swagger
 * /api/evolution-api/getBase64FromMediaMessage/{instance_name}:
 *   post:
 *     tags:
 *       - Evolution API
 *     summary: Get base64 from media message
 *     description: Retrieve base64 data from a media message using Evolution API
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
router.post('/getBase64FromMediaMessage/:instance_name', validateGetBase64FromMediaMessage, evolutionApiController.getBase64FromMediaMessage.bind(evolutionApiController));

export default router;