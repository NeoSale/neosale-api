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
  updateFollowupSchema,
  createLeadSchema
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
    
    // Verificar se o erro tem statusCode customizado
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
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
      error: process.env.NEXT_PUBLIC_NODE_ENV === 'development' ? error.message : undefined
    })
  }
  
  // Criar um único lead
  static async criarLead(req: Request, res: Response) {
    try {
      const cliente_id = req.headers.cliente_id as string
      const bodyWithClienteId = {
        ...req.body,
        cliente_id
      }
      
      const validatedData = createLeadSchema.parse(bodyWithClienteId)
      const lead = await LeadService.criarLead(validatedData, cliente_id)
      
      return res.status(201).json({
        success: true,
        message: 'Lead criado com sucesso',
        data: lead
      })
    } catch (error) {
      return LeadController.handleError(res, error)
    }
  }
  
  // Importar leads
  static async importLeads(req: Request, res: Response) {
    
    try {
      const validatedData = importLeadsSchema.parse(req.body)
      const result = await LeadService.importLeads(validatedData)
      
      const message = result.skipped.length > 0 
        ? `${result.created.length} leads importados com sucesso, ${result.skipped.length} leads pulados por duplicação`
        : `${result.created.length} leads importados com sucesso`
      
      return res.status(201).json({
        success: true,
        message,
        data: {
          created: result.created,
          skipped: result.skipped,
          summary: {
            total_processed: validatedData.leads.length,
            created_count: result.created.length,
            skipped_count: result.skipped.length
          }
        }
      })
    } catch (error) {
      return LeadController.handleError(res, error)
    }
  }

  // Importar leads em lote (bulk)
  static async bulkImportLeads(req: Request, res: Response) {
    
    try {
      const cliente_id = req.headers.cliente_id as string
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'Header cliente_id é obrigatório'
        })
      }

      const validatedData = bulkLeadsSchema.parse(req.body)
      const result = await LeadService.bulkImportLeads(validatedData, cliente_id)
      
      const message = result.skipped.length > 0 
        ? `${result.created.length} leads importados em lote com sucesso, ${result.skipped.length} leads pulados por duplicação`
        : `${result.created.length} leads importados em lote com sucesso`
      
      return res.status(201).json({
        success: true,
        message,
        data: {
          created: result.created,
          skipped: result.skipped,
          summary: {
            total_processed: validatedData.leads.length,
            created_count: result.created.length,
            skipped_count: result.skipped.length
          }
        }
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
          agendado_em: 'string (datetime pt-BR) - opcional'
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
        message: 'Mensagem enviada com sucesso',
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

  // GET /api/leads/telefone/[telefone] - Buscar lead por telefone e cliente
  static async buscarPorTelefone(req: Request, res: Response) {
    try {
      const { telefone } = req.params
      const cliente_id = req.headers['cliente_id'] as string
      
      if (!telefone) {
        return res.status(400).json({
          success: false,
          message: 'Telefone é obrigatório'
        })
      }
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório no header'
        })
      }
      
      const lead = await LeadService.buscarPorTelefone(telefone, cliente_id)
      
      return res.status(200).json({
        success: true,
        message: 'Lead encontrado',
        data: lead
      })
    } catch (error) {
      return LeadController.handleError(res, error)
    }
  }
  
  // Listar todos os leads por cliente
  static async listarLeads(req: Request, res: Response) {
    
    try {
      const cliente_id = req.headers['cliente_id'] as string;

      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório'
        });
      }
      
      const result = await LeadService.listarTodos(cliente_id)
      
      return res.status(200).json({
        success: true,
        data: result.leads,
        total: result.total,
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
  
  // Listar leads com paginação por cliente
  static async listarLeadsPaginados(req: Request, res: Response) {
    try {
      const cliente_id = req.headers['cliente_id'] as string;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório'
        });
      }
      
      console.log('📋 Listando leads com paginação para cliente:', cliente_id)
      
      // Validar parâmetros de paginação
      const params = paginationSchema.parse(req.query)
      
      const result = await LeadService.listarComPaginacao(params, cliente_id)
      
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

  // Obter estatísticas dos leads por cliente
  static async obterEstatisticas(req: Request, res: Response) {
    try {
      const cliente_id = req.headers['cliente_id'] as string;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório'
        });
      }
      
      console.log('📊 Solicitação de estatísticas recebida para cliente:', cliente_id)
      
      const stats = await LeadService.obterEstatisticas(cliente_id)
      
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
      
      const validatedData = updateFollowupSchema.parse(req.body)
      const mensagemStatus = await LeadService.atualizarMensagem(id, validatedData)
      
      return res.status(200).json({
        success: true,
        message: 'Status da mensagem atualizado com sucesso',
        data: mensagemStatus
      })
    } catch (error) {
      return LeadController.handleError(res, error)
    }
  }

  // Método de teste para verificar se cliente_id está sendo recebido
  static async testeClienteId(req: Request, res: Response) {
    try {
      const cliente_id = req.headers['cliente_id'] as string;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório'
        });
      }
      
      console.log('🧪 Teste - cliente_id recebido:', cliente_id)
      
      return res.status(200).json({
        success: true,
        message: 'cliente_id recebido com sucesso',
        data: {
          cliente_id: cliente_id,
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('❌ Erro no teste:', error)
      
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  }

  // PUT /api/leads/:id/ai-habilitada - Atualizar campo ai_habilitada
  static async atualizarAiHabilitada(req: Request, res: Response) {
    try {
      const id = LeadController.extractIdFromUrl(req)
      const { ai_habilitada } = req.body
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID do lead é obrigatório'
        })
      }
      
      if (typeof ai_habilitada !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Campo ai_habilitada deve ser um valor booleano'
        })
      }
      
      const result = await LeadService.atualizarAiHabilitada(id, ai_habilitada)
      
      return res.status(200).json({
        success: true,
        message: 'Campo ai_habilitada atualizado com sucesso',
        data: result
      })
    } catch (error) {
      return LeadController.handleError(res, error)
    }
  }

  // Atualizar qualificação do lead
  static async atualizarQualificacao(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { qualificacao } = req.body

      // Validar parâmetros
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID do lead é obrigatório'
        })
      }

      if (!qualificacao) {
        return res.status(400).json({
          success: false,
          message: 'Nome da qualificação é obrigatório'
        })
      }

      const result = await LeadService.atualizarQualificacaoPorNome(id, qualificacao)
      
      return res.status(200).json({
        success: true,
        message: 'Qualificação do lead atualizada com sucesso',
        data: result
      })
    } catch (error) {
      return LeadController.handleError(res, error)
    }
  }

  // Gerar relatório diário de atualizações
  static async gerarRelatorioDiario(req: Request, res: Response) {
    try {
      const cliente_id = req.headers.cliente_id as string
      const { data } = req.query

      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório no header'
        })
      }

      if (!data) {
        return res.status(400).json({
          success: false,
          message: 'data é obrigatória nos parâmetros (formato: YYYY-MM-DD)'
        })
      }

      // Validar formato da data
      const dataRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dataRegex.test(data as string)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de data inválido. Use YYYY-MM-DD (ex: 2024-11-05)'
        })
      }

      const relatorio = await LeadService.gerarRelatorioDiario(cliente_id, data as string)

      return res.status(200).json({
        success: true,
        message: 'Relatório diário gerado com sucesso',
        data: relatorio
      })
    } catch (error) {
      return LeadController.handleError(res, error)
    }
  }
}