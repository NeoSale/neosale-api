import { Router } from 'express';
import { UsuarioController } from '../controllers/usuarioController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único do usuário
 *         nome:
 *           type: string
 *           description: Nome do usuário
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário
 *         senha:
 *           type: string
 *           description: Senha do usuário (hash)
 *         provedor_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID do provedor associado
 *         tipo_acesso_id:
 *           type: string
 *           format: uuid
 *           description: ID do tipo de acesso
 *         revendedor_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID do revendedor associado
 *         ativo:
 *           type: boolean
 *           description: Se o usuário está ativo
 *         ultimo_login:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Data do último login
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data de atualização
 *         provedor:
 *           type: object
 *           nullable: true
 *           description: Dados do provedor associado
 *         tipo_acesso:
 *           type: object
 *           description: Dados do tipo de acesso
 *         revendedor:
 *           type: object
 *           nullable: true
 *           description: Dados do revendedor associado
 *     CreateUsuario:
 *       type: object
 *       required:
 *         - nome
 *         - email
 *         - senha
 *         - tipo_acesso_id
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome do usuário
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário
 *         senha:
 *           type: string
 *           description: Senha do usuário
 *         provedor_id:
 *           type: string
 *           format: uuid
 *           description: ID do provedor associado
 *         tipo_acesso_id:
 *           type: string
 *           format: uuid
 *           description: ID do tipo de acesso
 *         revendedor_id:
 *           type: string
 *           format: uuid
 *           description: ID do revendedor associado
 *         ativo:
 *           type: boolean
 *           default: true
 *           description: Se o usuário está ativo
 *     UpdateUsuario:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome do usuário
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário
 *         senha:
 *           type: string
 *           description: Senha do usuário
 *         provedor_id:
 *           type: string
 *           format: uuid
 *           description: ID do provedor associado
 *         tipo_acesso_id:
 *           type: string
 *           format: uuid
 *           description: ID do tipo de acesso
 *         revendedor_id:
 *           type: string
 *           format: uuid
 *           description: ID do revendedor associado
 *         ativo:
 *           type: boolean
 *           description: Se o usuário está ativo
 *         ultimo_login:
 *           type: string
 *           format: date-time
 *           description: Data do último login
 */

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Buscar todos os usuários
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: Lista de usuários
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
 *                     $ref: '#/components/schemas/Usuario'
 *                 total:
 *                   type: integer
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/', UsuarioController.getAll);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Buscar usuário por ID
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuário não encontrado
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
router.get('/:id', UsuarioController.getById);

/**
 * @swagger
 * /api/usuarios/email/{email}:
 *   get:
 *     summary: Buscar usuário por email
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuário não encontrado
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
router.get('/email/:email', UsuarioController.getByEmail);

/**
 * @swagger
 * /api/usuarios/tipo-acesso/{tipoAcessoId}:
 *   get:
 *     summary: Buscar usuários por tipo de acesso
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: tipoAcessoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do tipo de acesso
 *     responses:
 *       200:
 *         description: Lista de usuários com o tipo de acesso especificado
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
 *                     $ref: '#/components/schemas/Usuario'
 *                 total:
 *                   type: integer
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/tipo-acesso/:tipoAcessoId', UsuarioController.getByTipoAcesso);

/**
 * @swagger
 * /api/usuarios/revendedor/{revendedorId}:
 *   get:
 *     summary: Buscar usuários por revendedor
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: revendedorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do revendedor
 *     responses:
 *       200:
 *         description: Lista de usuários do revendedor
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
 *                     $ref: '#/components/schemas/Usuario'
 *                 total:
 *                   type: integer
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/revendedor/:revendedorId', UsuarioController.getByRevendedor);

/**
 * @swagger
 * /api/usuarios/ativos:
 *   get:
 *     summary: Buscar usuários ativos
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: Lista de usuários ativos
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
 *                     $ref: '#/components/schemas/Usuario'
 *                 total:
 *                   type: integer
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/ativos', UsuarioController.getAtivos);

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Criar novo usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUsuario'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *                 message:
 *                   type: string
 *                   example: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       409:
 *         description: Já existe um usuário com este email
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
router.post('/', UsuarioController.create);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Atualizar usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUsuario'
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *                 message:
 *                   type: string
 *                   example: Usuário atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       409:
 *         description: Já existe um usuário com este email
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
router.put('/:id', UsuarioController.update);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Deletar usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso
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
 *                   example: Usuário deletado com sucesso
 *       404:
 *         description: Usuário não encontrado
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
router.delete('/:id', UsuarioController.delete);

export default router;