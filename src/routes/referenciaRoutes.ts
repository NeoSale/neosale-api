import { Router } from 'express'
import { ReferenciaController } from '../controllers/referenciaController'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Qualificacao:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         nome:
 *           type: string
 *     Origem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         nome:
 *           type: string
 *     EtapaFunil:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         nome:
 *           type: string
 *     StatusNegociacao:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         nome:
 *           type: string
 */

/**
 * @swagger
 * /api/referencias:
 *   get:
 *     summary: Lista todas as tabelas de referência
 *     tags: [Referências]
 *     responses:
 *       200:
 *         description: Todas as referências listadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     qualificacoes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Qualificacao'
 *                     origens:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Origem'
 *                     etapas_funil:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/EtapaFunil'
 *                     status_negociacao:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/StatusNegociacao'
 */
router.get('/', ReferenciaController.listarTodasReferencias)

/**
 * @swagger
 * /api/referencias/qualificacoes:
 *   get:
 *     summary: Lista todas as qualificações
 *     tags: [Referências]
 *     responses:
 *       200:
 *         description: Qualificações listadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Qualificacao'
 */
router.get('/qualificacoes', ReferenciaController.listarQualificacoes)

/**
 * @swagger
 * /api/referencias/origens:
 *   get:
 *     summary: Lista todas as origens de leads
 *     tags: [Referências]
 *     responses:
 *       200:
 *         description: Origens listadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Origem'
 */
router.get('/origens', ReferenciaController.listarOrigens)

/**
 * @swagger
 * /api/referencias/etapas-funil:
 *   get:
 *     summary: Lista todas as etapas do funil
 *     tags: [Referências]
 *     responses:
 *       200:
 *         description: Etapas do funil listadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EtapaFunil'
 */
router.get('/etapas-funil', ReferenciaController.listarEtapasFunil)

/**
 * @swagger
 * /api/referencias/status-negociacao:
 *   get:
 *     summary: Lista todos os status de negociação
 *     tags: [Referências]
 *     responses:
 *       200:
 *         description: Status de negociação listados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/StatusNegociacao'
 */
router.get('/status-negociacao', ReferenciaController.listarStatusNegociacao)

export default router