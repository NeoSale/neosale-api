import { Request, Response } from 'express';
import { ClienteService } from '../services/clienteService';
import { createClienteSchema, updateClienteSchema } from '../lib/validators';

export class ClienteController {
  static async getAllClientes(req: Request, res: Response) {
    try {
      const clientes = await ClienteService.getAllClientes();
      return res.json({
        success: true,
        data: clientes,
        total: clientes.length
      });
    } catch (error) {
      console.error('Erro ao buscar todos os clientes:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const revendedor_id = req.headers['revendedor_id'] as string;
      
      if (!revendedor_id) {
        return res.status(400).json({
          success: false,
          message: 'Header revendedor_id é obrigatório'
        });
      }
      
      const clientes = await ClienteService.getAll(revendedor_id);
      return res.json({
        success: true,
        data: clientes,
        total: clientes.length
      });
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id, revendedor_id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }
      
      const cliente = await ClienteService.getById(id, revendedor_id);
      
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }

      return res.json({
        success: true,
        data: cliente
      });
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getByEmail(req: Request, res: Response) {
    try {
      const { email, revendedor_id } = req.params;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email é obrigatório'
        });
      }

      const cliente = await ClienteService.getByEmail(email, revendedor_id);
      
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }

      return res.json({
        success: true,
        data: cliente
      });
    } catch (error) {
      console.error('Erro ao buscar cliente por email:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getByCnpj(req: Request, res: Response) {
    try {
      const { cnpj, revendedor_id } = req.params;
      
      if (!cnpj) {
        return res.status(400).json({
          success: false,
          message: 'CNPJ é obrigatório'
        });
      }

      const cliente = await ClienteService.getByCnpj(cnpj, revendedor_id);
      
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }

      return res.json({
        success: true,
        data: cliente
      });
    } catch (error) {
      console.error('Erro ao buscar cliente por CNPJ:', error);
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

      const clientes = await ClienteService.getByRevendedor(revendedorId);
      
      return res.json({
        success: true,
        data: clientes,
        total: clientes.length
      });
    } catch (error) {
      console.error('Erro ao buscar clientes por revendedor:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getByStatus(req: Request, res: Response) {
    try {
      const { status, revendedor_id } = req.params;
      
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status é obrigatório'
        });
      }
      
      if (!revendedor_id) {
        return res.status(400).json({
          success: false,
          message: 'revendedor_id é obrigatório'
        });
      }

      const clientes = await ClienteService.getByStatus(status, revendedor_id);
      
      return res.json({
        success: true,
        data: clientes,
        total: clientes.length
      });
    } catch (error) {
      console.error('Erro ao buscar clientes por status:', error);
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
      const validationResult = createClienteSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validationResult.error.errors
        });
      }

      // Dados validados, prosseguir com a criação

      const cliente = await ClienteService.create(validationResult.data);
      
      return res.status(201).json({
        success: true,
        data: cliente,
        message: 'Cliente criado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
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
      const validationResult = updateClienteSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validationResult.error.errors
        });
      }

      const updateData = validationResult.data;

      // Verificar se o cliente existe
      const existingCliente = await ClienteService.getById(id);
      if (!existingCliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }

      // Dados validados, prosseguir com a atualização

      const cliente = await ClienteService.update(id, updateData);
      
      return res.json({
        success: true,
        data: cliente,
        message: 'Cliente atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
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

      // Verificar se o cliente existe
      const existingCliente = await ClienteService.getById(id);
      if (!existingCliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }

      await ClienteService.delete(id);
      
      return res.json({
        success: true,
        message: 'Cliente deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}