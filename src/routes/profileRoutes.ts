import { Router } from 'express';
import { ProfileController } from '../controllers/profileController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Profile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: UUID from auth.users table
 *         email:
 *           type: string
 *           format: email
 *           description: User email (unique)
 *         full_name:
 *           type: string
 *           nullable: true
 *           description: User full name
 *         avatar_url:
 *           type: string
 *           format: uri
 *           nullable: true
 *           description: URL for user avatar image
 *         role:
 *           type: string
 *           enum: [super_admin, admin, member, viewer]
 *           default: viewer
 *           description: User role
 *         cliente_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID do cliente associado
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     CreateProfile:
 *       type: object
 *       required:
 *         - id
 *         - email
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: UUID from auth.users table
 *         email:
 *           type: string
 *           format: email
 *           description: User email
 *         full_name:
 *           type: string
 *           description: User full name
 *         avatar_url:
 *           type: string
 *           format: uri
 *           description: URL for user avatar image
 *         role:
 *           type: string
 *           enum: [super_admin, admin, member, viewer]
 *           default: viewer
 *           description: User role
 *         cliente_id:
 *           type: string
 *           format: uuid
 *           description: ID do cliente associado
 *     UpdateProfile:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User email
 *         full_name:
 *           type: string
 *           description: User full name
 *         avatar_url:
 *           type: string
 *           format: uri
 *           nullable: true
 *           description: URL for user avatar image
 *         role:
 *           type: string
 *           enum: [super_admin, admin, member, viewer]
 *           description: User role
 *         cliente_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID do cliente associado
 */

/**
 * @swagger
 * /api/profiles:
 *   get:
 *     summary: Get all profiles
 *     tags: [Profiles]
 *     parameters:
 *       - in: header
 *         name: cliente_id
 *         schema:
 *           type: string
 *           format: uuid
 *           default: f029ad69-3465-454e-ba85-e0cdb75c445f
 *         description: ID do cliente (opcional)
 *     responses:
 *       200:
 *         description: List of profiles
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
 *                     $ref: '#/components/schemas/Profile'
 *                 total:
 *                   type: integer
 *       500:
 *         description: Internal server error
 */
router.get('/', ProfileController.getAll);

/**
 * @swagger
 * /api/profiles/members/invite:
 *   post:
 *     summary: Invite a new member
 *     tags: [Profiles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - cliente_id
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário a ser convidado
 *               full_name:
 *                 type: string
 *                 description: Nome completo do usuário
 *               role:
 *                 type: string
 *                 enum: [super_admin, admin, member, viewer]
 *                 default: member
 *                 description: Role do usuário
 *               cliente_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID do cliente
 *           example:
 *             email: "novo@exemplo.com"
 *             full_name: "Novo Usuário"
 *             role: "member"
 *             cliente_id: "f029ad69-3465-454e-ba85-e0cdb75c445f"
 *     responses:
 *       201:
 *         description: Convite enviado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Profile'
 *                 message:
 *                   type: string
 *                   example: Convite enviado com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Email já existe
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/members/invite', ProfileController.inviteMember);

/**
 * @swagger
 * /api/profiles/email/{email}:
 *   get:
 *     summary: Get profile by email
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: User email
 *     responses:
 *       200:
 *         description: Profile found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Profile'
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
 */
router.get('/email/:email', ProfileController.getByEmail);

/**
 * @swagger
 * /api/profiles/role/{role}:
 *   get:
 *     summary: Get profiles by role
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [super_admin, admin, member, viewer]
 *         description: User role
 *     responses:
 *       200:
 *         description: List of profiles with specified role
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
 *                     $ref: '#/components/schemas/Profile'
 *                 total:
 *                   type: integer
 *       400:
 *         description: Invalid role
 *       500:
 *         description: Internal server error
 */
router.get('/role/:role', ProfileController.getByRole);

/**
 * @swagger
 * /api/profiles/{id}:
 *   get:
 *     summary: Get profile by ID
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Profile ID (UUID from auth.users)
 *     responses:
 *       200:
 *         description: Profile found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Profile'
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', ProfileController.getById);

/**
 * @swagger
 * /api/profiles:
 *   post:
 *     summary: Create a new profile
 *     tags: [Profiles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProfile'
 *           examples:
 *             complete:
 *               summary: Complete profile
 *               value:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 email: "user@example.com"
 *                 full_name: "John Doe"
 *                 avatar_url: "https://example.com/avatar.jpg"
 *                 role: "editor"
 *             minimal:
 *               summary: Minimal profile
 *               value:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 email: "user@example.com"
 *     responses:
 *       201:
 *         description: Profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Profile'
 *                 message:
 *                   type: string
 *                   example: Profile criado com sucesso
 *       400:
 *         description: Invalid data
 *       409:
 *         description: Profile already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', ProfileController.create);

/**
 * @swagger
 * /api/profiles/{id}:
 *   put:
 *     summary: Update a profile
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Profile ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfile'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Profile'
 *                 message:
 *                   type: string
 *                   example: Profile atualizado com sucesso
 *       400:
 *         description: Invalid data
 *       404:
 *         description: Profile not found
 *       409:
 *         description: Email already in use
 *       500:
 *         description: Internal server error
 */
router.put('/:id', ProfileController.update);

/**
 * @swagger
 * /api/profiles/{id}:
 *   delete:
 *     summary: Delete a profile
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Profile ID
 *     responses:
 *       200:
 *         description: Profile deleted successfully
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
 *                   example: Profile deletado com sucesso
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', ProfileController.delete);

/**
 * @swagger
 * /api/profiles/{id}/is-admin:
 *   get:
 *     summary: Check if user is admin
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Profile ID
 *     responses:
 *       200:
 *         description: Admin check result
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
 *       500:
 *         description: Internal server error
 */
router.get('/:id/is-admin', ProfileController.isAdmin);

/**
 * @swagger
 * /api/profiles/{id}/role:
 *   put:
 *     summary: Update user role
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Profile ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [super_admin, admin, member, viewer]
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Profile'
 *                 message:
 *                   type: string
 *                   example: Role atualizado com sucesso
 *       400:
 *         description: Invalid role
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/role', ProfileController.updateRole);

export default router;
