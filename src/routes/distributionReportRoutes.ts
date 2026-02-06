import { Router } from 'express'
import { DistributionReportController } from '../controllers/distributionReportController'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Distribution Reports
 *   description: Lead distribution analytics and reports
 */

/**
 * @swagger
 * /api/relatorios/distribuicao:
 *   get:
 *     summary: Get distribution report for a period
 *     tags: [Distribution Reports]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: start_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Distribution report with summary, charts data, and salesperson stats
 */
router.get('/', DistributionReportController.getReport)

export default router
