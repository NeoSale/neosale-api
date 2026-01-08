import { Request, Response } from 'express'
import { FollowupServiceOld } from '../services/followupServiceOld'
import { createFollowupSchema, updateFollowupSchema, idParamSchema, paginationSchema } from '../lib/validators'

export class FollowupControllerOld {
  // Listar followups com paginação por cliente
  static async listarOld(req: Request, res: Response): Promise<Response> {
    try {
      const { cliente_id } = req.params;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          error: 'cliente_id é obrigatório'
        });
      }
      
      const params = paginationSchema.parse(req.query)
      const result = await FollowupServiceOld.listarTodosOld({ ...params, clienteId: cliente_id })
      
      return res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      })
    } catch (error: any) {
      console.error('❌ Erro no controller ao listar followups:', error)
      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao listar followups'
      })
    }
  }

  // Buscar followup por ID
  static async buscarPorIdOld(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = idParamSchema.parse(req.params)
      const followup = await FollowupServiceOld.buscarPorIdOld(id)
      
      return res.json({
        success: true,
        data: followup
      })
    } catch (error: any) {
      console.error('❌ Erro no controller ao buscar followup:', error)
      return res.status(404).json({
        success: false,
        error: error.message || 'Followup não encontrado'
      })
    }
  }

  // Buscar followups por lead e cliente
  static async buscarPorLeadOld(req: Request, res: Response): Promise<Response> {
    try {
      const { leadId, cliente_id } = req.params
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          error: 'cliente_id é obrigatório'
        });
      }
      
      const followups = await FollowupServiceOld.buscarPorLeadOld(leadId, cliente_id)
      
      return res.json({
        success: true,
        data: followups
      })
    } catch (error: any) {
      console.error('❌ Erro no controller ao buscar followups por lead:', error)
      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao buscar followups do lead'
      })
    }
  }

  // Criar novo followup
  static async criarOld(req: Request, res: Response): Promise<Response> {
    try {
      const cliente_id = req.headers.cliente_id as string
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório no header'
        })
      }
      
      const data = createFollowupSchema.parse(req.body)
      const followup = await FollowupServiceOld.criarOld({ ...data, cliente_id })
      
      return res.status(201).json({
        success: true,
        data: followup,
        message: 'Followup criado com sucesso'
      })
    } catch (error: any) {
      console.error('❌ Erro no controller ao criar followup:', error)
      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao criar followup'
      })
    }
  }

  // Atualizar followup
  static async atualizarOld(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = idParamSchema.parse(req.params)
      const data = updateFollowupSchema.parse(req.body)
      const followup = await FollowupServiceOld.atualizarOld(id, data)
      
      return res.json({
        success: true,
        data: followup,
        message: 'Followup atualizado com sucesso'
      })
    } catch (error: any) {
      console.error('❌ Erro no controller ao atualizar followup:', error)
      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao atualizar followup'
      })
    }
  }

  // Deletar followup
  static async deletarOld(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = idParamSchema.parse(req.params)
      const result = await FollowupServiceOld.deletarOld(id)
      
      return res.json({
        success: true,
        message: result.message
      })
    } catch (error: any) {
      console.error('❌ Erro no controller ao deletar followup:', error)
      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao deletar followup'
      })
    }
  }

  // Buscar followups por status
  static async buscarPorStatusOld(req: Request, res: Response): Promise<Response> {
    try {
      const { status } = req.params
      
      if (status !== 'sucesso' && status !== 'erro') {
        return res.status(400).json({
          success: false,
          error: 'Status deve ser "sucesso" ou "erro"'
        })
      }
      
      const followups = await FollowupServiceOld.buscarPorStatusOld(status)
      
      return res.json({
        success: true,
        data: followups
      })
    } catch (error: any) {
      console.error('❌ Erro no controller ao buscar followups por status:', error)
      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao buscar followups por status'
      })
    }
  }

  // Buscar leads para envio de mensagens
  static async buscarLeadsParaEnvioOld(req: Request, res: Response): Promise<Response> {
    try {
      const cliente_id = req.headers.cliente_id as string;
      const quantidade = req.query.quantidade as string;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          error: 'cliente_id é obrigatório no header'
        });
      }

      const quantidadeNum = parseInt(quantidade as string, 10);
      if (isNaN(quantidadeNum) || quantidadeNum <= 0) {
        return res.status(400).json({
          success: false,
          error: 'quantidade deve ser um número positivo'
        });
      }

      const leads = await FollowupServiceOld.buscarLeadsParaEnvioOld(cliente_id, quantidadeNum);
      
      return res.json({
        success: true,
        data: leads,
        total: leads?.length || 0
      });
    } catch (error: any) {
      console.error('❌ Erro no controller ao buscar leads para envio:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Erro ao buscar leads para envio'
      });
    }
  }

  // Buscar estatísticas de followups por dia
  static async buscarEstatisticasPorDiaOld(req: Request, res: Response): Promise<Response> {
    try {
      const cliente_id = req.headers['cliente_id'] as string;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          error: 'cliente_id é obrigatório no header'
        });
      }
      
      const estatisticas = await FollowupServiceOld.getEstatisticasPorDiaOld(cliente_id)
      
      return res.json({
        success: true,
        data: estatisticas
      })
    } catch (error: any) {
      console.error('❌ Erro no controller ao buscar estatísticas por dia:', error)
      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao buscar estatísticas por dia'
      })
    }
  }

  // Buscar detalhes de followups por data
  static async buscarDetalhesPorDataOld(req: Request, res: Response): Promise<Response> {
    try {
      const cliente_id = req.headers['cliente_id'] as string;
      const { data } = req.query;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          error: 'cliente_id é obrigatório no header'
        });
      }
      
      if (!data || typeof data !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Parâmetro data é obrigatório (formato: YYYY-MM-DD)'
        });
      }
      
      // Validar formato da data
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(data)) {
        return res.status(400).json({
          success: false,
          error: 'Formato de data inválido. Use YYYY-MM-DD'
        });
      }
      
      const detalhes = await FollowupServiceOld.getDetalhesPorDataOld(cliente_id, data)
      
      return res.json({
        success: true,
        data: detalhes
      })
    } catch (error: any) {
      console.error('❌ Erro no controller ao buscar detalhes por data:', error)
      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao buscar detalhes por data'
      })
    }
  }
}
