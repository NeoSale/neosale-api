import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

export class AuthController {
  /**
   * POST /api/auth/login
   * Realizar login
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        });
      }

      const resultado = await AuthService.login({ email, senha });

      return res.json({
        success: true,
        data: resultado,
        message: 'Login realizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      
      const message = error instanceof Error ? error.message : 'Erro ao fazer login';
      
      return res.status(401).json({
        success: false,
        message
      });
    }
  }

  /**
   * POST /api/auth/logout
   * Realizar logout
   */
  static async logout(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token não fornecido'
        });
      }

      await AuthService.logout(token);

      return res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao fazer logout',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * GET /api/auth/me
   * Buscar dados do usuário autenticado
   */
  static async me(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Token não fornecido'
        });
      }

      // Verificar token
      const payload = await AuthService.verificarToken(token);

      // Buscar dados do usuário
      const usuario = await AuthService.getUsuarioAutenticado(payload.id);

      return res.json({
        success: true,
        data: usuario
      });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      
      const message = error instanceof Error ? error.message : 'Erro ao buscar usuário';
      
      return res.status(401).json({
        success: false,
        message
      });
    }
  }

  /**
   * POST /api/auth/refresh
   * Renovar token
   */
  static async refresh(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token não fornecido'
        });
      }

      const newToken = await AuthService.refreshToken(token);

      return res.json({
        success: true,
        data: {
          token: newToken
        },
        message: 'Token renovado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      
      const message = error instanceof Error ? error.message : 'Erro ao renovar token';
      
      return res.status(401).json({
        success: false,
        message
      });
    }
  }

  /**
   * POST /api/auth/verify
   * Verificar se token é válido
   */
  static async verify(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token não fornecido'
        });
      }

      const payload = await AuthService.verificarToken(token);

      return res.json({
        success: true,
        data: {
          valido: true,
          usuario_id: payload.id,
          email: payload.email
        }
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        data: {
          valido: false
        },
        message: error instanceof Error ? error.message : 'Token inválido'
      });
    }
  }
}
