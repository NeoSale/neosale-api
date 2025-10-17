import { Router } from 'express';
import { ConviteController } from '../controllers/conviteController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Convite:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         telefone:
 *           type: string
 *         nome:
 *           type: string
 *         token:
 *           type: string
 *         perfil_id:
 *           type: string
 *           format: uuid
 *         tipo_acesso_id:
 *           type: string
 *           format: uuid
 *         cliente_id:
 *           type: string
 *           format: uuid
 *         revendedor_id:
 *           type: string
 *           format: uuid
 *         convidado_por:
 *           type: string
 *           format: uuid
 *         status:
 *           type: string
 *           enum: [pendente, aceito, expirado, cancelado]
 *         expira_em:
 *           type: string
 *           format: date-time
 *         aceito_em:
 *           type: string
 *           format: date-time
 *         mensagem_personalizada:
 *           type: string
 *         enviado_email:
 *           type: boolean
 *         enviado_whatsapp:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/convites:
 *   get:
 *     summary: Listar todos os convites
 *     tags: [Convites]
 *     responses:
 *       200:
 *         description: Lista de convites
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
 *                     $ref: '#/components/schemas/Convite'
 */
router.get('/', ConviteController.getAll);

/**
 * @swagger
 * /api/convites/{id}:
 *   get:
 *     summary: Buscar convite por ID
 *     tags: [Convites]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Convite encontrado
 *       404:
 *         description: Convite não encontrado
 */
router.get('/:id', ConviteController.getById);

/**
 * @swagger
 * /api/convites/token/{token}:
 *   get:
 *     summary: Validar token de convite
 *     tags: [Convites]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Token válido
 *       400:
 *         description: Token inválido ou expirado
 */
router.get('/token/:token', ConviteController.validarToken);

/**
 * @swagger
 * /api/convites:
 *   post:
 *     summary: Criar novo convite
 *     tags: [Convites]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - convidado_por
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do convidado
 *               telefone:
 *                 type: string
 *                 description: Telefone do convidado
 *               nome:
 *                 type: string
 *                 description: Nome do convidado
 *               perfil_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID do perfil a ser atribuído
 *               tipo_acesso_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID do tipo de acesso a ser atribuído
 *               cliente_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID do cliente
 *               revendedor_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID do revendedor
 *               convidado_por:
 *                 type: string
 *                 format: uuid
 *                 description: ID do usuário que está enviando o convite (obrigatório até implementar JWT)
 *               mensagem_personalizada:
 *                 type: string
 *                 description: Mensagem personalizada para o convite
 *               dias_expiracao:
 *                 type: integer
 *                 default: 7
 *                 description: Número de dias até o convite expirar
 *     responses:
 *       201:
 *         description: Convite criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', ConviteController.create);

/**
 * @swagger
 * /api/convites/{id}/aceitar:
 *   post:
 *     summary: Aceitar convite
 *     tags: [Convites]
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
 *               - usuario_criado_id
 *             properties:
 *               usuario_criado_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Convite aceito com sucesso
 */
router.post('/:id/aceitar', ConviteController.aceitar);

/**
 * @swagger
 * /api/convites/{id}/reenviar:
 *   post:
 *     summary: Reenviar convite
 *     tags: [Convites]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Convite reenviado com sucesso
 */
router.post('/:id/reenviar', ConviteController.reenviar);

/**
 * @swagger
 * /api/convites/{id}:
 *   delete:
 *     summary: Cancelar convite
 *     tags: [Convites]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Convite cancelado com sucesso
 */
router.delete('/:id', ConviteController.cancelar);

/**
 * @swagger
 * /api/convites/limpar/expirados:
 *   post:
 *     summary: Limpar convites expirados
 *     tags: [Convites]
 *     responses:
 *       200:
 *         description: Convites expirados limpos
 */
router.post('/limpar/expirados', ConviteController.limparExpirados);

export default router;
