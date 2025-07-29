import { Router } from 'express';
import { UsuarioAdminController } from '../controllers/usuarioAdminController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UsuarioAdmin:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único do usuário admin
 *         usuario_id:
 *           type: string
 *           format: uuid
 *           description: ID do usuário
 *         nivel_admin:
 *           type: string
 *           enum: [super_admin, admin, moderador]
 *           description: Nível de administração
 *         permissoes_especiais:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de permissões especiais
 *         ativo:
 *           type: boolean
 *           description: Status ativo/inativo
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
 *       required:
 *         - id
 *         - usuario_id
 *         - nivel_admin
 *         - ativo
 *     
 *     CreateUsuarioAdmin:
 *       type: object
 *       properties:
 *         usuario_id:
 *           type: string
 *           format: uuid
 *           description: ID do usuário
 *         nivel_admin:
 *           type: string
 *           enum: [super_admin, admin, moderador]
 *           description: Nível de administração
 *         permissoes_especiais:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de permissões especiais
 *         ativo:
 *           type: boolean
 *           default: true
 *           description: Status ativo/inativo
 *         embedding:
 *           type: array
 *           items:
 *             type: number
 *           description: Vetor de embedding (opcional, será gerado automaticamente)
 *       required:
 *         - usuario_id
 *         - nivel_admin
 *     
 *     UpdateUsuarioAdmin:
 *       type: object
 *       properties:
 *         nivel_admin:
 *           type: string
 *           enum: [super_admin, admin, moderador]
 *           description: Nível de administração
 *         permissoes_especiais:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de permissões especiais
 *         ativo:
 *           type: boolean
 *           description: Status ativo/inativo
 *         embedding:
 *           type: array
 *           items:
 *             type: number
 *           description: Vetor de embedding
 */

/**
 * @swagger
 * /api/usuarios-admin:
 *   get:
 *     summary: Listar todos os usuários admin
 *     tags: [Usuários Admin]
 *     responses:
 *       200:
 *         description: Lista de usuários admin
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
 *                     $ref: '#/components/schemas/UsuarioAdmin'
 *                 message:
 *                   type: string
 *                   example: Usuários admin encontrados com sucesso
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', UsuarioAdminController.getAll);

/**
 * @swagger
 * /api/usuarios-admin/ativos:
 *   get:
 *     summary: Listar usuários admin ativos
 *     tags: [Usuários Admin]
 *     responses:
 *       200:
 *         description: Lista de usuários admin ativos
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
 *                     $ref: '#/components/schemas/UsuarioAdmin'
 *                 message:
 *                   type: string
 *                   example: Usuários admin ativos encontrados com sucesso
 */
router.get('/ativos', UsuarioAdminController.getAtivos);

/**
 * @swagger
 * /api/usuarios-admin/completo:
 *   get:
 *     summary: Listar usuários admin com informações completas
 *     tags: [Usuários Admin]
 *     responses:
 *       200:
 *         description: Lista de usuários admin com informações completas
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
 *                     type: object
 *                 message:
 *                   type: string
 *                   example: Usuários admin completos encontrados com sucesso
 */
router.get('/completo', UsuarioAdminController.getUsuariosAdminCompleto);

/**
 * @swagger
 * /api/usuarios-admin/nivel/{nivel}:
 *   get:
 *     summary: Buscar usuários admin por nível
 *     tags: [Usuários Admin]
 *     parameters:
 *       - in: path
 *         name: nivel
 *         required: true
 *         schema:
 *           type: string
 *           enum: [super_admin, admin, moderador]
 *         description: Nível de administração
 *     responses:
 *       200:
 *         description: Usuários admin encontrados
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
 *                     $ref: '#/components/schemas/UsuarioAdmin'
 *                 message:
 *                   type: string
 *       400:
 *         description: Nível inválido
 */
router.get('/nivel/:nivel', UsuarioAdminController.getByNivel);

/**
 * @swagger
 * /api/usuarios-admin/usuario/{usuarioId}:
 *   get:
 *     summary: Buscar usuário admin por usuario_id
 *     tags: [Usuários Admin]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário admin encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UsuarioAdmin'
 *                 message:
 *                   type: string
 *                   example: Usuário admin encontrado com sucesso
 *       404:
 *         description: Usuário admin não encontrado
 */
router.get('/usuario/:usuarioId', UsuarioAdminController.getByUsuarioId);

/**
 * @swagger
 * /api/usuarios-admin/usuario/{usuarioId}/is-admin:
 *   get:
 *     summary: Verificar se usuário é admin
 *     tags: [Usuários Admin]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Verificação realizada
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
 *                     isAdmin:
 *                       type: boolean
 *                 message:
 *                   type: string
 *                   example: Verificação de admin realizada com sucesso
 */
router.get('/usuario/:usuarioId/is-admin', UsuarioAdminController.isAdmin);

/**
 * @swagger
 * /api/usuarios-admin/usuario/{usuarioId}/nivel:
 *   get:
 *     summary: Obter nível de admin do usuário
 *     tags: [Usuários Admin]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Nível de admin obtido
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
 *                     nivelAdmin:
 *                       type: string
 *                       nullable: true
 *                 message:
 *                   type: string
 *                   example: Nível de admin obtido com sucesso
 */
router.get('/usuario/:usuarioId/nivel', UsuarioAdminController.getNivelAdmin);

/**
 * @swagger
 * /api/usuarios-admin/usuario/{usuarioId}/permissoes:
 *   get:
 *     summary: Obter permissões especiais do usuário
 *     tags: [Usuários Admin]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Permissões especiais obtidas
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
 *                     permissoesEspeciais:
 *                       type: array
 *                       items:
 *                         type: string
 *                 message:
 *                   type: string
 *                   example: Permissões especiais obtidas com sucesso
 */
router.get('/usuario/:usuarioId/permissoes', UsuarioAdminController.getPermissoesEspeciais);

/**
 * @swagger
 * /api/usuarios-admin/{id}:
 *   get:
 *     summary: Buscar usuário admin por ID
 *     tags: [Usuários Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário admin
 *     responses:
 *       200:
 *         description: Usuário admin encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UsuarioAdmin'
 *                 message:
 *                   type: string
 *                   example: Usuário admin encontrado com sucesso
 *       404:
 *         description: Usuário admin não encontrado
 */
router.get('/:id', UsuarioAdminController.getById);

/**
 * @swagger
 * /api/usuarios-admin:
 *   post:
 *     summary: Criar usuário admin
 *     tags: [Usuários Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUsuarioAdmin'
 *     responses:
 *       201:
 *         description: Usuário admin criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UsuarioAdmin'
 *                 message:
 *                   type: string
 *                   example: Usuário admin criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', UsuarioAdminController.create);

/**
 * @swagger
 * /api/usuarios-admin/{id}:
 *   put:
 *     summary: Atualizar usuário admin
 *     tags: [Usuários Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUsuarioAdmin'
 *     responses:
 *       200:
 *         description: Usuário admin atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UsuarioAdmin'
 *                 message:
 *                   type: string
 *                   example: Usuário admin atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Usuário admin não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id', UsuarioAdminController.update);

/**
 * @swagger
 * /api/usuarios-admin/{id}:
 *   delete:
 *     summary: Deletar usuário admin
 *     tags: [Usuários Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário admin
 *     responses:
 *       200:
 *         description: Usuário admin deletado com sucesso
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
 *                   example: Usuário admin deletado com sucesso
 *       404:
 *         description: Usuário admin não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', UsuarioAdminController.delete);

export default router;