/**
 * Supabase Auth Controller
 * 
 * Controller simplificado para autenticação com Supabase.
 * A maioria das operações de auth são feitas diretamente no frontend.
 */

import { Request, Response } from 'express';
import { SupabaseAuthService } from '../services/supabaseAuthService';

export class SupabaseAuthController {
  /**
   * GET /api/auth/me
   * Retorna dados do usuário autenticado
   */
  static async me(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      return res.json({
        success: true,
        data: req.user
      });
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados do usuário'
      });
    }
  }

  /**
   * POST /api/auth/verify
   * Verifica se o token é válido
   */
  static async verify(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          data: { valido: false },
          message: 'Token não fornecido'
        });
      }

      const token = authHeader.substring(7);
      const tokenData = await SupabaseAuthService.verifyToken(token);

      if (!tokenData) {
        return res.status(401).json({
          success: false,
          data: { valido: false },
          message: 'Token inválido'
        });
      }

      return res.json({
        success: true,
        data: {
          valido: true,
          usuario_id: tokenData.userId,
          email: tokenData.email
        }
      });
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return res.status(401).json({
        success: false,
        data: { valido: false },
        message: 'Erro ao verificar token'
      });
    }
  }

  /**
   * POST /api/auth/admin/create-user
   * Criar novo usuário (apenas admin)
   */
  static async createUser(req: Request, res: Response) {
    try {
      const { email, senha, nome, telefone, perfil_id, cliente_id, revendedor_id, tipo_acesso_id } = req.body;

      // Validações
      if (!email || !senha || !nome || !perfil_id) {
        return res.status(400).json({
          success: false,
          message: 'Email, senha, nome e perfil_id são obrigatórios'
        });
      }

      // Verificar se usuário é admin
      if (!req.user || !SupabaseAuthService.isAdmin(req.user)) {
        return res.status(403).json({
          success: false,
          message: 'Apenas administradores podem criar usuários'
        });
      }

      const result = await SupabaseAuthService.createUser({
        email,
        senha,
        nome,
        telefone,
        perfil_id,
        cliente_id,
        revendedor_id,
        tipo_acesso_id
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error || 'Erro ao criar usuário'
        });
      }

      return res.status(201).json({
        success: true,
        data: {
          id: result.userId
        },
        message: 'Usuário criado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar usuário'
      });
    }
  }

  /**
   * PUT /api/auth/update-profile
   * Atualizar perfil do usuário autenticado
   */
  static async updateProfile(req: Request, res: Response) {
    try {
      if (!req.user || !req.authUserId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      const { nome, telefone } = req.body;

      const result = await SupabaseAuthService.updateUser(req.authUserId, {
        nome,
        telefone
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error || 'Erro ao atualizar perfil'
        });
      }

      return res.json({
        success: true,
        message: 'Perfil atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar perfil'
      });
    }
  }
}
