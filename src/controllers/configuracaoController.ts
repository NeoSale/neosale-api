import { Request, Response } from 'express';
import { ConfiguracaoService } from '../services/configuracaoService';
import { createConfiguracaoSchema, updateConfiguracaoSchema, CreateConfiguracaoInput, UpdateConfiguracaoInput } from '../lib/validators';

export class ConfiguracaoController {
  static async getAll(req: Request, res: Response) {
    try {
      const { cliente_id } = req.params;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório'
        });
      }
      
      const configuracoes = await ConfiguracaoService.getAll(cliente_id);
      return res.json({
        success: true,
        data: configuracoes,
        total: configuracoes.length
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
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }

      const configuracao = await ConfiguracaoService.getById(id);
      
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

  static async getByChave(req: Request, res: Response) {
    try {
      const { chave } = req.params;
      
      if (!chave) {
        return res.status(400).json({
          success: false,
          message: 'Chave é obrigatória'
        });
      }

      const configuracao = await ConfiguracaoService.getByChave(chave);
      
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
      console.error('Erro ao buscar configuração por chave:', error);
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
      const validationResult = createConfiguracaoSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validationResult.error.errors
        });
      }

      const { chave, valor, cliente_id } = validationResult.data;

      // Verificar se já existe uma configuração com a mesma chave para este cliente
      const existingConfig = await ConfiguracaoService.getByChave(chave);
      if (existingConfig) {
        return res.status(409).json({
          success: false,
          message: 'Já existe uma configuração com esta chave'
        });
      }

      const configuracao = await ConfiguracaoService.create({ chave, valor, cliente_id });
      
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
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }

      // Validar dados de entrada
      const validationResult = updateConfiguracaoSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validationResult.error.errors
        });
      }

      const updateData = validationResult.data;

      // Verificar se a configuração existe
      const existingConfig = await ConfiguracaoService.getById(id);
      if (!existingConfig) {
        return res.status(404).json({
          success: false,
          message: 'Configuração não encontrada'
        });
      }

      // Se está atualizando a chave, verificar se não existe outra configuração com a mesma chave
      if (updateData.chave && updateData.chave !== existingConfig.chave) {
        const configWithSameKey = await ConfiguracaoService.getByChave(updateData.chave);
        if (configWithSameKey) {
          return res.status(409).json({
            success: false,
            message: 'Já existe uma configuração com esta chave'
          });
        }
      }

      const configuracao = await ConfiguracaoService.update(id, updateData);
      
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
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }

      // Verificar se a configuração existe
      const existingConfig = await ConfiguracaoService.getById(id);
      if (!existingConfig) {
        return res.status(404).json({
          success: false,
          message: 'Configuração não encontrada'
        });
      }

      await ConfiguracaoService.delete(id);
      
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