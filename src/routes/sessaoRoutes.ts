import { Router } from 'express';
import { SessaoController } from '../controllers/sessaoController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Sessao:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         usuario_id:
 *           type: string
 *           format: uuid
 *         token:
 *           type: string
 *         refresh_token:
 *           type: string
 *         ip_address:
 *           type: string
 *         user_agent:
 *           type: string
 *         dispositivo:
 *           type: string
 *         navegador:
 *           type: string
 *         sistema_operacional:
 *           type: string
 *         expira_em:
 *           type: string
 *           format: date-time
 *         ativo:
 *           type: boolean
 *         ultimo_acesso:
 *           type: string
 *           format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/sessoes:
 *   get:
 *     summary: Listar minhas sessões ativas
 *     tags: [Sessões]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de sessões do usuário
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
 *                     $ref: '#/components/schemas/Sessao'
 */
router.get('/', SessaoController.getMinhasSessoes);

/**
 * @swagger
 * /api/sessoes/{id}:
 *   get:
 *     summary: Buscar sessão por ID
 *     tags: [Sessões]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Sessão encontrada
 *       404:
 *         description: Sessão não encontrada
 */
router.get('/:id', SessaoController.getById);

/**
 * @swagger
 * /api/sessoes/{id}:
 *   delete:
 *     summary: Encerrar sessão específica
 *     tags: [Sessões]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Sessão encerrada com sucesso
 */
router.delete('/:id', SessaoController.encerrar);

/**
 * @swagger
 * /api/sessoes:
 *   delete:
 *     summary: Encerrar todas as sessões do usuário
 *     tags: [Sessões]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas as sessões encerradas com sucesso
 */
router.delete('/', SessaoController.encerrarTodas);

/**
 * @swagger
 * /api/sessoes/limpar/expiradas:
 *   post:
 *     summary: Limpar sessões expiradas
 *     tags: [Sessões]
 *     responses:
 *       200:
 *         description: Sessões expiradas limpas
 */
router.post('/limpar/expiradas', SessaoController.limparExpiradas);

export default router;
