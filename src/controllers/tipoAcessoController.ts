import { Request, Response } from 'express';
import { TipoAcessoService } from '../services/tipoAcessoService';
import { createTipoAcessoSchema, updateTipoAcessoSchema } from '../lib/validators';

export class TipoAcessoController {
  static async getAll(req: Request, res: Response) {
    try {
      const tiposAcesso = await TipoAcessoService.getAll();
      return res.json({
        success: true,
        data: tiposAcesso,
        total: tiposAcesso.length
      });
    } catch (error) {
      console.error('Erro ao buscar tipos de acesso:', error);
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

      const tipoAcesso = await TipoAcessoService.getById(id);
      
      if (!tipoAcesso) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de acesso não encontrado'
        });
      }

      return res.json({
        success: true,
        data: tipoAcesso
      });
    } catch (error) {
      console.error('Erro ao buscar tipo de acesso:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getByNome(req: Request, res: Response) {
    try {
      const { nome } = req.params;
      
      if (!nome) {
        return res.status(400).json({
          success: false,
          message: 'Nome é obrigatório'
        });
      }

      const tipoAcesso = await TipoAcessoService.getByNome(nome);
      
      if (!tipoAcesso) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de acesso não encontrado'
        });
      }

      return res.json({
        success: true,
        data: tipoAcesso
      });
    } catch (error) {
      console.error('Erro ao buscar tipo de acesso por nome:', error);
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
      const validationResult = createTipoAcessoSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validationResult.error.errors
        });
      }

      const { nome } = validationResult.data;

      // Verificar se já existe um tipo de acesso com o mesmo nome
      const existingTipoAcesso = await TipoAcessoService.getByNome(nome);
      if (existingTipoAcesso) {
        return res.status(409).json({
          success: false,
          message: 'Já existe um tipo de acesso com este nome'
        });
      }

      const tipoAcesso = await TipoAcessoService.create(validationResult.data);
      
      return res.status(201).json({
        success: true,
        data: tipoAcesso,
        message: 'Tipo de acesso criado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar tipo de acesso:', error);
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
      const validationResult = updateTipoAcessoSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validationResult.error.errors
        });
      }

      const updateData = validationResult.data;

      // Verificar se o tipo de acesso existe
      const existingTipoAcesso = await TipoAcessoService.getById(id);
      if (!existingTipoAcesso) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de acesso não encontrado'
        });
      }

      // Se está atualizando o nome, verificar se não existe outro tipo de acesso com o mesmo nome
      if (updateData.nome && updateData.nome !== existingTipoAcesso.nome) {
        const tipoAcessoWithSameName = await TipoAcessoService.getByNome(updateData.nome);
        if (tipoAcessoWithSameName) {
          return res.status(409).json({
            success: false,
            message: 'Já existe um tipo de acesso com este nome'
          });
        }
      }

      const tipoAcesso = await TipoAcessoService.update(id, updateData);
      
      return res.json({
        success: true,
        data: tipoAcesso,
        message: 'Tipo de acesso atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar tipo de acesso:', error);
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

      // Verificar se o tipo de acesso existe
      const existingTipoAcesso = await TipoAcessoService.getById(id);
      if (!existingTipoAcesso) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de acesso não encontrado'
        });
      }

      await TipoAcessoService.delete(id);
      
      return res.json({
        success: true,
        message: 'Tipo de acesso deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar tipo de acesso:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}