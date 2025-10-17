import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

// Estender interface Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

/**
 * Middleware para verificar autenticação
 * Uso: router.get('/rota-protegida', authMiddleware, controller)
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extrair token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido. Use o header Authorization: Bearer <token>'
      });
    }

    // Formato esperado: "Bearer <token>"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido. Use: Bearer <token>'
      });
    }

    const token = parts[1];

    // Verificar token
    const payload = await AuthService.verificarToken(token);

    // Adicionar dados do usuário ao request
    req.user = {
      id: payload.id,
      email: payload.email
    };

    // Continuar para o próximo middleware/controller
    return next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token inválido';
    
    return res.status(401).json({
      success: false,
      message
    });
  }
};

/**
 * Middleware opcional - não bloqueia se não houver token
 * Uso: router.get('/rota', optionalAuthMiddleware, controller)
 */
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const parts = authHeader.split(' ');

      if (parts.length === 2 && parts[0] === 'Bearer') {
        const token = parts[1];
        const payload = await AuthService.verificarToken(token);

        req.user = {
          id: payload.id,
          email: payload.email
        };
      }
    }

    return next();
  } catch (error) {
    // Ignora erro e continua sem autenticação
    return next();
  }
};
