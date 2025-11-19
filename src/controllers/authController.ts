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

  /**
   * POST /api/auth/forgot-password
   * Solicitar reset de senha
   */
  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email é obrigatório'
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Email inválido'
        });
      }

      await AuthService.forgotPassword(email);

      // Sempre retornar sucesso por segurança
      return res.json({
        success: true,
        message: 'Se o email estiver cadastrado, você receberá um link para redefinir sua senha'
      });
    } catch (error) {
      console.error('Erro ao processar forgot-password:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Erro ao processar solicitação'
      });
    }
  }

  /**
   * POST /api/auth/reset-password
   * Redefinir senha com token
   */
  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, nova_senha } = req.body;

      if (!token || !nova_senha) {
        return res.status(400).json({
          success: false,
          message: 'Token e nova senha são obrigatórios'
        });
      }

      // Validar força da senha (mínimo 6 caracteres)
      if (nova_senha.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'A senha deve ter no mínimo 6 caracteres'
        });
      }

      await AuthService.resetPassword(token, nova_senha);

      return res.json({
        success: true,
        message: 'Senha redefinida com sucesso'
      });
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      
      const message = error instanceof Error ? error.message : 'Erro ao redefinir senha';
      
      return res.status(400).json({
        success: false,
        message
      });
    }
  }

  /**
   * POST /api/auth/validate-reset-token
   * Validar token de reset
   */
  static async validateResetToken(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token é obrigatório'
        });
      }

      const validacao = await AuthService.validarTokenReset(token);

      if (!validacao.valido) {
        return res.status(400).json({
          success: false,
          data: {
            valido: false
          },
          message: validacao.mensagem
        });
      }

      return res.json({
        success: true,
        data: {
          valido: true
        },
        message: 'Token válido'
      });
    } catch (error) {
      console.error('Erro ao validar token:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Erro ao validar token'
      });
    }
  }
}
