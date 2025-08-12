import { Router } from 'express';
import { ParametroController } from '../controllers/parametroController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Parametro:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único da configuração
 *         chave:
 *           type: string
 *           description: Chave da configuração
 *         valor:
 *           type: string
 *           description: Valor da configuração
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         chave: "horario_inicio"
 *         valor: "08:00:00"
 *         created_at: "2024-01-15T10:30:00Z"
 *         updated_at: "2024-01-15T10:30:00Z"
 *     CreateParametro:
 *       type: object
 *       required:
 *         - chave
 *         - valor
 *       properties:
 *         chave:
 *           type: string
 *           description: Chave da configuração
 *         valor:
 *           type: string
 *           description: Valor da configuração
 *       example:
 *         chave: "horario_inicio"
 *         valor: "08:00:00"
 *     UpdateParametro:
 *       type: object
 *       properties:
 *         chave:
 *           type: string
 *           description: Chave da configuração
 *         valor:
 *           type: string
 *           description: Valor da configuração
 *       example:
 *         chave: "horario_inicio"
 *         valor: "09:00:00"
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *         error:
 *           type: string
 */

/**
 * @swagger
 * /api/parametros:
 *   get:
 *     summary: Buscar todos os parâmetros
 *     tags: [Parâmetros]
 *     responses:
 *       200:
 *         description: Lista de configurações retornada com sucesso
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
 *                     $ref: '#/components/schemas/Parametro'
 *                 total:
 *                   type: number
 *                   example: 4
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/', ParametroController.getAll);

/**
 * @swagger
 * /api/parametros/{id}:
 *   get:
 *     summary: Buscar parâmetro por ID
 *     tags: [Parâmetros]
 *     parameters:
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
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Parametro'
 *       400:
 *         description: ID não fornecido
 *       404:
 *         description: Configuração não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', ParametroController.getById);

/**
 * @swagger
 * /api/parametros/chave/{chave}:
 *   get:
 *     summary: Buscar parâmetro por chave
 *     tags: [Parâmetros]
 *     parameters:
 *       - in: path
 *         name: chave
 *         required: true
 *         schema:
 *           type: string
 *         description: Chave da configuração
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
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Parametro'
 *       400:
 *         description: Chave não fornecida
 *       404:
 *         description: Configuração não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/chave/:chave', ParametroController.getByChave);

/**
 * @swagger
 * /api/parametros:
 *   post:
 *     summary: Criar novo parâmetro
 *     tags: [Parâmetros]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateParametro'
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
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Parametro'
 *                 message:
 *                   type: string
 *                   example: "Configuração criada com sucesso"
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Configuração com esta chave já existe
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', ParametroController.create);

/**
 * @swagger
 * /api/parametros/{id}:
 *   put:
 *     summary: Atualizar parâmetro
 *     tags: [Parâmetros]
 *     parameters:
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
 *             $ref: '#/components/schemas/UpdateParametro'
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
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Parametro'
 *                 message:
 *                   type: string
 *                   example: "Configuração atualizada com sucesso"
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Configuração não encontrada
 *       409:
 *         description: Configuração com esta chave já existe
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id', ParametroController.update);

/**
 * @swagger
 * /api/parametros/{id}:
 *   delete:
 *     summary: Deletar parâmetro
 *     tags: [Parâmetros]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da configuração
 *     responses:
 *       200:
 *         description: Configuração deletada com sucesso
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
 *                   example: "Configuração deletada com sucesso"
 *       400:
 *         description: ID não fornecido
 *       404:
 *         description: Configuração não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', ParametroController.delete);

export default router;