import { Request, Response } from 'express';
import { UsuarioService } from '../services/usuarioService';
import { createUsuarioSchema, updateUsuarioSchema } from '../lib/validators';

export class UsuarioController {
  static async getAll(req: Request, res: Response) {
    try {
      const usuarios = await UsuarioService.getAll();
      return res.json({
        success: true,
        data: usuarios,
        total: usuarios.length
      });
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }

      const usuario = await UsuarioService.getById(id);
      
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      return res.json({
        success: true,
        data: usuario
      });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getByEmail(req: Request, res: Response) {
    try {
      const { email } = req.params;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email é obrigatório'
        });
      }

      const usuario = await UsuarioService.getByEmail(email);
      
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      return res.json({
        success: true,
        data: usuario
      });
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getByTipoAcesso(req: Request, res: Response) {
    try {
      const { tipoAcessoId } = req.params;
      
      if (!tipoAcessoId) {
        return res.status(400).json({
          success: false,
          message: 'ID do tipo de acesso é obrigatório'
        });
      }

      const usuarios = await UsuarioService.getByTipoAcesso(tipoAcessoId);
      
      return res.json({
        success: true,
        data: usuarios,
        total: usuarios.length
      });
    } catch (error) {
      console.error('Erro ao buscar usuários por tipo de acesso:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getByRevendedor(req: Request, res: Response) {
    try {
      const { revendedorId } = req.params;
      
      if (!revendedorId) {
        return res.status(400).json({
          success: false,
          message: 'ID do revendedor é obrigatório'
        });
      }

      const usuarios = await UsuarioService.getByRevendedor(revendedorId);
      
      return res.json({
        success: true,
        data: usuarios,
        total: usuarios.length
      });
    } catch (error) {
      console.error('Erro ao buscar usuários por revendedor:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getAtivos(req: Request, res: Response) {
    try {
      const usuarios = await UsuarioService.getAtivos();
      
      return res.json({
        success: true,
        data: usuarios,
        total: usuarios.length
      });
    } catch (error) {
      console.error('Erro ao buscar usuários ativos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      // Validar dados de entrada
      const validationResult = createUsuarioSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validationResult.error.errors
        });
      }

      const { email } = validationResult.data;

      // Verificar se já existe um usuário com o mesmo email
      const existingUsuario = await UsuarioService.getByEmail(email);
      if (existingUsuario) {
        return res.status(409).json({
          success: false,
          message: 'Já existe um usuário com este email'
        });
      }

      const usuario = await UsuarioService.create(validationResult.data);
      
      return res.status(201).json({
        success: true,
        data: usuario,
        message: 'Usuário criado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

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
      const validationResult = updateUsuarioSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validationResult.error.errors
        });
      }

      const updateData = validationResult.data;

      // Verificar se o usuário existe
      const existingUsuario = await UsuarioService.getById(id);
      if (!existingUsuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Se está atualizando o email, verificar se não existe outro usuário com o mesmo email
      if (updateData.email && updateData.email !== existingUsuario.email) {
        const usuarioWithSameEmail = await UsuarioService.getByEmail(updateData.email);
        if (usuarioWithSameEmail) {
          return res.status(409).json({
            success: false,
            message: 'Já existe um usuário com este email'
          });
        }
      }

      const usuario = await UsuarioService.update(id, updateData);
      
      return res.json({
        success: true,
        data: usuario,
        message: 'Usuário atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }

      // Verificar se o usuário existe
      const existingUsuario = await UsuarioService.getById(id);
      if (!existingUsuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      await UsuarioService.delete(id);
      
      return res.json({
        success: true,
        message: 'Usuário deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}