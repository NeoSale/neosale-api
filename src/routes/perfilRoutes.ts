import { Router } from 'express';
import { PerfilController } from '../controllers/perfilController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Perfil:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         nome:
 *           type: string
 *         descricao:
 *           type: string
 *         permissoes:
 *           type: object
 *         ativo:
 *           type: boolean
 *         sistema:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/perfis:
 *   get:
 *     summary: Listar todos os perfis
 *     tags: [Perfis]
 *     responses:
 *       200:
 *         description: Lista de perfis
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
 *                     $ref: '#/components/schemas/Perfil'
 *                 total:
 *                   type: integer
 */
router.get('/', PerfilController.getAll);

/**
 * @swagger
 * /api/perfis/ativos:
 *   get:
 *     summary: Listar perfis ativos
 *     tags: [Perfis]
 *     responses:
 *       200:
 *         description: Lista de perfis ativos
 */
router.get('/ativos', PerfilController.getAtivos);

/**
 * @swagger
 * /api/perfis/{id}:
 *   get:
 *     summary: Buscar perfil por ID
 *     tags: [Perfis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Perfil encontrado
 *       404:
 *         description: Perfil não encontrado
 */
router.get('/:id', PerfilController.getById);

/**
 * @swagger
 * /api/perfis:
 *   post:
 *     summary: Criar novo perfil
 *     tags: [Perfis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - permissoes
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               permissoes:
 *                 type: object
 *               ativo:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Perfil criado com sucesso
 *       409:
 *         description: Já existe um perfil com este nome
 */
router.post('/', PerfilController.create);

/**
 * @swagger
 * /api/perfis/{id}:
 *   put:
 *     summary: Atualizar perfil
 *     tags: [Perfis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               permissoes:
 *                 type: object
 *               ativo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *       404:
 *         description: Perfil não encontrado
 */
router.put('/:id', PerfilController.update);

/**
 * @swagger
 * /api/perfis/{id}:
 *   delete:
 *     summary: Deletar perfil
 *     tags: [Perfis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Perfil deletado com sucesso
 *       404:
 *         description: Perfil não encontrado
 */
router.delete('/:id', PerfilController.delete);

/**
 * @swagger
 * /api/perfis/{id}/permissoes:
 *   get:
 *     summary: Obter permissões do perfil
 *     tags: [Perfis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Permissões do perfil
 */
router.get('/:id/permissoes', PerfilController.getPermissoes);

/**
 * @swagger
 * /api/perfis/{id}/permissoes:
 *   put:
 *     summary: Atualizar permissões do perfil
 *     tags: [Perfis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissoes
 *             properties:
 *               permissoes:
 *                 type: object
 *     responses:
 *       200:
 *         description: Permissões atualizadas com sucesso
 */
router.put('/:id/permissoes', PerfilController.updatePermissoes);

/**
 * @swagger
 * /api/perfis/{id}/usuarios:
 *   get:
 *     summary: Listar usuários do perfil
 *     tags: [Perfis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de usuários do perfil
 */
router.get('/:id/usuarios', PerfilController.getUsuarios);

export default router;
