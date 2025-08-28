import { Request, Response } from 'express';
import { TipoAgenteService } from '../services/tipoAgenteService';
import { createTipoAgenteSchema, updateTipoAgenteSchema } from '../lib/validators';

export class TipoAgenteController {
  static async getAll(req: Request, res: Response) {
    try {
      const tiposAgente = await TipoAgenteService.getAll();
      return res.json({
        success: true,
        data: tiposAgente,
        total: tiposAgente.length
      });
    } catch (error) {
      console.error('Erro ao buscar tipos de agente:', error);
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

      const tipoAgente = await TipoAgenteService.getById(id);
      
      if (!tipoAgente) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de agente não encontrado'
        });
      }

      return res.json({
        success: true,
        data: tipoAgente
      });
    } catch (error) {
      console.error('Erro ao buscar tipo de agente:', error);
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

      const tipoAgente = await TipoAgenteService.getByNome(nome);
      
      if (!tipoAgente) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de agente não encontrado'
        });
      }

      return res.json({
        success: true,
        data: tipoAgente
      });
    } catch (error) {
      console.error('Erro ao buscar tipo de agente por nome:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getAtivos(req: Request, res: Response) {
    try {
      const tiposAgenteAtivos = await TipoAgenteService.getAtivos();
      return res.json({
        success: true,
        data: tiposAgenteAtivos,
        total: tiposAgenteAtivos.length
      });
    } catch (error) {
      console.error('Erro ao buscar tipos de agente ativos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const validation = createTipoAgenteSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }

      const novoTipoAgente = await TipoAgenteService.create(validation.data);
      
      return res.status(201).json({
        success: true,
        message: 'Tipo de agente criado com sucesso',
        data: novoTipoAgente
      });
    } catch (error) {
      console.error('Erro ao criar tipo de agente:', error);
      
      if (error instanceof Error && error.message.includes('já existe')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      
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

      const validation = updateTipoAgenteSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }

      const tipoAgenteAtualizado = await TipoAgenteService.update(id, validation.data);
      
      if (!tipoAgenteAtualizado) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de agente não encontrado'
        });
      }

      return res.json({
        success: true,
        message: 'Tipo de agente atualizado com sucesso',
        data: tipoAgenteAtualizado
      });
    } catch (error) {
      console.error('Erro ao atualizar tipo de agente:', error);
      
      if (error instanceof Error && error.message.includes('já existe')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      
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

      await TipoAgenteService.delete(id);

      return res.json({
        success: true,
        message: 'Tipo de agente deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar tipo de agente:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}