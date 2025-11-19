/**
 * Middleware de Autenticação com Supabase
 * 
 * Substitui o middleware de autenticação customizado.
 * Valida tokens JWT do Supabase e carrega dados do usuário.
 */

import { Request, Response, NextFunction } from 'express';
import { SupabaseAuthService, UserData } from '../services/supabaseAuthService';

// Estender Request para incluir userData
declare module 'express-serve-static-core' {
  interface Request {
    user?: UserData;
    authUserId?: string;
  }
}

/**
 * Middleware para verificar autenticação
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Extrair token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Token de autenticação não fornecido'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    // Verificar token com Supabase
    const tokenData = await SupabaseAuthService.verifyToken(token);
    
    if (!tokenData) {
      res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
      return;
    }

    // Buscar dados completos do usuário
    const userData = await SupabaseAuthService.getUserData(tokenData.userId);
    
    if (!userData) {
      res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
      return;
    }

    if (!userData.ativo) {
      res.status(403).json({
        success: false,
        message: 'Usuário inativo'
      });
      return;
    }

    // Atualizar último login (async, não bloqueia)
    SupabaseAuthService.updateLastLogin(tokenData.userId).catch(console.error);

    // Adicionar dados do usuário ao request
    req.user = userData;
    req.authUserId = tokenData.userId;

    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar autenticação'
    });
    return;
  }
}

/**
 * Middleware para verificar se usuário é admin
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Autenticação necessária'
    });
    return;
  }

  if (!SupabaseAuthService.isAdmin(req.user)) {
    res.status(403).json({
      success: false,
      message: 'Acesso negado. Permissão de administrador necessária.'
    });
    return;
  }

  next();
}

/**
 * Middleware para verificar permissão específica
 */
export function requirePermission(recurso: string, acao: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Autenticação necessária'
      });
      return;
    }

    if (!SupabaseAuthService.hasPermission(req.user, recurso, acao)) {
      res.status(403).json({
        success: false,
        message: `Acesso negado. Permissão necessária: ${recurso}.${acao}`
      });
      return;
    }

    next();
  };
}

/**
 * Middleware opcional de autenticação
 * Carrega dados do usuário se token estiver presente, mas não bloqueia se não estiver
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const tokenData = await SupabaseAuthService.verifyToken(token);
      
      if (tokenData) {
        const userData = await SupabaseAuthService.getUserData(tokenData.userId);
        if (userData && userData.ativo) {
          req.user = userData;
          req.authUserId = tokenData.userId;
        }
      }
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação opcional:', error);
    next(); // Continua mesmo com erro
  }
}
