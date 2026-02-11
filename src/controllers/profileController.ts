import { Request, Response } from 'express';
import { ProfileService, UserRole, InviteMemberInput } from '../services/profileService';
import { z } from 'zod';

// All valid roles in the system
const validRolesEnum = ['super_admin', 'admin', 'manager', 'salesperson', 'member', 'viewer'] as const;

// Validation schemas
const createProfileSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
  email: z.string().email('Email inválido'),
  full_name: z.string().optional(),
  avatar_url: z.string().url('URL do avatar inválida').optional(),
  role: z.enum(validRolesEnum).optional(),
  cliente_id: z.string().uuid('cliente_id deve ser um UUID válido').optional()
});

const updateProfileSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  full_name: z.string().optional(),
  avatar_url: z.string().url('URL do avatar inválida').optional().nullable(),
  role: z.enum(validRolesEnum).optional(),
  cliente_id: z.string().uuid('cliente_id deve ser um UUID válido').optional().nullable()
});

const inviteMemberSchema = z.object({
  email: z.string().email('Email inválido'),
  full_name: z.string().optional(),
  role: z.enum(validRolesEnum).optional(),
  cliente_id: z.string().uuid('cliente_id deve ser um UUID válido')
});

export class ProfileController {
  /**
   * GET /api/profiles
   * Get all profiles filtered by cliente_id (from header)
   */
  static async getAll(req: Request, res: Response) {
    try {
      const cliente_id = (req.headers['cliente_id'] as string) || 'f029ad69-3465-454e-ba85-e0cdb75c445f';

      const profiles = await ProfileService.getAll(cliente_id);
      return res.json({
        success: true,
        data: profiles,
        total: profiles.length
      });
    } catch (error) {
      console.error('Erro ao buscar profiles:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * GET /api/profiles/:id
   * Get profile by ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }

      const profile = await ProfileService.getById(id);

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Profile não encontrado'
        });
      }

      return res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Erro ao buscar profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * GET /api/profiles/email/:email
   * Get profile by email
   */
  static async getByEmail(req: Request, res: Response) {
    try {
      const { email } = req.params;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email é obrigatório'
        });
      }

      const profile = await ProfileService.getByEmail(email);

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Profile não encontrado'
        });
      }

      return res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Erro ao buscar profile por email:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * GET /api/profiles/role/:role
   * Get profiles by role
   */
  static async getByRole(req: Request, res: Response) {
    try {
      const { role } = req.params;

      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'Role é obrigatório'
        });
      }

      if (!validRolesEnum.includes(role as any)) {
        return res.status(400).json({
          success: false,
          message: `Role inválido. Valores permitidos: ${validRolesEnum.join(', ')}`
        });
      }

      const profiles = await ProfileService.getByRole(role as UserRole);

      return res.json({
        success: true,
        data: profiles,
        total: profiles.length
      });
    } catch (error) {
      console.error('Erro ao buscar profiles por role:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * POST /api/profiles
   * Create a new profile
   */
  static async create(req: Request, res: Response) {
    try {
      const validationResult = createProfileSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validationResult.error.errors
        });
      }

      const { id, email } = validationResult.data;

      // Check if profile already exists
      const existingProfile = await ProfileService.getById(id);
      if (existingProfile) {
        return res.status(409).json({
          success: false,
          message: 'Já existe um profile com este ID'
        });
      }

      // Check if email already exists
      const existingEmail = await ProfileService.getByEmail(email);
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'Já existe um profile com este email'
        });
      }

      const profile = await ProfileService.create(validationResult.data);

      return res.status(201).json({
        success: true,
        data: profile,
        message: 'Profile criado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * PUT /api/profiles/:id
   * Update a profile
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }

      const validationResult = updateProfileSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validationResult.error.errors
        });
      }

      // Check if profile exists
      const existingProfile = await ProfileService.getById(id);
      if (!existingProfile) {
        return res.status(404).json({
          success: false,
          message: 'Profile não encontrado'
        });
      }

      // Check if email is being updated and if it's already in use
      const { email } = validationResult.data;
      if (email && email !== existingProfile.email) {
        const existingEmail = await ProfileService.getByEmail(email);
        if (existingEmail) {
          return res.status(409).json({
            success: false,
            message: 'Já existe um profile com este email'
          });
        }
      }

      const profile = await ProfileService.update(id, validationResult.data);

      return res.json({
        success: true,
        data: profile,
        message: 'Profile atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * DELETE /api/profiles/:id
   * Delete a profile
   */
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }

      // Check if profile exists
      const existingProfile = await ProfileService.getById(id);
      if (!existingProfile) {
        return res.status(404).json({
          success: false,
          message: 'Profile não encontrado'
        });
      }

      await ProfileService.delete(id);

      return res.json({
        success: true,
        message: 'Profile deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * GET /api/profiles/:id/is-admin
   * Check if user is admin
   */
  static async isAdmin(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }

      const isAdmin = await ProfileService.isAdmin(id);

      return res.json({
        success: true,
        data: { isAdmin }
      });
    } catch (error) {
      console.error('Erro ao verificar se é admin:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * PUT /api/profiles/:id/role
   * Update user role
   */
  static async updateRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }

      const validRoles = ['super_admin', 'admin', 'member', 'viewer'];
      if (!role || !validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: `Role inválido. Valores permitidos: ${validRoles.join(', ')}`
        });
      }

      // Check if profile exists
      const existingProfile = await ProfileService.getById(id);
      if (!existingProfile) {
        return res.status(404).json({
          success: false,
          message: 'Profile não encontrado'
        });
      }

      const profile = await ProfileService.updateRole(id, role as UserRole);

      return res.json({
        success: true,
        data: profile,
        message: 'Role atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar role:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * POST /api/profiles/members/invite
   * Invite a new member
   */
  static async inviteMember(req: Request, res: Response) {
    try {
      const validationResult = inviteMemberSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validationResult.error.errors
        });
      }

      const { email, full_name, role, cliente_id } = validationResult.data;

      const result = await ProfileService.inviteMember({
        email,
        full_name,
        role,
        cliente_id
      });

      return res.status(201).json({
        success: true,
        data: result.profile,
        message: 'Convite enviado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao convidar membro:', error);
      
      if (error instanceof Error && error.message.includes('Já existe um usuário')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}
