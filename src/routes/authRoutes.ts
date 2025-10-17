import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - senha
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário
 *           example: admin@neosale.com
 *         senha:
 *           type: string
 *           format: password
 *           description: Senha criptografada do usuário
 *           example: $2a$10$hash...
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               description: Token JWT para autenticação
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *             usuario:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 nome:
 *                   type: string
 *                 email:
 *                   type: string
 *                 ativo:
 *                   type: boolean
 *         message:
 *           type: string
 *           example: Login realizado com sucesso
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Realizar login
 *     description: Autentica o usuário e retorna um token JWT. A senha deve ser enviada já criptografada.
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             admin:
 *               summary: Login como admin
 *               value:
 *                 email: admin@neosale.com
 *                 senha: $2a$10$rN8qvM1xGxKZH4vZ8vZ8vOqvZ8vZ8vZ8vZ8vZ8vZ8vZ8vZ8vZ8vZ8
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Email ou senha não fornecidos
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
 *                   example: Email e senha são obrigatórios
 *       401:
 *         description: Credenciais inválidas
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
 *                   example: Email ou senha inválidos
 */
router.post('/login', AuthController.login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Realizar logout
 *     description: Invalida o token JWT atual
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
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
 *                   example: Logout realizado com sucesso
 *       400:
 *         description: Token não fornecido
 *       500:
 *         description: Erro ao fazer logout
 */
router.post('/logout', AuthController.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Buscar dados do usuário autenticado
 *     description: Retorna os dados do usuário logado
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
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
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     nome:
 *                       type: string
 *                     email:
 *                       type: string
 *                     telefone:
 *                       type: string
 *                     ativo:
 *                       type: boolean
 *                     provedor_id:
 *                       type: string
 *                       format: uuid
 *                     tipo_acesso_id:
 *                       type: string
 *                       format: uuid
 *                     revendedor_id:
 *                       type: string
 *                       format: uuid
 *                     cliente_id:
 *                       type: string
 *                       format: uuid
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Token inválido ou não fornecido
 */
router.get('/me', AuthController.me);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renovar token JWT
 *     description: Gera um novo token JWT e invalida o anterior
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token renovado com sucesso
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
 *                     token:
 *                       type: string
 *                       description: Novo token JWT
 *                 message:
 *                   type: string
 *                   example: Token renovado com sucesso
 *       400:
 *         description: Token não fornecido
 *       401:
 *         description: Token inválido
 */
router.post('/refresh', AuthController.refresh);

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Verificar se token é válido
 *     description: Valida o token JWT sem renovar
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
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
 *                     valido:
 *                       type: boolean
 *                       example: true
 *                     usuario_id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: object
 *                   properties:
 *                     valido:
 *                       type: boolean
 *                       example: false
 *                 message:
 *                   type: string
 */
router.post('/verify', AuthController.verify);

export default router;
