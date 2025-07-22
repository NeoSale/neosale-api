import { Router } from 'express';
const { body, param, query } = require('express-validator');
import { mensagemController } from '../controllers/mensagemController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Mensagem:
 *       type: object
 *       required:
 *         - intervalo_numero
 *         - intervalo_tipo
 *         - texto_mensagem
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único da mensagem
 *         nome:
 *           type: string
 *           description: Nome da mensagem
 *           example: "Mensagem de Boas-vindas"
 *         intervalo_numero:
 *           type: integer
 *           minimum: 1
 *           description: Quantidade de tempo para o intervalo
 *           example: 30
 *         intervalo_tipo:
 *           type: string
 *           enum: [minutos, horas, dias]
 *           description: Tipo do intervalo de tempo
 *           example: "minutos"

 *         texto_mensagem:
 *           type: string
 *           description: Texto da mensagem a ser enviada
 *           example: "Olá! Obrigado pelo seu interesse em nossos serviços."
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
 *     CriarMensagem:
 *       type: object
 *       required:
 *         - intervalo_numero
 *         - intervalo_tipo
 *         - texto_mensagem
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome da mensagem
 *           example: "Mensagem de Boas-vindas"
 *         intervalo_numero:
 *           type: integer
 *           minimum: 1
 *           description: Quantidade de tempo para o intervalo
 *           example: 30
 *         intervalo_tipo:
 *           type: string
 *           enum: [minutos, horas, dias]
 *           description: Tipo do intervalo de tempo
 *           example: "minutos"
 *         texto_mensagem:
 *           type: string
 *           minLength: 1
 *           description: Texto da mensagem a ser enviada
 *           example: "Olá! Obrigado pelo seu interesse em nossos serviços."
 *     AtualizarMensagem:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome da mensagem
 *         intervalo_numero:
 *           type: integer
 *           minimum: 1
 *           description: Quantidade de tempo para o intervalo
 *         intervalo_tipo:
 *           type: string
 *           enum: [minutos, horas, dias]
 *           description: Tipo do intervalo de tempo
 *         texto_mensagem:
 *           type: string
 *           minLength: 1
 *           description: Texto da mensagem a ser enviada

 */

/**
 * @swagger
 * /api/mensagens:
 *   post:
 *     summary: Criar nova mensagem
 *     tags: [Mensagens]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarMensagem'
 *     responses:
 *       201:
 *         description: Mensagem criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mensagem'
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/',
  [
    body('nome')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Nome deve ter entre 1 e 100 caracteres'),
    body('intervalo_numero')
      .isInt({ min: 1 })
      .withMessage('Intervalo número deve ser um número inteiro maior que 0'),
    body('intervalo_tipo')
      .isIn(['minutos', 'horas', 'dias'])
      .withMessage('Intervalo tipo deve ser: minutos, horas ou dias'),
    body('texto_mensagem')
      .notEmpty()
      .withMessage('Texto da mensagem é obrigatório')
      .isLength({ min: 1, max: 1000 })
      .withMessage('Texto da mensagem deve ter entre 1 e 1000 caracteres')
  ],
  mensagemController.criar
);

/**
 * @swagger
 * /api/mensagens:
 *   get:
 *     summary: Listar todas as mensagens
 *     tags: [Mensagens]
 *     responses:
 *       200:
 *         description: Lista de mensagens
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Mensagem'
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', mensagemController.listarTodas);

/**
 * @swagger
 * /api/mensagens/buscar:
 *   get:
 *     summary: Buscar mensagens por texto
 *     tags: [Mensagens]
 *     parameters:
 *       - in: query
 *         name: texto
 *         required: true
 *         schema:
 *           type: string
 *         description: Texto para buscar no nome ou conteúdo das mensagens
 *     responses:
 *       200:
 *         description: Lista de mensagens encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Mensagem'
 *       400:
 *         description: Parâmetro texto é obrigatório
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/buscar',
  [
    query('texto')
      .notEmpty()
      .withMessage('Parâmetro texto é obrigatório')
  ],
  mensagemController.buscarPorTexto
);

/**
 * @swagger
 * /api/mensagens/{id}:
 *   get:
 *     summary: Buscar mensagem por ID
 *     tags: [Mensagens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da mensagem
 *     responses:
 *       200:
 *         description: Mensagem encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mensagem'
 *       404:
 *         description: Mensagem não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id',
  [
    param('id')
      .isUUID()
      .withMessage('ID deve ser um UUID válido')
  ],
  mensagemController.buscarPorId
);

/**
 * @swagger
 * /api/mensagens/{id}:
 *   put:
 *     summary: Atualizar mensagem
 *     tags: [Mensagens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da mensagem
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarMensagem'
 *     responses:
 *       200:
 *         description: Mensagem atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mensagem'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Mensagem não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id',
  [
    param('id')
      .isUUID()
      .withMessage('ID deve ser um UUID válido'),
    body('nome')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Nome deve ter entre 1 e 100 caracteres'),
    body('intervalo_numero')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Intervalo número deve ser um número inteiro maior que 0'),
    body('intervalo_tipo')
      .optional()
      .isIn(['minutos', 'horas', 'dias'])
      .withMessage('Intervalo tipo deve ser: minutos, horas ou dias'),
    body('texto_mensagem')
      .optional()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Texto da mensagem deve ter entre 1 e 1000 caracteres')
  ],
  mensagemController.atualizar
);

/**
 * @swagger
 * /api/mensagens/{id}:
 *   delete:
 *     summary: Deletar mensagem (desativar)
 *     tags: [Mensagens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da mensagem
 *     responses:
 *       200:
 *         description: Mensagem desativada com sucesso
 *       404:
 *         description: Mensagem não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id',
  [
    param('id')
      .isUUID()
      .withMessage('ID deve ser um UUID válido')
  ],
  mensagemController.deletar
);

/**
 * @swagger
 * /api/mensagens/{id}/duplicar:
 *   post:
 *     summary: Duplicar uma mensagem existente
 *     tags: [Mensagens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da mensagem a ser duplicada
 *     responses:
 *       201:
 *         description: Mensagem duplicada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mensagem'
 *       404:
 *         description: Mensagem não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/:id/duplicar',
  [
    param('id')
      .isUUID()
      .withMessage('ID deve ser um UUID válido')
  ],
  mensagemController.duplicar
);

export default router;