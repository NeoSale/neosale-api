import { Router } from 'express';
import { EvolutionInstancesController } from '../controllers/evolution-instances.controller';

const router = Router();
const evolutionController = new EvolutionInstancesController();

/**
 * @swagger
 * components:
 *   schemas:
 *     EvolutionInstanceDB:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único da instância no banco
 *         cliente_id:
 *           type: string
 *           format: uuid
 *           description: ID do cliente proprietário
 *         instance_name:
 *           type: string
 *           description: Nome da instância
 *         instance_id:
 *           type: string
 *           description: ID da instância na Evolution API
 *         status:
 *           type: string
 *           enum: [open, close, connecting, disconnected]
 *           description: Status da conexão
 *         qr_code:
 *           type: string
 *           description: QR Code para conexão
 *         webhook_url:
 *           type: string
 *           description: URL do webhook
 *         phone_number:
 *           type: string
 *           description: Número do telefone conectado
 *         profile_name:
 *           type: string
 *           description: Nome do perfil
 *         profile_picture_url:
 *           type: string
 *           description: URL da foto do perfil
 *         is_connected:
 *           type: boolean
 *           description: Se a instância está conectada
 *         last_connection:
 *           type: string
 *           format: date-time
 *           description: Última conexão
 *         api_key:
 *           type: string
 *           description: Chave da API
 *         settings:
 *           type: object
 *           description: Configurações da instância
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data de atualização
 * 
 *     EvolutionInstance:
 *       type: object
 *       properties:
 *         instanceName:
 *           type: string
 *           description: Nome da instância
 *         instanceId:
 *           type: string
 *           description: ID único da instância
 *         owner:
 *           type: string
 *           description: Proprietário da instância (número do WhatsApp)
 *         profileName:
 *           type: string
 *           description: Nome do perfil
 *         profilePictureUrl:
 *           type: string
 *           description: URL da foto do perfil
 *         profileStatus:
 *           type: string
 *           description: Status do perfil
 *         status:
 *           type: string
 *           enum: [open, close, connecting, disconnected]
 *           description: Status da conexão
 *         serverUrl:
 *           type: string
 *           description: URL do servidor
 *         apikey:
 *           type: string
 *           description: Chave da API
 *         integration:
 *           type: object
 *           properties:
 *             integration:
 *               type: string
 *               enum: [WHATSAPP-BAILEYS, WHATSAPP-BUSINESS]
 *             webhook_wa_business:
 *               type: string
 *             token:
 *               type: string
 * 
 *     CreateEvolutionInstanceRequest:
 *       type: object
 *       required:
 *         - instanceName
 *       properties:
 *         instanceName:
 *           type: string
 *           description: Nome da instância
 *         token:
 *           type: string
 *           description: Token de autenticação
 *         qrcode:
 *           type: boolean
 *           description: Gerar QR Code automaticamente
 *           default: true
 *         number:
 *           type: string
 *           description: Número do WhatsApp com código do país
 *         integration:
 *           type: string
 *           enum: [WHATSAPP-BAILEYS, WHATSAPP-BUSINESS]
 *           default: WHATSAPP-BAILEYS
 *         rejectCall:
 *           type: boolean
 *           description: Rejeitar chamadas automaticamente
 *         msgCall:
 *           type: string
 *           description: Mensagem para chamadas rejeitadas
 *         groupsIgnore:
 *           type: boolean
 *           description: Ignorar mensagens de grupos
 *         alwaysOnline:
 *           type: boolean
 *           description: Manter sempre online
 *         readMessages:
 *           type: boolean
 *           description: Marcar mensagens como lidas
 *         readStatus:
 *           type: boolean
 *           description: Mostrar status de leitura
 *         syncFullHistory:
 *           type: boolean
 *           description: Sincronizar histórico completo
 *         webhook:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               description: URL do webhook
 *             byEvents:
 *               type: boolean
 *               description: Webhook por eventos
 *             base64:
 *               type: boolean
 *               description: Enviar arquivos em base64
 *             headers:
 *               type: object
 *               properties:
 *                 authorization:
 *                   type: string
 *                 Content-Type:
 *                   type: string
 *             events:
 *               type: array
 *               items:
 *                 type: string
 * 
 *     UpdateEvolutionInstanceRequest:
 *       type: object
 *       properties:
 *         instanceName:
 *           type: string
 *         rejectCall:
 *           type: boolean
 *         msgCall:
 *           type: string
 *         groupsIgnore:
 *           type: boolean
 *         alwaysOnline:
 *           type: boolean
 *         readMessages:
 *           type: boolean
 *         readStatus:
 *           type: boolean
 *         webhook:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *             byEvents:
 *               type: boolean
 *             base64:
 *               type: boolean
 * 
 *     QRCodeResponse:
 *       type: object
 *       properties:
 *         base64:
 *           type: string
 *           description: QR Code em formato base64
 *           example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVw..."
 *         code:
 *           type: string
 *           description: Código do QR Code
 *           example: "2@nI20KyyVmbrHmXaK0Hcgni+J/UO2HbC8ZvENB/IU9qhWqHl5gS6Mrz+DKGm+CYJ8XZFnTjBGTI56VwHpu4aMyS2ElvEA98HKXXM=,ab8vCO5UU2bGCkPnEoY2LLPpdNYpyP/xSxEVrPo+kGc=,Y1J+YvWI3WhFTQVpEV+002AasO/Bm0aYh24fGl02HWs=,HjsV2De00IZXqGBSF6DiCxzA6CjLSsE2S1+I5psQ9eg="
 *         count:
 *           type: number
 *           description: Contador de tentativas
 *           example: 2
 *         pairingCode:
 *           type: string
 *           nullable: true
 *           description: Código de pareamento
 *           example: null
 */

