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
 *         telefone:
 *           type: string
 *           nullable: true
 *           description: Telefone do usuário
 *         provedor_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID do provedor associado
 *         ativo:
 *           type: boolean
 *           description: Se o usuário está ativo
 *         embedding:
 *           type: array
 *           items:
 *             type: number
 *           nullable: true
 *           description: Vetor de embedding para busca semântica
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
 *     CreateUsuario:
 *       type: object
 *       required:
 *         - nome
 *         - email
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome do usuário
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário
 *         telefone:
 *           type: string
 *           description: Telefone do usuário
 *         provedor_id:
 *           type: string
 *           format: uuid
 *           description: ID do provedor associado
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

// Rotas para relacionamentos múltiplos
/**
 * @swagger
 * /api/usuarios/{id}/relacionamentos:
 *   get:
 *     summary: Buscar usuário com todos os relacionamentos
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
 *         description: Usuário com relacionamentos encontrado
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
 *                     revendedores:
 *                       type: array
 *                       items:
 *                         type: object
 *                     clientes:
 *                       type: array
 *                       items:
 *                         type: object
 *                     permissoes_sistema:
 *                       type: array
 *                       items:
 *                         type: object
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id/relacionamentos', UsuarioController.getUsuarioComRelacionamentos);

/**
 * @swagger
 * /api/usuarios/{id}/relacionamentos:
 *   put:
 *     summary: Atualizar usuário com relacionamentos
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
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               revendedores:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               clientes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               permissoes_sistema:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id/relacionamentos', UsuarioController.updateComRelacionamentos);

// Rotas para verificação de acesso
/**
 * @swagger
 * /api/usuarios/{id}/acesso/revendedor/{revendedorId}:
 *   get:
 *     summary: Verificar acesso do usuário a um revendedor
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: revendedorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Resultado da verificação de acesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     temAcesso:
 *                       type: boolean
 */
router.get('/:id/acesso/revendedor/:revendedorId', UsuarioController.verificarAcessoRevendedor);

/**
 * @swagger
 * /api/usuarios/{id}/acesso/cliente/{clienteId}:
 *   get:
 *     summary: Verificar acesso do usuário a um cliente
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Resultado da verificação de acesso
 */
router.get('/:id/acesso/cliente/:clienteId', UsuarioController.verificarAcessoCliente);

/**
 * @swagger
 * /api/usuarios/{id}/permissao/{permissao}:
 *   get:
 *     summary: Verificar permissão de sistema do usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: permissao
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resultado da verificação de permissão
 */
router.get('/:id/permissao/:permissao', UsuarioController.verificarPermissaoSistema);

/**
 * @swagger
 * /api/usuarios/{id}/admin:
 *   get:
 *     summary: Verificar se usuário é administrador
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Resultado da verificação de admin
 */
router.get('/:id/admin', UsuarioController.isAdmin);

// Rotas para gerenciar relacionamentos individuais
/**
 * @swagger
 * /api/usuarios/{id}/revendedores:
 *   post:
 *     summary: Adicionar revendedor ao usuário
 *     tags: [Usuários]
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
 *               - revendedor_id
 *             properties:
 *               revendedor_id:
 *                 type: string
 *                 format: uuid
 *               embedding:
 *                 type: array
 *                 items:
 *                   type: number
 *     responses:
 *       201:
 *         description: Revendedor adicionado com sucesso
 */
router.post('/:id/revendedores', UsuarioController.adicionarRevendedor);

/**
 * @swagger
 * /api/usuarios/{id}/clientes:
 *   post:
 *     summary: Adicionar cliente ao usuário
 *     tags: [Usuários]
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
 *               - cliente_id
 *             properties:
 *               cliente_id:
 *                 type: string
 *                 format: uuid
 *               embedding:
 *                 type: array
 *                 items:
 *                   type: number
 *     responses:
 *       201:
 *         description: Cliente adicionado com sucesso
 */
router.post('/:id/clientes', UsuarioController.adicionarCliente);

/**
 * @swagger
 * /api/usuarios/{id}/permissoes:
 *   post:
 *     summary: Adicionar permissão de sistema ao usuário
 *     tags: [Usuários]
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
 *               - permissao
 *             properties:
 *               permissao:
 *                 type: string
 *               embedding:
 *                 type: array
 *                 items:
 *                   type: number
 *     responses:
 *       201:
 *         description: Permissão adicionada com sucesso
 */
router.post('/:id/permissoes', UsuarioController.adicionarPermissaoSistema);

/**
 * @swagger
 * /api/usuarios/{id}/revendedores/{revendedorId}:
 *   delete:
 *     summary: Remover revendedor do usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: revendedorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Revendedor removido com sucesso
 */
router.delete('/:id/revendedores/:revendedorId', UsuarioController.removerRevendedor);

/**
 * @swagger
 * /api/usuarios/{id}/clientes/{clienteId}:
 *   delete:
 *     summary: Remover cliente do usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Cliente removido com sucesso
 */
router.delete('/:id/clientes/:clienteId', UsuarioController.removerCliente);

/**
 * @swagger
 * /api/usuarios/{id}/permissoes/{permissao}:
 *   delete:
 *     summary: Remover permissão de sistema do usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: permissao
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Permissão removida com sucesso
 */
router.delete('/:id/permissoes/:permissao', UsuarioController.removerPermissaoSistema);

export default router;