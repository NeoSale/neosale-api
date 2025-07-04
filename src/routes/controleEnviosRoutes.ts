import { Router } from 'express'
import { ControleEnviosController } from '../controllers/controleEnviosController'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     ControleEnvio:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único do registro
 *         data:
 *           type: string
 *           format: date
 *           description: Data do controle (YYYY-MM-DD)
 *         quantidade_enviada:
 *           type: integer
 *           description: Quantidade de mensagens enviadas no dia
 *         limite_diario:
 *           type: integer
 *           description: Limite diário de envios
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação do registro
 *     StatusEnvio:
 *       type: object
 *       properties:
 *         podeEnviar:
 *           type: boolean
 *           description: Se ainda pode enviar mensagens
 *         quantidadeRestante:
 *           type: integer
 *           description: Quantidade restante que pode ser enviada
 *         limite:
 *           type: integer
 *           description: Limite diário configurado
 *         enviadas:
 *           type: integer
 *           description: Quantidade já enviada no dia
 */

/**
 * @swagger
 * /api/controle-envios:
 *   get:
 *     summary: Lista todos os registros de controle de envios
 *     tags: [Controle de Envios]
 *     responses:
 *       200:
 *         description: Lista de registros de controle de envios
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
 *                     $ref: '#/components/schemas/ControleEnvio'
 *                 total:
 *                   type: integer
 *                 message:
 *                   type: string
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', ControleEnviosController.getAllControleEnvios)

/**
 * @swagger
 * /api/controle-envios/hoje:
 *   get:
 *     summary: Busca o controle de envios para hoje
 *     tags: [Controle de Envios]
 *     responses:
 *       200:
 *         description: Controle de envios de hoje
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ControleEnvio'
 *                 message:
 *                   type: string
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/hoje', ControleEnviosController.getControleEnvioHoje)

/**
 * @swagger
 * /api/controle-envios/hoje/quantidade:
 *   put:
 *     summary: Altera a quantidade enviada da data de hoje
 *     tags: [Controle de Envios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantidade
 *             properties:
 *               quantidade:
 *                 type: integer
 *                 minimum: 0
 *                 description: Nova quantidade enviada para hoje
 *             example:
 *               quantidade: 15
 *     responses:
 *       200:
 *         description: Quantidade enviada alterada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ControleEnvio'
 *                 message:
 *                   type: string
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/hoje/quantidade', ControleEnviosController.alterarQuantidadeEnviadaHoje)

/**
 * @swagger
 * /api/controle-envios/limite-diario:
 *   put:
 *     summary: Altera o limite diário de hoje
 *     tags: [Controle de Envios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - limite
 *             properties:
 *               limite:
 *                 type: integer
 *                 minimum: 0
 *                 description: Novo limite diário de envios
 *             example:
 *               limite: 50
 *     responses:
 *       200:
 *         description: Limite diário alterado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ControleEnvio'
 *                 message:
 *                   type: string
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/limite-diario', ControleEnviosController.alterarLimiteDiario)

/**
 * @swagger
 * /api/controle-envios/{data}:
 *   get:
 *     summary: Busca controle de envios por data específica
 *     tags: [Controle de Envios]
 *     parameters:
 *       - in: path
 *         name: data
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-15"
 *         description: Data no formato YYYY-MM-DD
 *     responses:
 *       200:
 *         description: Controle de envios encontrado ou criado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ControleEnvio'
 *                 message:
 *                   type: string
 *       400:
 *         description: Formato de data inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:data', ControleEnviosController.getControleEnvioByDate)

/**
 * @swagger
 * /api/controle-envios/{data}/status:
 *   get:
 *     summary: Verifica se ainda pode enviar mensagens na data
 *     tags: [Controle de Envios]
 *     parameters:
 *       - in: path
 *         name: data
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-15"
 *         description: Data no formato YYYY-MM-DD
 *     responses:
 *       200:
 *         description: Status de envio verificado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/StatusEnvio'
 *                 message:
 *                   type: string
 *       400:
 *         description: Formato de data inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:data/status', ControleEnviosController.getStatusEnvio)

/**
 * @swagger
 * /api/controle-envios/{data}/incrementar:
 *   post:
 *     summary: Incrementa a quantidade de mensagens enviadas
 *     tags: [Controle de Envios]
 *     parameters:
 *       - in: path
 *         name: data
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-15"
 *         description: Data no formato YYYY-MM-DD
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               incremento:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *                 description: Quantidade a incrementar - padrão 1
 *             example:
 *               incremento: 1
 *     responses:
 *       200:
 *         description: Quantidade incrementada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ControleEnvio'
 *                 message:
 *                   type: string
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/:data/incrementar', ControleEnviosController.incrementarQuantidade)

export { router as controleEnviosRoutes }