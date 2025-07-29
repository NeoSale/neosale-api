import { Router } from 'express';
import { AdminController } from '../controllers/adminController';

const router = Router();

/**
 * @swagger
 * /api/admin/database/test:
 *   get:
 *     summary: Testa a conexão com o banco de dados
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Conexão testada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 connected:
 *                   type: boolean
 *                 timestamp:
 *                   type: string
 *       500:
 *         description: Erro na conexão
 */
router.get('/database/test', AdminController.testDatabaseConnection);

/**
 * @swagger
 * /api/admin/migrations/init:
 *   post:
 *     summary: Inicializa a tabela de migrations (primeira execução)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Tabela de migrations inicializada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *       500:
 *         description: Erro ao inicializar
 */
router.post('/migrations/init', AdminController.initializeMigrations);

/**
 * @swagger
 * /api/admin/migrations/run:
 *   post:
 *     summary: Executa todas as migrations pendentes
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Migrations executadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *                 timestamp:
 *                   type: string
 *       500:
 *         description: Erro ao executar migrations
 */
router.post('/migrations/run', AdminController.runMigrations);

/**
 * @swagger
 * /api/admin/migrations/status:
 *   get:
 *     summary: Obtém o status das migrations
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Status obtido com sucesso
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
 *                     total_executed:
 *                       type: number
 *                     migrations:
 *                       type: array
 *                       items:
 *                         type: object
 *                 timestamp:
 *                   type: string
 *       500:
 *         description: Erro ao obter status
 */
router.get('/migrations/status', AdminController.getMigrationsStatus);

export default router;