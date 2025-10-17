import { Request, Response } from 'express';
import { PerfilService } from '../services/perfilService';

export class PerfilController {
  static async getAll(req: Request, res: Response) {
    try {
      const perfis = await PerfilService.getAll();
      return res.json({
        success: true,
        data: perfis,
        total: perfis.length
      });
    } catch (error) {
      console.error('Erro ao buscar perfis:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getAtivos(req: Request, res: Response) {
    try {
      const perfis = await PerfilService.getAtivos();
      return res.json({
        success: true,
        data: perfis,
        total: perfis.length
      });
    } catch (error) {
      console.error('Erro ao buscar perfis ativos:', error);
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

      const perfil = await PerfilService.getById(id);

      if (!perfil) {
        return res.status(404).json({
          success: false,
          message: 'Perfil não encontrado'
        });
      }

      return res.json({
        success: true,
        data: perfil
      });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { nome, descricao, permissoes, ativo } = req.body;

      if (!nome || !permissoes) {
        return res.status(400).json({
          success: false,
          message: 'Nome e permissões são obrigatórios'
        });
      }

      // Verificar se já existe um perfil com o mesmo nome
      const existingPerfil = await PerfilService.getByNome(nome);
      if (existingPerfil) {
        return res.status(409).json({
          success: false,
          message: 'Já existe um perfil com este nome'
        });
      }

      const perfil = await PerfilService.create({
        nome,
        descricao,
        permissoes,
        ativo
      });

      return res.status(201).json({
        success: true,
        data: perfil,
        message: 'Perfil criado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
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
      const { nome, descricao, permissoes, ativo } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }

      const existingPerfil = await PerfilService.getById(id);
      if (!existingPerfil) {
        return res.status(404).json({
          success: false,
          message: 'Perfil não encontrado'
        });
      }

      // Se está atualizando o nome, verificar se não existe outro perfil com o mesmo nome
      if (nome && nome !== existingPerfil.nome) {
        const perfilWithSameName = await PerfilService.getByNome(nome);
        if (perfilWithSameName) {
          return res.status(409).json({
            success: false,
            message: 'Já existe um perfil com este nome'
          });
        }
      }

      const perfil = await PerfilService.update(id, {
        nome,
        descricao,
        permissoes,
        ativo
      });

      return res.json({
        success: true,
        data: perfil,
        message: 'Perfil atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
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

      const existingPerfil = await PerfilService.getById(id);
      if (!existingPerfil) {
        return res.status(404).json({
          success: false,
          message: 'Perfil não encontrado'
        });
      }

      await PerfilService.delete(id);

      return res.json({
        success: true,
        message: 'Perfil deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar perfil:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getPermissoes(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }

      const perfil = await PerfilService.getById(id);

      if (!perfil) {
        return res.status(404).json({
          success: false,
          message: 'Perfil não encontrado'
        });
      }

      return res.json({
        success: true,
        data: perfil.permissoes
      });
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async updatePermissoes(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { permissoes } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }

      if (!permissoes) {
        return res.status(400).json({
          success: false,
          message: 'Permissões são obrigatórias'
        });
      }

      const perfil = await PerfilService.updatePermissoes(id, permissoes);

      return res.json({
        success: true,
        data: perfil,
        message: 'Permissões atualizadas com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar permissões:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getUsuarios(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }

      const usuarios = await PerfilService.getUsuariosPorPerfil(id);

      return res.json({
        success: true,
        data: usuarios,
        total: usuarios.length
      });
    } catch (error) {
      console.error('Erro ao buscar usuários do perfil:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}
