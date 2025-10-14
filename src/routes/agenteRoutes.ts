import { Router } from 'express';
import { AgenteController } from '../controllers/agenteController';
import { validateClienteId } from '../middleware/validate-cliente_id';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Agente:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único do agente
 *         nome:
 *           type: string
 *           description: Nome do agente
 *         tipo_agente_id:
 *           type: string
 *           format: uuid
 *           description: ID do tipo de agente
 *         prompt:
 *           type: string
 *           nullable: true
 *           description: Prompt do agente
 *         agendamento:
 *           type: boolean
 *           description: Se o agente possui agendamento
 *         prompt_agendamento:
 *           type: string
 *           nullable: true
 *           description: Prompt específico para agendamento
 *         prompt_seguranca:
 *           type: string
 *           nullable: true
 *           description: Prompt de segurança do agente
 *         ativo:
 *           type: boolean
 *           description: Se o agente está ativo
 *         embedding:
 *           type: array
 *           items:
 *             type: number
 *           nullable: true
 *           description: Vetor de embedding para o agente
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *         tipo_agente:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             nome:
 *               type: string
 *             ativo:
 *               type: boolean
 *           description: Dados do tipo de agente relacionado
 *     CreateAgenteRequest:
 *       type: object
 *       required:
 *         - nome
 *         - tipo_agente_id
 *       properties:
 *         nome:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Nome do agente
 *         tipo_agente_id:
 *           type: string
 *           format: uuid
 *           description: ID do tipo de agente
 *         prompt:
 *           type: string
 *           description: Prompt do agente
 *         agendamento:
 *           type: boolean
 *           default: false
 *           description: Se o agente possui agendamento
 *         prompt_agendamento:
 *           type: string
 *           description: Prompt específico para agendamento
 *         prompt_seguranca:
 *           type: string
 *           description: Prompt de segurança do agente
 *         ativo:
 *           type: boolean
 *           default: true
 *           description: Se o agente está ativo
 *         embedding:
 *           type: array
 *           items:
 *             type: number
 *           description: Vetor de embedding para o agente
 *     UpdateAgenteRequest:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Nome do agente
 *         tipo_agente_id:
 *           type: string
 *           format: uuid
 *           description: ID do tipo de agente
 *         prompt:
 *           type: string
 *           description: Prompt do agente
 *         agendamento:
 *           type: boolean
 *           description: Se o agente possui agendamento
 *         prompt_agendamento:
 *           type: string
 *           description: Prompt específico para agendamento
 *         prompt_seguranca:
 *           type: string
 *           description: Prompt de segurança do agente
 *         ativo:
 *           type: boolean
 *           description: Se o agente está ativo
 *         embedding:
 *           type: array
 *           items:
 *             type: number
 *           description: Vetor de embedding para o agente
 */

/**
 * @swagger
 * /api/agentes:
 *   get:
 *     summary: Lista todos os agentes
 *     tags: [Agente]
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
 *         description: Lista de agentes retornada com sucesso
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
 *                     $ref: '#/components/schemas/Agente'
 *                 total:
 *                   type: number
 *                   description: Total de registros
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', validateClienteId, AgenteController.getAll);

/**
 * @swagger
 * /api/agentes/ativos:
 *   get:
 *     summary: Lista todos os agentes ativos
 *     tags: [Agente]
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
 *         description: Lista de agentes ativos retornada com sucesso
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
 *                     $ref: '#/components/schemas/Agente'
 *                 total:
 *                   type: number
 *                   description: Total de registros
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/ativos', validateClienteId, AgenteController.getAtivos);

/**
 * @swagger
 * /api/agentes/agendamento:
 *   get:
 *     summary: Lista todos os agentes com agendamento ativo
 *     tags: [Agente]
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
 *         description: Lista de agentes com agendamento retornada com sucesso
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
 *                     $ref: '#/components/schemas/Agente'
 *                 total:
 *                   type: number
 *                   description: Total de registros
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/agendamento', validateClienteId, AgenteController.getComAgendamento);

/**
 * @swagger
 * /api/agentes/{id}:
 *   get:
 *     summary: Busca um agente por ID
 *     tags: [Agente]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do agente
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Agente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Agente'
 *       400:
 *         description: ID não fornecido
 *       404:
 *         description: Agente não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', validateClienteId, AgenteController.getById);

/**
 * @swagger
 * /api/agentes/nome/{nome}:
 *   get:
 *     summary: Busca um agente por nome
 *     tags: [Agente]
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome do agente
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Agente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Agente'
 *       400:
 *         description: Nome não fornecido
 *       404:
 *         description: Agente não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/nome/:nome', validateClienteId, AgenteController.getByNome);

/**
 * @swagger
 * /api/agentes/instance/{instanceName}:
 *   get:
 *     summary: Buscar agente por instance name
 *     tags: [Agente]
 *     parameters:
 *       - in: path
 *         name: instanceName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da instância da Evolution API
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Agente encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Agente'
 *       400:
 *         description: Parâmetros inválidos
 *       404:
 *         description: Agente não encontrado para esta instância
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/instance/:instanceName', validateClienteId, AgenteController.getByInstanceName);

/**
 * @swagger
 * /api/agentes/tipo/{tipoAgenteId}:
 *   get:
 *     summary: Busca agentes por tipo de agente
 *     tags: [Agente]
 *     parameters:
 *       - in: path
 *         name: tipoAgenteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do tipo de agente
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Lista de agentes do tipo especificado
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
 *                     $ref: '#/components/schemas/Agente'
 *                 total:
 *                   type: number
 *                   description: Total de registros
 *       400:
 *         description: ID do tipo de agente não fornecido
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/tipo/:tipoAgenteId', validateClienteId, AgenteController.getByTipoAgente);

/**
 * @swagger
 * /api/agentes:
 *   post:
 *     summary: Cria um novo agente
 *     tags: [Agente]
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
 *             $ref: '#/components/schemas/CreateAgenteRequest'
 *     responses:
 *       201:
 *         description: Agente criado com sucesso
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
 *                   example: Agente criado com sucesso
 *                 data:
 *                   $ref: '#/components/schemas/Agente'
 *       400:
 *         description: Dados inválidos, cliente_id não fornecido ou tipo de agente inválido
 *       409:
 *         description: Agente já existe
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', validateClienteId, AgenteController.create);

/**
 * @swagger
 * /api/agentes/{id}:
 *   put:
 *     summary: Atualiza um agente
 *     tags: [Agente]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do agente
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
 *             $ref: '#/components/schemas/UpdateAgenteRequest'
 *     responses:
 *       200:
 *         description: Agente atualizado com sucesso
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
 *                   example: Agente atualizado com sucesso
 *                 data:
 *                   $ref: '#/components/schemas/Agente'
 *       400:
 *         description: Dados inválidos, ID não fornecido, cliente_id não fornecido ou tipo de agente inválido
 *       404:
 *         description: Agente não encontrado
 *       409:
 *         description: Nome já existe
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id', validateClienteId, AgenteController.update);

/**
 * @swagger
 * /api/agentes/{id}:
 *   delete:
 *     summary: Deleta um agente
 *     tags: [Agente]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do agente
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Agente deletado com sucesso
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
 *                   example: Agente deletado com sucesso
 *                 data:
 *                   $ref: '#/components/schemas/Agente'
 *       400:
 *         description: ID não fornecido
 *       404:
 *         description: Agente não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', validateClienteId, AgenteController.delete);

export default router;