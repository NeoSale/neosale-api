import { Request, Response } from 'express';
import { ConfiguracoesService } from '../services/configuracoesService';
import { createConfiguracoesSchema, updateConfiguracoesSchema } from '../lib/validators';

export class ConfiguracoesController {
  static async getAll(req: Request, res: Response) {
    try {
      const cliente_id = req.headers.cliente_id as string;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório'
        });
      }
      
      const parametros = await ConfiguracoesService.getAll(cliente_id);
      return res.status(200).json({
        success: true,
        data: parametros,
        total: parametros.length
      });
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const cliente_id = req.headers.cliente_id as string;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório'
        });
      }

      const configuracao = await ConfiguracoesService.getById(cliente_id);
      
      if (!configuracao) {
        return res.status(404).json({
          success: false,
          message: 'Configuração não encontrada'
        });
      }

      return res.json({
        success: true,
        data: configuracao
      });
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const cliente_id = req.headers.cliente_id as string;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório'
        });
      }

      // Validar dados de entrada
      const validationResult = createConfiguracoesSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validationResult.error.errors
        });
      }

      const configuracao = await ConfiguracoesService.create(
        validationResult.data,
        cliente_id
      );
      
      return res.status(201).json({
        success: true,
        data: configuracao,
        message: 'Configuração criada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar configuração:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const cliente_id = req.headers.cliente_id as string;

      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório'
        });
      }

      // Validar dados de entrada
      const validationResult = updateConfiguracoesSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validationResult.error.errors
        });
      }

      // Verificar se a configuração existe
      const existingConfig = await ConfiguracoesService.getById(cliente_id);
      if (!existingConfig) {
        return res.status(404).json({
          success: false,
          message: 'Configuração não encontrada'
        });
      }

      const configuracao = await ConfiguracoesService.update(cliente_id, validationResult.data);
      
      return res.json({
        success: true,
        data: configuracao,
        message: 'Configuração atualizada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const cliente_id = req.headers.cliente_id as string;

      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório'
        });
      }

      // Verificar se a configuração existe
      const existingConfig = await ConfiguracoesService.getById(cliente_id);
      if (!existingConfig) {
        return res.status(404).json({
          success: false,
          message: 'Configuração não encontrada'
        });
      }

      await ConfiguracoesService.delete(cliente_id);
      
      return res.json({
        success: true,
        message: 'Configuração deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar configuração:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}