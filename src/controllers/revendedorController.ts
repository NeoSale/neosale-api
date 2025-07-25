import { Request, Response } from 'express';
import { RevendedorService } from '../services/revendedorService';
import { createRevendedorSchema, updateRevendedorSchema } from '../lib/validators';

export class RevendedorController {
  static async getAll(req: Request, res: Response) {
    try {
      const revendedores = await RevendedorService.getAll();
      return res.json({
        success: true,
        data: revendedores,
        total: revendedores.length
      });
    } catch (error) {
      console.error('Erro ao buscar revendedores:', error);
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

      const revendedor = await RevendedorService.getById(id);
      
      if (!revendedor) {
        return res.status(404).json({
          success: false,
          message: 'Revendedor não encontrado'
        });
      }

      return res.json({
        success: true,
        data: revendedor
      });
    } catch (error) {
      console.error('Erro ao buscar revendedor:', error);
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

      const revendedor = await RevendedorService.getByEmail(email);
      
      if (!revendedor) {
        return res.status(404).json({
          success: false,
          message: 'Revendedor não encontrado'
        });
      }

      return res.json({
        success: true,
        data: revendedor
      });
    } catch (error) {
      console.error('Erro ao buscar revendedor por email:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getByStatus(req: Request, res: Response) {
    try {
      const { status } = req.params;
      
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status é obrigatório'
        });
      }

      const revendedores = await RevendedorService.getByStatus(status);
      
      return res.json({
        success: true,
        data: revendedores,
        total: revendedores.length
      });
    } catch (error) {
      console.error('Erro ao buscar revendedores por status:', error);
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
      const validationResult = createRevendedorSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validationResult.error.errors
        });
      }

      const { email } = validationResult.data;

      // Verificar se já existe um revendedor com o mesmo email
      const existingRevendedor = await RevendedorService.getByEmail(email);
      if (existingRevendedor) {
        return res.status(409).json({
          success: false,
          message: 'Já existe um revendedor com este email'
        });
      }

      const revendedor = await RevendedorService.create(validationResult.data);
      
      return res.status(201).json({
        success: true,
        data: revendedor,
        message: 'Revendedor criado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar revendedor:', error);
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
      const validationResult = updateRevendedorSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validationResult.error.errors
        });
      }

      const updateData = validationResult.data;

      // Verificar se o revendedor existe
      const existingRevendedor = await RevendedorService.getById(id);
      if (!existingRevendedor) {
        return res.status(404).json({
          success: false,
          message: 'Revendedor não encontrado'
        });
      }

      // Se está atualizando o email, verificar se não existe outro revendedor com o mesmo email
      if (updateData.email && updateData.email !== existingRevendedor.email) {
        const revendedorWithSameEmail = await RevendedorService.getByEmail(updateData.email);
        if (revendedorWithSameEmail) {
          return res.status(409).json({
            success: false,
            message: 'Já existe um revendedor com este email'
          });
        }
      }

      const revendedor = await RevendedorService.update(id, updateData);
      
      return res.json({
        success: true,
        data: revendedor,
        message: 'Revendedor atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar revendedor:', error);
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

      // Verificar se o revendedor existe
      const existingRevendedor = await RevendedorService.getById(id);
      if (!existingRevendedor) {
        return res.status(404).json({
          success: false,
          message: 'Revendedor não encontrado'
        });
      }

      await RevendedorService.delete(id);
      
      return res.json({
        success: true,
        message: 'Revendedor deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar revendedor:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}