// ========================================
// ROTAS PARA GERENCIAR INSTÂNCIAS POR CLIENTE
// ========================================

/**
 * @swagger
 * /api/clientes/{clienteId}/evolution-instances:
 *   get:
 *     summary: Listar instâncias de um cliente
 *     tags: [Evolution Instances - Cliente]
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Lista de instâncias obtida com sucesso
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
 *                     $ref: '#/components/schemas/EvolutionInstanceDB'
 *                 total:
 *                   type: number
 */
router.get('/clientes/:clienteId/evolution-instances', 
  evolutionController.getInstancesByCliente.bind(evolutionController)
);

/**
 * @swagger
 * /api/clientes/{clienteId}/evolution-instances/{instanceId}:
 *   get:
 *     summary: Obter instância específica de um cliente
 *     tags: [Evolution Instances - Cliente]
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *       - in: path
 *         name: instanceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da instância
 *     responses:
 *       200:
 *         description: Instância obtida com sucesso
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
 *                   $ref: '#/components/schemas/EvolutionInstanceDB'
 */
router.get('/clientes/:clienteId/evolution-instances/:instanceId', 
  evolutionController.getInstanceByCliente.bind(evolutionController)
);

/**
 * @swagger
 * /api/clientes/{clienteId}/evolution-instances:
 *   post:
 *     summary: Criar nova instância para um cliente
 *     tags: [Evolution Instances - Cliente]
 *     parameters:
 *       - in: path
 *         name: clienteId
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
 *             $ref: '#/components/schemas/CreateEvolutionInstanceRequest'
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
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     database:
 *                       $ref: '#/components/schemas/EvolutionInstanceDB'
 *                     api:
 *                       type: object
 */
router.post('/clientes/:clienteId/evolution-instances', 
  evolutionController.createInstanceForCliente.bind(evolutionController)
);

/**
 * @swagger
 * /api/clientes/{clienteId}/evolution-instances/{instanceId}/connect:
 *   post:
 *     summary: Conectar instância e obter QR Code
 *     tags: [Evolution Instances - Cliente]
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *       - in: path
 *         name: instanceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da instância
 *       - in: query
 *         name: number
 *         schema:
 *           type: string
 *         description: Número do telefone (opcional)
 *     responses:
 *       200:
 *         description: Instância conectada, QR Code gerado
 */
router.post('/clientes/:clienteId/evolution-instances/:instanceId/connect', 
  evolutionController.connectInstanceByCliente.bind(evolutionController)
);

/**
 * @swagger
 * /api/clientes/{clienteId}/evolution-instances/{instanceId}/status:
 *   get:
 *     summary: Obter status de conexão da instância
 *     tags: [Evolution Instances - Cliente]
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *       - in: path
 *         name: instanceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da instância
 *     responses:
 *       200:
 *         description: Status sincronizado
 */
router.get('/clientes/:clienteId/evolution-instances/:instanceId/status', 
  evolutionController.getConnectionStatusByCliente.bind(evolutionController)
);

/**
 * @swagger
 * /api/clientes/{clienteId}/evolution-instances/{instanceId}/disconnect:
 *   post:
 *     summary: Desconectar instância
 *     tags: [Evolution Instances - Cliente]
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *       - in: path
 *         name: instanceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da instância
 *     responses:
 *       200:
 *         description: Instância desconectada
 */
router.post('/clientes/:clienteId/evolution-instances/:instanceId/disconnect', 
  evolutionController.disconnectInstanceByCliente.bind(evolutionController)
);

/**
 * @swagger
 * /api/clientes/{clienteId}/evolution-instances/{instanceId}/restart:
 *   post:
 *     summary: Reiniciar instância
 *     tags: [Evolution Instances - Cliente]
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *       - in: path
 *         name: instanceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da instância
 *     responses:
 *       200:
 *         description: Instância reiniciada
 */
