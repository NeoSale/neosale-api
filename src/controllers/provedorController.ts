import { Request, Response } from 'express';
import { ProvedorService } from '../services/provedorService';
import { createProvedorSchema, updateProvedorSchema } from '../lib/validators';

export class ProvedorController {
  static async getAll(req: Request, res: Response) {
    try {
      const { cliente_id } = req.params;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório'
        });
      }
      
      const provedores = await ProvedorService.getAll(cliente_id);
      return res.json({
        success: true,
        data: provedores,
        total: provedores.length
      });
    } catch (error) {
      console.error('Erro ao buscar provedores:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id, cliente_id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório'
        });
        return;
      }

      const provedor = await ProvedorService.getById(id, cliente_id);
      
      if (!provedor) {
        return res.status(404).json({
          success: false,
          message: 'Provedor não encontrado'
        });
      }

      return res.json({
        success: true,
        data: provedor
      });
    } catch (error) {
      console.error('Erro ao buscar provedor:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getByNome(req: Request, res: Response) {
    try {
      const { nome, cliente_id } = req.params;
      
      if (!nome) {
        return res.status(400).json({
          success: false,
          message: 'Nome é obrigatório'
        });
        return;
      }
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório'
        });
        return;
      }

      const provedor = await ProvedorService.getByNome(nome, cliente_id);
      
      if (!provedor) {
        return res.status(404).json({
          success: false,
          message: 'Provedor não encontrado'
        });
      }

      return res.json({
        success: true,
        data: provedor
      });
    } catch (error) {
      console.error('Erro ao buscar provedor por nome:', error);
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
      const validationResult = createProvedorSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validationResult.error.errors
        });
      }

      const { nome } = validationResult.data;

      // Verificar se já existe um provedor com o mesmo nome
      const existingProvedor = await ProvedorService.getByNome(nome);
      if (existingProvedor) {
        return res.status(409).json({
          success: false,
          message: 'Já existe um provedor com este nome'
        });
      }

      const provedor = await ProvedorService.create(validationResult.data);
      
      return res.status(201).json({
        success: true,
        data: provedor,
        message: 'Provedor criado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar provedor:', error);
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
      const validationResult = updateProvedorSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validationResult.error.errors
        });
      }

      const updateData = validationResult.data;

      // Verificar se o provedor existe
      const existingProvedor = await ProvedorService.getById(id);
      if (!existingProvedor) {
        return res.status(404).json({
          success: false,
          message: 'Provedor não encontrado'
        });
      }

      // Se está atualizando o nome, verificar se não existe outro provedor com o mesmo nome
      if (updateData.nome && updateData.nome !== existingProvedor.nome) {
        const provedorWithSameName = await ProvedorService.getByNome(updateData.nome);
        if (provedorWithSameName) {
          return res.status(409).json({
            success: false,
            message: 'Já existe um provedor com este nome'
          });
        }
      }

      const provedor = await ProvedorService.update(id, updateData);
      
      return res.json({
        success: true,
        data: provedor,
        message: 'Provedor atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar provedor:', error);
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

      // Verificar se o provedor existe
      const existingProvedor = await ProvedorService.getById(id);
      if (!existingProvedor) {
        return res.status(404).json({
          success: false,
          message: 'Provedor não encontrado'
        });
      }

      await ProvedorService.delete(id);
      
      return res.json({
        success: true,
        message: 'Provedor deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar provedor:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}