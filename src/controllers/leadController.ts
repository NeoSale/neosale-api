import { Request, Response } from 'express'
import { LeadService } from '../services/leadService'
import {
  importLeadsSchema,
  bulkLeadsSchema,
  agendamentoSchema,
  mensagemSchema,
  etapaSchema,
  statusSchema,
  idParamSchema,
  paginationSchema,
  updateLeadSchema,
  atualizarMensagemSchema
} from '../lib/validators'
import { ZodError } from 'zod'
import { createError } from '../middleware/errorHandler'

export class LeadController {
  // Utilitário para extrair ID da URL
  private static extractIdFromUrl(req: Request): string {
    const { id } = req.params
    return id || ''
  }
  
  // Utilitário para tratamento de erros
  private static handleError(res: Response, error: any) {
    console.error('❌ Erro no controller:', error)
    
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors
      })
    }
    
    if (error.code === 'PGRST116') {
      return res.status(404).json({
        success: false,
        message: 'Recurso não encontrado'
      })
    }
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
  
  // Importar leads
  static async importLeads(req: Request, res: Response) {
    
    try {
      const validatedData = importLeadsSchema.parse(req.body)
      const leads = await LeadService.importLeads(validatedData)
      
      return res.status(201).json({
        success: true,
        message: `${leads.length} leads importados com sucesso`,
        data: leads
      })
    } catch (error) {
      return LeadController.handleError(res, error)
    }
  }

  // Importar leads em lote (bulk)
  static async bulkImportLeads(req: Request, res: Response) {
    
    try {
      const validatedData = bulkLeadsSchema.parse(req.body)
      const leads = await LeadService.bulkImportLeads(validatedData)
      
      return res.status(201).json({
        success: true,
        message: `${leads.length} leads importados em lote com sucesso`,
        data: leads
      })
    } catch (error) {
      return LeadController.handleError(res, error)
    }
  }
  
  // Obter informações sobre importação
  static async getImportInfo(req: Request, res: Response) {
    
    return res.status(200).json({
      success: true,
      message: 'Endpoint para importação de leads',
      usage: {
        method: 'POST',
        body: {
          leads: [
            {
              nome: 'string',
              telefone: 'string',
              email: 'string (email válido)',
              origem_id: 'string (UUID)'
            }
          ]
        }
      }
    })
  }
  
  // Agendar lead
  static async agendarLead(req: Request, res: Response) {
    
    try {
      const id = LeadController.extractIdFromUrl(req)
      idParamSchema.parse({ id })
      
      const validatedData = agendamentoSchema.parse(req.body)
      const lead = await LeadService.agendarLead(id, validatedData)
      
      return res.status(200).json({
        success: true,
        message: 'Lead agendado com sucesso',
        data: lead
      })
    } catch (error) {
      return LeadController.handleError(res, error)
    }
  }
  
  // GET /api/leads/[id]/agendamento
  static async getAgendamentoInfo(req: Request, res: Response) {
    const id = LeadController.extractIdFromUrl(req)
    
    return res.status(200).json({
      success: true,
      message: `Endpoint para agendamento do lead ${id}`,
      usage: {
        method: 'POST',
        body: {
          agendado_em: 'string (ISO datetime) - opcional'
        }
      }
    })
  }
  
  // Enviar mensagem
  static async enviarMensagem(req: Request, res: Response) {
    try {
      const id = LeadController.extractIdFromUrl(req)
      idParamSchema.parse({ id })
      
      const validatedData = mensagemSchema.parse(req.body)
      const mensagemStatus = await LeadService.enviarMensagem(id, validatedData)
      
      return res.status(200).json({
        success: true,
        message: `${validatedData.tipo_mensagem} enviada com sucesso`,
        data: mensagemStatus
      })
    } catch (error) {
      return LeadController.handleError(res, error)
    }
  }
  
  // GET /api/leads/[id]/mensagens
  static async getMensagensInfo(req: Request, res: Response) {
    const id = LeadController.extractIdFromUrl(req)
    
    return res.status(200).json({
      success: true,
      message: `Endpoint para envio de mensagens do lead ${id}`,
      usage: {
        method: 'POST',
        body: {
          tipo_mensagem: 'mensagem_1 | mensagem_2 | mensagem_3'
        }
      }
    })
  }
  
  // Atualizar etapa do funil
  static async atualizarEtapa(req: Request, res: Response) {
    
    try {
      const id = LeadController.extractIdFromUrl(req)
      idParamSchema.parse({ id })
      
      const validatedData = etapaSchema.parse(req.body)
      const lead = await LeadService.atualizarEtapa(id, validatedData)
      
      return res.status(200).json({
        success: true,
        message: 'Etapa do funil atualizada com sucesso',
        data: lead
      })
    } catch (error) {
      return LeadController.handleError(res, error)
    }
  }
  
  // GET /api/leads/[id]/etapa
  static async getEtapaInfo(req: Request, res: Response) {
    const id = LeadController.extractIdFromUrl(req)
    
    return res.status(200).json({
      success: true,
      message: `Endpoint para atualização de etapa do lead ${id}`,
      usage: {
        method: 'PATCH',
        body: {
          etapa_funil_id: 'string (UUID)'
        }
      }
    })
  }
  
  // Atualizar status de negociação
  static async atualizarStatus(req: Request, res: Response) {
    
    try {
      const id = LeadController.extractIdFromUrl(req)
      idParamSchema.parse({ id })
      
      const validatedData = statusSchema.parse(req.body)
      const lead = await LeadService.atualizarStatus(id, validatedData)
      
      return res.status(200).json({
        success: true,
        message: 'Status de negociação atualizado com sucesso',
        data: lead
      })
    } catch (error) {
      return LeadController.handleError(res, error)
    }
  }
  
  // GET /api/leads/[id]/status
  static async getStatusInfo(req: Request, res: Response) {
    const id = LeadController.extractIdFromUrl(req)
    
    return res.status(200).json({
      success: true,
      message: `Endpoint para atualização de status do lead ${id}`,
      usage: {
        method: 'PATCH',
        body: {
          status_negociacao_id: 'string (UUID)'
        }
      }
    })
  }
  
  // GET /api/leads/[id] - Buscar lead específico
  static async buscarLead(req: Request, res: Response) {
    try {
      const id = LeadController.extractIdFromUrl(req)
      idParamSchema.parse({ id })
      
      const lead = await LeadService.buscarPorId(id)
      
      return res.status(200).json({
        success: true,
        message: 'Lead encontrado',
        data: lead
      })
    } catch (error) {
      return LeadController.handleError(res, error)
    }
  }
  
  // Listar todos os leads
  static async listarLeads(req: Request, res: Response) {
    
    try {
      console.log('📋 Listando todos os leads')
      
      const leads = await LeadService.listarTodos()
      
      return res.status(200).json({
        success: true,
        data: leads,
        message: 'Leads listados com sucesso'
      })
    } catch (error) {
      console.error('❌ Erro ao listar leads:', error)
      
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  }
  
  // Listar leads com paginação
  static async listarLeadsPaginados(req: Request, res: Response) {
    try {
      console.log('📋 Listando leads com paginação')
      
      // Validar parâmetros de paginação
      const params = paginationSchema.parse(req.query)
      
      const result = await LeadService.listarComPaginacao(params)
      
      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: 'Leads listados com sucesso'
      })
    } catch (error) {
      console.error('❌ Erro ao listar leads paginados:', error)
      
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: error.errors
        })
      }
      
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  }

  // Obter estatísticas dos leads
  static async obterEstatisticas(req: Request, res: Response) {
    try {
      console.log('📊 Solicitação de estatísticas recebida')
      
      const stats = await LeadService.obterEstatisticas()
      
      return res.status(200).json({
        success: true,
        data: stats,
        message: 'Estatísticas obtidas com sucesso'
      })
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error)
      
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  }

  // Atualizar lead
  static async atualizarLead(req: Request, res: Response) {
    try {
      // Validar ID
      const { id } = idParamSchema.parse(req.params)
      
      // Validar dados de atualização
      const dadosAtualizacao = updateLeadSchema.parse(req.body)
      
      // Atualizar lead
      const leadAtualizado = await LeadService.atualizarLead(id, dadosAtualizacao)
      
      return res.status(200).json({
        success: true,
        message: 'Lead atualizado com sucesso',
        data: leadAtualizado
      })
      
    } catch (error) {
      return LeadController.handleError(res, error)
    }
  }

  // Excluir lead
  static async excluirLead(req: Request, res: Response) {
    try {
      // Validar ID
      const { id } = idParamSchema.parse(req.params)
      
      // Excluir lead
      const resultado = await LeadService.excluirLead(id)
      
      return res.status(200).json({
        success: true,
        message: resultado.message
      })
      
    } catch (error) {
      return LeadController.handleError(res, error)
    }
  }

  // Atualizar status de mensagem enviada
  static async atualizarMensagem(req: Request, res: Response) {
    try {
      const id = LeadController.extractIdFromUrl(req)
      idParamSchema.parse({ id })
      
      const validatedData = atualizarMensagemSchema.parse(req.body)
      const mensagemStatus = await LeadService.atualizarMensagem(id, validatedData)
      
      return res.status(200).json({
        success: true,
        message: `Status da ${validatedData.tipo_mensagem} atualizado com sucesso`,
        data: mensagemStatus
      })
    } catch (error) {
      return LeadController.handleError(res, error)
    }
  }
}