router.post('/clientes/:clienteId/evolution-instances/:instanceId/restart', 
  evolutionController.restartInstanceByCliente.bind(evolutionController)
);

/**
 * @swagger
 * /api/clientes/{clienteId}/evolution-instances/{instanceId}:
 *   put:
 *     summary: Atualizar configurações da instância
 *     tags: [Evolution Instances - Cliente]
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *       - in: path
 *         name: instanceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da instância
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               webhook_url:
 *                 type: string
 *               settings:
 *                 type: object
 *               phone_number:
 *                 type: string
 *               profile_name:
 *                 type: string
 *               profile_picture_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Instância atualizada com sucesso
 */
router.put('/clientes/:clienteId/evolution-instances/:instanceId', 
  evolutionController.updateInstanceByCliente.bind(evolutionController)
);

/**
 * @swagger
 * /api/clientes/{clienteId}/evolution-instances/{instanceId}:
 *   delete:
 *     summary: Deletar instância
 *     tags: [Evolution Instances - Cliente]
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *       - in: path
 *         name: instanceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da instância
 *     responses:
 *       200:
 *         description: Instância deletada com sucesso
 */
router.delete('/clientes/:clienteId/evolution-instances/:instanceId', 
  evolutionController.deleteInstanceByCliente.bind(evolutionController)
);

// ========================================
// ROTAS ORIGINAIS DA EVOLUTION API
// ========================================

/**
 * @swagger
 * /api/evolution-instances/health:
 *   get:
 *     summary: Verificar se a Evolution API está funcionando
 *     tags: [Evolution API - Direct]
 *     responses:
 *       200:
 *         description: API funcionando corretamente
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
 */
router.get('/health', evolutionController.checkApiHealth.bind(evolutionController));

/**
 * @swagger
 * /api/evolution-instances/instances:
 *   get:
 *     summary: Listar todas as instâncias do banco de dados
 *     tags: [Evolution API - Direct]
 *     responses:
 *       200:
 *         description: Lista de instâncias obtida com sucesso
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         description: ID único da instância
 *                       clienteId:
 *                         type: string
 *                         format: uuid
 *                         description: ID do cliente proprietário
 *                       instanceName:
 *                         type: string
 *                         description: Nome da instância
 *                       instanceId:
 *                         type: string
 *                         description: ID da instância na Evolution API
 *                       status:
 *                         type: string
 *                         enum: [open, close, connecting, disconnected]
 *                         description: Status da conexão
 *                       qrCode:
 *                         type: string
 *                         description: QR Code para conexão
 *                       webhookUrl:
 *                         type: string
 *                         description: URL do webhook
 *                       phoneNumber:
 *                         type: string
 *                         description: Número do telefone conectado
 *                       profileName:
 *                         type: string
 *                         description: Nome do perfil
 *                       profilePictureUrl:
 *                         type: string
 *                         description: URL da foto do perfil
 *                       isConnected:
 *                         type: boolean
 *                         description: Se a instância está conectada
 *                       lastConnection:
 *                         type: string
 *                         format: date-time
 *                         description: Última conexão
 *                       apiKey:
 *                         type: string
 *                         description: Chave da API
 *                       settings:
 *                         type: object
 *                         description: Configurações da instância
 *                       alwaysOnline:
 *                         type: boolean
 *                         description: Manter sempre online
 *                         example: true
 *                       groupsIgnore:
 *                         type: boolean
 *                         description: Ignorar grupos
 *                         example: false
 *                       msgCall:
 *                         type: string
 *                         description: Mensagem para chamadas
 *                         example: "texto"
 *                       readMessages:
 *                         type: boolean
 *                         description: Marcar mensagens como lidas
 *                         example: true
 *                       readStatus:
 *                         type: boolean
 *                         description: Mostrar status de leitura
 *                         example: true
 *                       rejectCall:
 *                         type: boolean
 *                         description: Rejeitar chamadas
 *                         example: false
 *                       syncFullHistory:
 *                         type: boolean
 *                         description: Sincronizar histórico completo
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Data de criação
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Data de atualização
 *                 total:
 *                   type: number
 *                   description: Total de instâncias
 */
router.get('/instances', evolutionController.fetchInstances.bind(evolutionController));

/**
 * @swagger
 * /api/evolution-instances/instances:
 *   post:
 *     summary: Criar uma nova instância
 *     tags: [Evolution API - Direct]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEvolutionInstanceRequest'
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
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/EvolutionInstance'
 */
router.post('/instances', evolutionController.createInstance.bind(evolutionController));

