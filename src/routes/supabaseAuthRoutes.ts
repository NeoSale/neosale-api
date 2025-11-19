/**
 * Rotas de Autenticação com Supabase
 * 
 * Rotas simplificadas para autenticação.
 * Login, logout, registro e reset de senha são feitos diretamente no frontend com Supabase.
 */

import { Router } from 'express';
import { SupabaseAuthController } from '../controllers/supabaseAuthController';
import { requireAuth, requireAdmin } from '../middleware/supabaseAuth';

const router = Router();

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Buscar dados do usuário autenticado
 *     description: Retorna os dados completos do usuário logado incluindo perfis e permissões
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
 *                     auth_user_id:
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
 *                     email_verificado:
 *                       type: boolean
 *                     perfis:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Token inválido ou não fornecido
 */
router.get('/me', requireAuth, SupabaseAuthController.me);

/**
 * @swagger
 *   post:
 *     summary: Verificar se token é válido
 *     description: Valida o token JWT do Supabase
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
 */
router.post('/verify', SupabaseAuthController.verify);

/**
 * @swagger
 * /api/auth/update-profile:
 *   put:
 *     summary: Atualizar perfil do usuário
 *     description: Atualiza nome e telefone do usuário autenticado
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: João Silva
 *               telefone:
 *                 type: string
 *                 example: (11) 98765-4321
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *       401:
 *         description: Não autenticado
 */
router.put('/update-profile', requireAuth, SupabaseAuthController.updateProfile);

/**
 * @swagger
 * /api/auth/admin/create-user:
 *   post:
 *     summary: Criar novo usuário (Admin)
 *     description: Cria um novo usuário no sistema. Apenas administradores.
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *               - nome
 *               - perfil_id
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               senha:
 *                 type: string
 *                 format: password
 *               nome:
 *                 type: string
 *               telefone:
 *                 type: string
 *               perfil_id:
 *                 type: string
 *                 format: uuid
 *               cliente_id:
 *                 type: string
 *                 format: uuid
 *               revendedor_id:
 *                 type: string
 *                 format: uuid
 *               tipo_acesso_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Sem permissão de administrador
 */
router.post('/admin/create-user', requireAuth, requireAdmin, SupabaseAuthController.createUser);

export default router;
