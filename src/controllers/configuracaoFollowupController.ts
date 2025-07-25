import { Request, Response } from 'express';
import { ConfiguracaoFollowupService } from '../services/configuracaoFollowupService';
import { createConfiguracaoFollowupSchema, updateConfiguracaoFollowupSchema } from '../lib/validators';

export class ConfiguracaoFollowupController {
  static async getAll(req: Request, res: Response) {
    try {
      const configuracoes = await ConfiguracaoFollowupService.getAll();
      return res.json({
        success: true,
        data: configuracoes,
        total: configuracoes.length
      });
    } catch (error) {
      console.error('Erro ao buscar configurações de followup:', error);
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

      const configuracao = await ConfiguracaoFollowupService.getById(id);
      
      if (!configuracao) {
        return res.status(404).json({
          success: false,
          message: 'Configuração de followup não encontrada'
        });
      }

      return res.json({
        success: true,
        data: configuracao
      });
    } catch (error) {
      console.error('Erro ao buscar configuração de followup:', error);
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
      const validationResult = createConfiguracaoFollowupSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validationResult.error.errors
        });
      }

      const configuracao = await ConfiguracaoFollowupService.create(validationResult.data);
      
      return res.status(201).json({
        success: true,
        data: configuracao,
        message: 'Configuração de followup criada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar configuração de followup:', error);
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
      const validationResult = updateConfiguracaoFollowupSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validationResult.error.errors
        });
      }

      // Verificar se a configuração existe
      const existingConfig = await ConfiguracaoFollowupService.getById(id);
      if (!existingConfig) {
        return res.status(404).json({
          success: false,
          message: 'Configuração de followup não encontrada'
        });
      }

      const configuracao = await ConfiguracaoFollowupService.update(id, validationResult.data);
      
      return res.json({
        success: true,
        data: configuracao,
        message: 'Configuração de followup atualizada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar configuração de followup:', error);
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

      // Verificar se a configuração existe
      const existingConfig = await ConfiguracaoFollowupService.getById(id);
      if (!existingConfig) {
        return res.status(404).json({
          success: false,
          message: 'Configuração de followup não encontrada'
        });
      }

      await ConfiguracaoFollowupService.delete(id);
      
      return res.json({
        success: true,
        message: 'Configuração de followup deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar configuração de followup:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}