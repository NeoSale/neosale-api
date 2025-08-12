import { Request, Response } from 'express';
import { ParametroService } from '../services/parametroService';
import { createParametroSchema, updateParametroSchema, CreateParametroInput, UpdateParametroInput } from '../lib/validators';

export class ParametroController {
  static async getAll(req: Request, res: Response) {
    try {
      const parametros = await ParametroService.getAll();
      return res.json({
        success: true,
        data: parametros,
        total: parametros.length
      });
    } catch (error) {
      console.error('Erro ao buscar parâmetros:', error);
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

      const parametro = await ParametroService.getById(id);
      
      if (!parametro) {
        return res.status(404).json({
          success: false,
          message: 'Parâmetro não encontrado'
        });
      }

      return res.json({
        success: true,
        data: parametro
      });
    } catch (error) {
      console.error('Erro ao buscar parâmetro:', error);
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

      const parametro = await ParametroService.getByChave(chave);
      
      if (!parametro) {
        return res.status(404).json({
          success: false,
          message: 'Parâmetro não encontrado'
        });
      }

      return res.json({
        success: true,
        data: parametro
      });
    } catch (error) {
      console.error('Erro ao buscar parâmetro por chave:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const validation = createParametroSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validation.error.errors
        });
      }
      
      const { chave, valor, embedding } = validation.data;
      
      // Verificar se já existe um parâmetro com a mesma chave
      const existingParametro = await ParametroService.getByChave(chave);
      if (existingParametro) {
        return res.status(409).json({
          success: false,
          message: 'Já existe um parâmetro com esta chave'
        });
      }
      
      const parametro = await ParametroService.create({
        chave,
        valor,
        embedding
      });
      
      return res.status(201).json({
        success: true,
        data: parametro
      });
    } catch (error) {
      console.error('Erro ao criar parâmetro:', error);
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
      
      const validation = updateParametroSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validation.error.errors
        });
      }
      
      const parametro = await ParametroService.update(id, validation.data);
      
      if (!parametro) {
        return res.status(404).json({
          success: false,
          message: 'Parâmetro não encontrado'
        });
      }
      
      return res.json({
        success: true,
        data: parametro
      });
    } catch (error) {
      console.error('Erro ao atualizar parâmetro:', error);
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

      // Verificar se o parâmetro existe
      const existingConfig = await ParametroService.getById(id);
      if (!existingConfig) {
        return res.status(404).json({
          success: false,
          message: 'Parâmetro não encontrado'
        });
      }

      await ParametroService.delete(id);
      
      return res.json({
        success: true,
        message: 'Parâmetro deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar parâmetro:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}