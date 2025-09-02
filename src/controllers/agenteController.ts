import { Request, Response } from 'express';
import { AgenteService } from '../services/agenteService';
import { createAgenteSchema, updateAgenteSchema } from '../lib/validators';

export class AgenteController {
  static async getAll(req: Request, res: Response) {
    try {
      const cliente_id = req.headers.cliente_id as string;

      const agentes = await AgenteService.getAll(cliente_id);
      return res.json({
        success: true,
        data: agentes,
        total: agentes.length
      });
    } catch (error) {
      console.error('Erro ao buscar agentes:', error);
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
      const cliente_id = req.headers.cliente_id as string;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }

      const agente = await AgenteService.getById(id, cliente_id);
      
      if (!agente) {
        return res.status(404).json({
          success: false,
          message: 'Agente não encontrado'
        });
      }

      return res.json({
        success: true,
        data: agente
      });
    } catch (error) {
      console.error('Erro ao buscar agente:', error);
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
      const cliente_id = req.headers.cliente_id as string;
      
      if (!nome) {
        return res.status(400).json({
          success: false,
          message: 'Nome é obrigatório'
        });
      }

      const agente = await AgenteService.getByNome(nome, cliente_id);
      
      if (!agente) {
        return res.status(404).json({
          success: false,
          message: 'Agente não encontrado'
        });
      }

      return res.json({
        success: true,
        data: agente
      });
    } catch (error) {
      console.error('Erro ao buscar agente por nome:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getByInstanceName(req: Request, res: Response) {
    try {
      const { instanceName } = req.params;
      const cliente_id = req.headers.cliente_id as string;
      
      if (!instanceName) {
        return res.status(400).json({
          success: false,
          message: 'Instance name é obrigatório'
        });
      }

      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'Header cliente_id é obrigatório'
        });
      }

      const agente = await AgenteService.getByInstanceName(instanceName, cliente_id);
      
      if (!agente) {
        return res.status(404).json({
          success: false,
          message: 'Agente não encontrado para esta instância'
        });
      }

      return res.json({
        success: true,
        data: agente
      });
    } catch (error) {
      console.error('Erro ao buscar agente por instance name:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getAtivos(req: Request, res: Response) {
    try {
      const cliente_id = req.headers.cliente_id as string;

      const agentesAtivos = await AgenteService.getAtivos(cliente_id);
      return res.json({
        success: true,
        data: agentesAtivos,
        total: agentesAtivos.length
      });
    } catch (error) {
      console.error('Erro ao buscar agentes ativos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getByTipoAgente(req: Request, res: Response) {
    try {
      const { tipoAgenteId } = req.params;
      const cliente_id = req.headers.cliente_id as string;
      
      if (!tipoAgenteId) {
        return res.status(400).json({
          success: false,
          message: 'ID do tipo de agente é obrigatório'
        });
      }

      const agentes = await AgenteService.getByTipoAgente(tipoAgenteId, cliente_id);
      return res.json({
        success: true,
        data: agentes,
        total: agentes.length
      });
    } catch (error) {
      console.error('Erro ao buscar agentes por tipo:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getComAgendamento(req: Request, res: Response) {
    try {
      const cliente_id = req.headers.cliente_id as string;

      const agentesComAgendamento = await AgenteService.getComAgendamento(cliente_id);
      return res.json({
        success: true,
        data: agentesComAgendamento,
        total: agentesComAgendamento.length
      });
    } catch (error) {
      console.error('Erro ao buscar agentes com agendamento:', error);
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

      const validation = createAgenteSchema.safeParse(req.body);
      
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

      // Adicionar cliente_id dos headers aos dados
      const dadosComClienteId = {
        ...validation.data,
        cliente_id
      };

      const novoAgente = await AgenteService.create(dadosComClienteId);
      
      return res.status(201).json({
        success: true,
        message: 'Agente criado com sucesso',
        data: novoAgente
      });
    } catch (error) {
      console.error('Erro ao criar agente:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('já existe')) {
          return res.status(409).json({
            success: false,
            message: error.message
          });
        }
        
        if (error.message.includes('não encontrado') || error.message.includes('inativo')) {
          return res.status(400).json({
            success: false,
            message: error.message
          });
        }
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
      const cliente_id = req.headers.cliente_id as string;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }

      const validation = updateAgenteSchema.safeParse(req.body);
      
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

      const agenteAtualizado = await AgenteService.update(id, cliente_id, validation.data);
      
      if (!agenteAtualizado) {
        return res.status(404).json({
          success: false,
          message: 'Agente não encontrado'
        });
      }

      return res.json({
        success: true,
        message: 'Agente atualizado com sucesso',
        data: agenteAtualizado
      });
    } catch (error) {
      console.error('Erro ao atualizar agente:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('já existe')) {
          return res.status(409).json({
            success: false,
            message: error.message
          });
        }
        
        if (error.message.includes('não encontrado') || error.message.includes('inativo')) {
          return res.status(400).json({
            success: false,
            message: error.message
          });
        }
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
      const cliente_id = req.headers.cliente_id as string;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }

      const agenteDeletado = await AgenteService.delete(id, cliente_id);
      
      if (!agenteDeletado) {
        return res.status(404).json({
          success: false,
          message: 'Agente não encontrado'
        });
      }

      return res.json({
        success: true,
        message: 'Agente deletado com sucesso',
        data: agenteDeletado
      });
    } catch (error) {
      console.error('Erro ao deletar agente:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}