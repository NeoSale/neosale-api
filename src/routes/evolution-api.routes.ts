import { Router } from 'express'
import { EvolutionApiController } from '../controllers/evolution-api.controller'
import { validateRequest } from '../middleware/validate-request'
import { 
  createEvolutionApiSchema, 
  updateEvolutionApiSchema, 
  connectInstanceSchema,
  instanceNameParamSchema
} from '../lib/validators'
import { validateClienteId } from '../middleware/validate-cliente-id'

const router = Router()
const evolutionApiController = new EvolutionApiController()

/**
 * @swagger
 * tags:
 *   name: Evolution API
 *   description: Gerenciamento de instâncias da Evolution API
 */

// Middleware para validar cliente_id em todas as rotas
router.use(validateClienteId)

/**
 * @swagger
 * /api/evolution-api:
 *   get:
 *     summary: Lista todas as instâncias da Evolution API
 *     tags: [Evolution API]
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
 *         description: Lista de instâncias retornada com sucesso
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
 *                     $ref: '#/components/schemas/EvolutionApi'
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Listar todas as instâncias
router.get('/', evolutionApiController.getAllInstances.bind(evolutionApiController))

/**
 * @swagger
 * /api/evolution-api/{id}:
 *   get:
 *     summary: Obtém uma instância da Evolution API por ID
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
 *         description: Instância encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/EvolutionApi'
 *       404:
 *         description: Instância não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Obter instância por ID
router.get('/:id', evolutionApiController.getInstanceById.bind(evolutionApiController))

/**
 * @swagger
 * /api/evolution-api/name/{instanceName}:
 *   get:
 *     summary: Obtém uma instância da Evolution API por nome
 *     tags: [Evolution API]
 *     parameters:
 *       - in: path
 *         name: instanceName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da instância
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Instância encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/EvolutionApi'
 *       404:
 *         description: Instância não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Obter instância por nome
router.get('/name/:instanceName', 
  validateRequest(instanceNameParamSchema, 'params'),
  evolutionApiController.getInstanceByName.bind(evolutionApiController)
)

/**
 * @swagger
 * /api/evolution-api:
 *   post:
 *     summary: Cria uma nova instância da Evolution API
 *     tags: [Evolution API]
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
 *             $ref: '#/components/schemas/CreateEvolutionApiRequest'
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
 *                   $ref: '#/components/schemas/EvolutionApi'
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Criar nova instância
router.post('/', 
  validateRequest(createEvolutionApiSchema),
  evolutionApiController.createInstance.bind(evolutionApiController)
)

/**
 * @swagger
 * /api/evolution-api/{id}:
 *   put:
 *     summary: Atualiza uma instância da Evolution API
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEvolutionApiRequest'
 *     responses:
 *       200:
 *         description: Instância atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/EvolutionApi'
 *       404:
 *         description: Instância não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Atualizar instância
router.put('/:id', 
  validateRequest(updateEvolutionApiSchema),
  evolutionApiController.updateInstance.bind(evolutionApiController)
)

/**
 * @swagger
 * /api/evolution-api/{id}:
 *   delete:
 *     summary: Remove uma instância da Evolution API
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
 *         description: Instância removida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Instância não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Deletar instância
router.delete('/:id', evolutionApiController.deleteInstance.bind(evolutionApiController))

/**
 * @swagger
 * /api/evolution-api/connect/{instanceName}:
 *   post:
 *     summary: Conecta uma instância da Evolution API
 *     tags: [Evolution API]
 *     parameters:
 *       - in: path
 *         name: instanceName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da instância
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
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
 *                   $ref: '#/components/schemas/QRCodeResponse'
 *       404:
 *         description: Instância não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Conectar instância
router.post('/connect/:instanceName', 
  validateRequest(instanceNameParamSchema, 'params'),
  evolutionApiController.connectInstance.bind(evolutionApiController)
)

/**
 * @swagger
 * /api/evolution-api/disconnect/{instanceName}:
 *   post:
 *     summary: Desconecta uma instância da Evolution API
 *     tags: [Evolution API]
 *     parameters:
 *       - in: path
 *         name: instanceName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da instância
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
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Instância não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Desconectar instância
router.post('/disconnect/:instanceName', 
  validateRequest(instanceNameParamSchema, 'params'),
  evolutionApiController.disconnectInstance.bind(evolutionApiController)
)

/**
 * @swagger
 * /api/evolution-api/qrcode/{instanceName}:
 *   get:
 *     summary: Obtém o QR Code de uma instância da Evolution API
 *     tags: [Evolution API]
 *     parameters:
 *       - in: path
 *         name: instanceName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da instância
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
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
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/QRCodeResponse'
 *       404:
 *         description: Instância não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Obter QR Code
router.get('/qrcode/:instanceName', 
  validateRequest(instanceNameParamSchema, 'params'),
  evolutionApiController.getQRCode.bind(evolutionApiController)
)

/**
 * @swagger
 * /api/evolution-api/status/{instanceName}:
 *   get:
 *     summary: Verifica o status de conexão de uma instância da Evolution API
 *     tags: [Evolution API]
 *     parameters:
 *       - in: path
 *         name: instanceName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da instância
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Status de conexão obtido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ConnectionStatus'
 *       404:
 *         description: Instância não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Verificar status de conexão
router.get('/status/:instanceName', 
  validateRequest(instanceNameParamSchema, 'params'),
  evolutionApiController.getConnectionStatus.bind(evolutionApiController)
)

export { router as evolutionApiRoutes }