/**
 * @swagger
 * /api/evolution-instances/instances/{instanceName}:
 *   get:
 *     summary: Obter detalhes de uma instância específica
 *     tags: [Evolution API - Direct]
 *     parameters:
 *       - in: path
 *         name: instanceName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da instância
 *     responses:
 *       200:
 *         description: Instância obtida com sucesso
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
 *                   $ref: '#/components/schemas/EvolutionInstance'
 */
router.get('/instances/:instanceName', evolutionController.getInstance.bind(evolutionController));

/**
 * @swagger
 * /api/evolution-instances/instances/{instanceName}:
 *   put:
 *     summary: Atualizar configurações da instância
 *     tags: [Evolution API - Direct]
 *     parameters:
 *       - in: path
 *         name: instanceName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da instância
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEvolutionInstanceRequest'
 *     responses:
 *       200:
 *         description: Instância atualizada com sucesso
 */
router.put('/instances/:instanceName', evolutionController.updateInstance.bind(evolutionController));

/**
 * @swagger
 * /api/evolution-instances/instances/{instanceName}:
 *   delete:
 *     summary: Deletar instância
 *     tags: [Evolution API - Direct]
 *     parameters:
 *       - in: path
 *         name: instanceName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da instância
 *     responses:
 *       200:
 *         description: Instância deletada com sucesso
 */
router.delete('/instances/:instanceName', evolutionController.deleteInstance.bind(evolutionController));

/**
 * @swagger
 * /api/evolution-instances/instances/{instanceName}/connect:
 *   get:
 *     summary: Conectar instância e obter QR Code
 *     tags: [Evolution API - Direct]
 *     parameters:
 *       - in: path
 *         name: instanceName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da instância
 *       - in: query
 *         name: number
 *         schema:
 *           type: string
 *         description: Número do WhatsApp com código do país
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
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/QRCodeResponse'
 */
router.get('/instances/:instanceName/connect', evolutionController.connectInstance.bind(evolutionController));

/**
 * @swagger
 * /api/evolution-instances/instances/{instanceName}/qrcode:
 *   get:
 *     summary: Obter QR Code de uma instância
 *     tags: [Evolution API - Direct]
 *     parameters:
 *       - in: path
 *         name: instanceName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da instância
 *     responses:
 *       200:
 *         description: QR Code obtido com sucesso
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
 *                   $ref: '#/components/schemas/QRCodeResponse'
 */
router.get('/instances/:instanceName/qrcode', evolutionController.getQRCode.bind(evolutionController));

/**
 * @swagger
 * /api/evolution-instances/instances/{instanceName}/status:
 *   get:
 *     summary: Obter status de conexão da instância
 *     tags: [Evolution API - Direct]
 *     parameters:
 *       - in: path
 *         name: instanceName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da instância
 *     responses:
 *       200:
 *         description: Status obtido com sucesso
 */
router.get('/instances/:instanceName/status', evolutionController.getConnectionStatus.bind(evolutionController));

/**
 * @swagger
 * /api/evolution-instances/instances/{instanceName}/disconnect:
 *   post:
 *     summary: Desconectar instância
 *     tags: [Evolution API - Direct]
 *     parameters:
 *       - in: path
 *         name: instanceName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da instância
 *     responses:
 *       200:
 *         description: Instância desconectada com sucesso
 */
router.post('/instances/:instanceName/disconnect', evolutionController.disconnectInstance.bind(evolutionController));

/**
 * @swagger
 * /api/evolution-instances/instances/{instanceName}/restart:
 *   post:
 *     summary: Reiniciar instância
 *     tags: [Evolution API - Direct]
 *     parameters:
 *       - in: path
 *         name: instanceName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da instância
 *     responses:
 *       200:
 *         description: Instância reiniciada com sucesso
 */
router.post('/instances/:instanceName/restart', evolutionController.restartInstance.bind(evolutionController));

/**
 * @swagger
 * /api/evolution-instances/instances/{instanceName}/profile:
 *   get:
 *     summary: Obter informações do perfil da instância
 *     tags: [Evolution API - Direct]
 *     parameters:
 *       - in: path
 *         name: instanceName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da instância
 *     responses:
 *       200:
 *         description: Perfil obtido com sucesso
 */
router.get('/instances/:instanceName/profile', evolutionController.getProfileInfo.bind(evolutionController));

/**
 * @swagger
 * /api/evolution-instances/instances/{instanceName}/webhook:
 *   post:
 *     summary: Definir webhook para uma instância
 *     tags: [Evolution API - Direct]
 *     parameters:
 *       - in: path
 *         name: instanceName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da instância
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - webhookUrl
 *             properties:
 *               webhookUrl:
 *                 type: string
 *                 description: URL do webhook
 *               events:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de eventos para o webhook
 *     responses:
 *       200:
 *         description: Webhook configurado com sucesso
 */
router.post('/instances/:instanceName/webhook', evolutionController.setWebhook.bind(evolutionController));

export default router;