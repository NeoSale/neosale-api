import { Request, Response } from 'express';
import { UsuarioAdminService } from '../services/usuarioAdminService';
import { 
  createUsuarioAdminSchema, 
  updateUsuarioAdminSchema,
  idParamSchema
} from '../lib/validators';

export class UsuarioAdminController {
  /**
   * Buscar todos os usuários admin
   */
  static async getAll(req: Request, res: Response) {
    try {
      const usuariosAdmin = await UsuarioAdminService.getAll();
      
      return res.json({
        success: true,
        data: usuariosAdmin,
        message: 'Usuários admin encontrados com sucesso'
      });
    } catch (error) {
      console.error('Erro ao buscar usuários admin:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Buscar usuário admin por ID
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

      const usuarioAdmin = await UsuarioAdminService.getById(id);
      
      if (!usuarioAdmin) {
        return res.status(404).json({
          success: false,
          message: 'Usuário admin não encontrado'
        });
      }
      
      return res.json({
        success: true,
        data: usuarioAdmin,
        message: 'Usuário admin encontrado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao buscar usuário admin:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Buscar usuário admin por usuario_id
   */
  static async getByUsuarioId(req: Request, res: Response) {
    try {
      const { usuarioId } = req.params;
      
      if (!usuarioId) {
        return res.status(400).json({
          success: false,
          message: 'Usuario ID é obrigatório'
        });
      }

      const usuarioAdmin = await UsuarioAdminService.getByUsuarioId(usuarioId);
      
      if (!usuarioAdmin) {
        return res.status(404).json({
          success: false,
          message: 'Usuário admin não encontrado'
        });
      }
      
      return res.json({
        success: true,
        data: usuarioAdmin,
        message: 'Usuário admin encontrado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao buscar usuário admin por usuario_id:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Buscar usuários admin ativos
   */
  static async getAtivos(req: Request, res: Response) {
    try {
      const usuariosAdmin = await UsuarioAdminService.getAtivos();
      
      return res.json({
        success: true,
        data: usuariosAdmin,
        message: 'Usuários admin ativos encontrados com sucesso'
      });
    } catch (error) {
      console.error('Erro ao buscar usuários admin ativos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Buscar usuários admin por nível
   */
  static async getByNivel(req: Request, res: Response) {
    try {
      const { nivel } = req.params;
      
      if (!nivel || !['super_admin', 'admin', 'moderador'].includes(nivel)) {
        return res.status(400).json({
          success: false,
          message: 'Nível deve ser super_admin, admin ou moderador'
        });
      }

      const usuariosAdmin = await UsuarioAdminService.getByNivel(nivel as 'super_admin' | 'admin' | 'moderador');
      
      return res.json({
        success: true,
        data: usuariosAdmin,
        message: `Usuários admin de nível ${nivel} encontrados com sucesso`
      });
    } catch (error) {
      console.error('Erro ao buscar usuários admin por nível:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Criar usuário admin
   */
  static async create(req: Request, res: Response) {
    try {
      // Validar dados de entrada
      const validationResult = createUsuarioAdminSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validationResult.error.errors
        });
      }

      const usuarioAdmin = await UsuarioAdminService.create(validationResult.data);
      
      return res.status(201).json({
        success: true,
        data: usuarioAdmin,
        message: 'Usuário admin criado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar usuário admin:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Atualizar usuário admin
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

      // Validar dados de entrada
      const validationResult = updateUsuarioAdminSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validationResult.error.errors
        });
      }

      const usuarioAdmin = await UsuarioAdminService.update(id, validationResult.data);
      
      return res.json({
        success: true,
        data: usuarioAdmin,
        message: 'Usuário admin atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário admin:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Deletar usuário admin
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

      // Verificar se o usuário admin existe
      const existingUsuarioAdmin = await UsuarioAdminService.getById(id);
      if (!existingUsuarioAdmin) {
        return res.status(404).json({
          success: false,
          message: 'Usuário admin não encontrado'
        });
      }

      await UsuarioAdminService.delete(id);
      
      return res.json({
        success: true,
        message: 'Usuário admin deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar usuário admin:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Verificar se usuário é admin
   */
  static async isAdmin(req: Request, res: Response) {
    try {
      const { usuarioId } = req.params;
      
      if (!usuarioId) {
        return res.status(400).json({
          success: false,
          message: 'Usuario ID é obrigatório'
        });
      }

      const isAdmin = await UsuarioAdminService.isAdmin(usuarioId);
      
      return res.json({
        success: true,
        data: { isAdmin },
        message: 'Verificação de admin realizada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao verificar se usuário é admin:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Obter nível de admin do usuário
   */
  static async getNivelAdmin(req: Request, res: Response) {
    try {
      const { usuarioId } = req.params;
      
      if (!usuarioId) {
        return res.status(400).json({
          success: false,
          message: 'Usuario ID é obrigatório'
        });
      }

      const nivelAdmin = await UsuarioAdminService.getNivelAdmin(usuarioId);
      
      return res.json({
        success: true,
        data: { nivelAdmin },
        message: 'Nível de admin obtido com sucesso'
      });
    } catch (error) {
      console.error('Erro ao obter nível de admin:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Obter permissões especiais do usuário
   */
  static async getPermissoesEspeciais(req: Request, res: Response) {
    try {
      const { usuarioId } = req.params;
      
      if (!usuarioId) {
        return res.status(400).json({
          success: false,
          message: 'Usuario ID é obrigatório'
        });
      }

      const permissoesEspeciais = await UsuarioAdminService.getPermissoesEspeciais(usuarioId);
      
      return res.json({
        success: true,
        data: { permissoesEspeciais },
        message: 'Permissões especiais obtidas com sucesso'
      });
    } catch (error) {
      console.error('Erro ao obter permissões especiais:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Buscar usuários admin com informações completas
   */
  static async getUsuariosAdminCompleto(req: Request, res: Response) {
    try {
      const usuariosAdmin = await UsuarioAdminService.getUsuariosAdminCompleto();
      
      return res.json({
        success: true,
        data: usuariosAdmin,
        message: 'Usuários admin completos encontrados com sucesso'
      });
    } catch (error) {
      console.error('Erro ao buscar usuários admin completos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}