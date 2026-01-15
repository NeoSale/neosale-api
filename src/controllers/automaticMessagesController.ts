import { Request, Response } from 'express'
import { AutomaticMessagesService } from '../services/automaticMessagesService'
import { AutomaticMessagesConfigService } from '../services/automaticMessagesConfigService'
import { createAutomaticMessageSchema, updateAutomaticMessageSchema, idParamSchema, paginationSchema, createConfigAutomaticMessagesSchema, updateConfigAutomaticMessagesSchema } from '../lib/validators'
import { z } from 'zod'

export class AutomaticMessagesController {
  // Listar mensagens automáticas com paginação por cliente
  static async listar(req: Request, res: Response): Promise<Response> {
    try {
      const cliente_id = req.headers['cliente_id'] as string;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          error: 'cliente_id é obrigatório no header'
        });
      }
      
      try {
        z.string().uuid().parse(cliente_id);
      } catch {
        return res.status(400).json({
          success: false,
          error: 'cliente_id deve ser um UUID válido'
        });
      }
      
      const params = paginationSchema.parse(req.query)
      const result = await AutomaticMessagesService.listarTodos({ ...params, clienteId: cliente_id })
      
      return res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      })
    } catch (error: any) {
      console.error('❌ Erro no controller ao listar mensagens automáticas:', error)
      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao listar mensagens automáticas'
      })
    }
  }

  // Buscar mensagem automática por ID
  static async buscarPorId(req: Request, res: Response): Promise<Response> {
    try {
      const cliente_id = req.headers['cliente_id'] as string;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          error: 'cliente_id é obrigatório no header'
        });
      }
      
      try {
        z.string().uuid().parse(cliente_id);
      } catch {
        return res.status(400).json({
          success: false,
          error: 'cliente_id deve ser um UUID válido'
        });
      }
      
      const { id } = idParamSchema.parse(req.params)
      const automaticMessage = await AutomaticMessagesService.buscarPorId(id)
      
      return res.json({
        success: true,
        data: automaticMessage
      })
    } catch (error: any) {
      console.error('❌ Erro no controller ao buscar mensagem automática:', error)
      return res.status(404).json({
        success: false,
        error: error.message || 'Mensagem automática não encontrada'
      })
    }
  }

  // Buscar mensagens automáticas por lead e cliente
  static async buscarPorLead(req: Request, res: Response): Promise<Response> {
    try {
      const { leadId } = req.params
      const cliente_id = req.headers['cliente_id'] as string;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          error: 'cliente_id é obrigatório no header'
        });
      }
      
      try {
        z.string().uuid().parse(cliente_id);
      } catch {
        return res.status(400).json({
          success: false,
          error: 'cliente_id deve ser um UUID válido'
        });
      }
      
      const automaticMessages = await AutomaticMessagesService.buscarPorLead(leadId, cliente_id)
      
      return res.json({
        success: true,
        data: automaticMessages
      })
    } catch (error: any) {
      console.error('❌ Erro no controller ao buscar mensagens automáticas por lead:', error)
      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao buscar mensagens automáticas do lead'
      })
    }
  }

  // Criar nova mensagem automática
  static async criar(req: Request, res: Response): Promise<Response> {
    try {
      const cliente_id = req.headers.cliente_id as string
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório no header'
        })
      }
      
      const data = createAutomaticMessageSchema.parse(req.body)
      const automaticMessage = await AutomaticMessagesService.criar({ ...data, cliente_id })
      
      return res.status(201).json({
        success: true,
        data: automaticMessage,
        message: 'Mensagem automática criada com sucesso'
      })
    } catch (error: any) {
      console.error('❌ Erro no controller ao criar mensagem automática:', error)
      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao criar mensagem automática'
      })
    }
  }

  // Atualizar mensagem automática
  static async atualizar(req: Request, res: Response): Promise<Response> {
    try {
      const cliente_id = req.headers['cliente_id'] as string;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          error: 'cliente_id é obrigatório no header'
        });
      }
      
      try {
        z.string().uuid().parse(cliente_id);
      } catch {
        return res.status(400).json({
          success: false,
          error: 'cliente_id deve ser um UUID válido'
        });
      }
      
      const { id } = idParamSchema.parse(req.params)
      const data = updateAutomaticMessageSchema.parse(req.body)
      const automaticMessage = await AutomaticMessagesService.atualizar(id, data)
      
      return res.json({
        success: true,
        data: automaticMessage,
        message: 'Mensagem automática atualizada com sucesso'
      })
    } catch (error: any) {
      console.error('❌ Erro no controller ao atualizar mensagem automática:', error)
      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao atualizar mensagem automática'
      })
    }
  }

  // Deletar mensagem automática
  static async deletar(req: Request, res: Response): Promise<Response> {
    try {
      const cliente_id = req.headers['cliente_id'] as string;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          error: 'cliente_id é obrigatório no header'
        });
      }
      
      try {
        z.string().uuid().parse(cliente_id);
      } catch {
        return res.status(400).json({
          success: false,
          error: 'cliente_id deve ser um UUID válido'
        });
      }
      
      const { id } = idParamSchema.parse(req.params)
      const result = await AutomaticMessagesService.deletar(id)
      
      return res.json({
        success: true,
        message: result.message
      })
    } catch (error: any) {
      console.error('❌ Erro no controller ao deletar mensagem automática:', error)
      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao deletar mensagem automática'
      })
    }
  }

  // Buscar mensagens automáticas por status
  static async buscarPorStatus(req: Request, res: Response): Promise<Response> {
    try {
      const cliente_id = req.headers['cliente_id'] as string;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          error: 'cliente_id é obrigatório no header'
        });
      }
      
      try {
        z.string().uuid().parse(cliente_id);
      } catch {
        return res.status(400).json({
          success: false,
          error: 'cliente_id deve ser um UUID válido'
        });
      }
      
      const { status } = req.params
      
      if (status !== 'sucesso' && status !== 'erro') {
        return res.status(400).json({
          success: false,
          error: 'Status deve ser "sucesso" ou "erro"'
        })
      }
      
      const automaticMessages = await AutomaticMessagesService.buscarPorStatus(status)
      
      return res.json({
        success: true,
        data: automaticMessages
      })
    } catch (error: any) {
      console.error('❌ Erro no controller ao buscar mensagens automáticas por status:', error)
      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao buscar mensagens automáticas por status'
      })
    }
  }

  // Buscar leads para envio de mensagens
  static async buscarLeadsParaEnvio(req: Request, res: Response): Promise<Response> {
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

      const leads = await AutomaticMessagesService.buscarLeadsParaEnvio(cliente_id, quantidadeNum);
      
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

  // Buscar estatísticas de mensagens automáticas por dia
  static async buscarEstatisticasPorDia(req: Request, res: Response): Promise<Response> {
    try {
      const cliente_id = req.headers['cliente_id'] as string;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          error: 'cliente_id é obrigatório no header'
        });
      }
      
      const estatisticas = await AutomaticMessagesService.getEstatisticasPorDia(cliente_id)
      
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

  // Buscar detalhes de mensagens automáticas por data
  static async buscarDetalhesPorData(req: Request, res: Response): Promise<Response> {
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
      
      const detalhes = await AutomaticMessagesService.getDetalhesPorData(cliente_id, data)
      
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

  // =====================================================
  // ENDPOINTS DE CONFIGURAÇÃO
  // =====================================================

  // Buscar configuração por cliente
  static async getConfiguracao(req: Request, res: Response): Promise<Response> {
    try {
      const cliente_id = req.headers['cliente_id'] as string;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório no cabeçalho da requisição'
        });
      }
      
      try {
        z.string().uuid().parse(cliente_id);
      } catch {
        return res.status(400).json({
          success: false,
          message: 'cliente_id deve ser um UUID válido'
        });
      }
      
      const configuracao = await AutomaticMessagesConfigService.getByClienteId(cliente_id)
      
      if (!configuracao) {
        return res.status(404).json({
          success: false,
          message: 'Configuração de mensagens automáticas não encontrada para este cliente'
        })
      }
      
      return res.json({
        success: true,
        data: configuracao,
        message: 'Configuração de mensagens automáticas recuperada com sucesso'
      })
    } catch (error) {
      console.error('Erro ao buscar configuração de mensagens automáticas:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  }

  // Buscar configuração por ID
  static async getConfiguracaoById(req: Request, res: Response): Promise<Response> {
    try {
      const cliente_id = req.headers['cliente_id'] as string;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório no cabeçalho da requisição'
        });
      }
      
      try {
        z.string().uuid().parse(cliente_id);
      } catch {
        return res.status(400).json({
          success: false,
          message: 'cliente_id deve ser um UUID válido'
        });
      }
      
      const { id } = idParamSchema.parse(req.params)
      
      const configuracao = await AutomaticMessagesConfigService.getById(id)
      
      if (!configuracao) {
        return res.status(404).json({
          success: false,
          message: 'Configuração de mensagens automáticas não encontrada'
        })
      }

      return res.json({
        success: true,
        data: configuracao,
        message: 'Configuração de mensagens automáticas recuperada com sucesso'
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Dados de entrada inválidos',
          errors: error.errors
        })
      }

      console.error('Erro ao buscar configuração de mensagens automáticas por ID:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  }

  // Criar configuração
  static async createConfiguracao(req: Request, res: Response): Promise<Response> {
    try {
      const cliente_id = req.headers['cliente_id'] as string;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório no cabeçalho da requisição'
        });
      }
      
      try {
        z.string().uuid().parse(cliente_id);
      } catch {
        return res.status(400).json({
          success: false,
          message: 'cliente_id deve ser um UUID válido'
        });
      }
      
      const validatedData = createConfigAutomaticMessagesSchema.parse(req.body)
      
      const novaConfiguracao = await AutomaticMessagesConfigService.create({ ...validatedData, cliente_id })
      
      return res.status(201).json({
        success: true,
        data: novaConfiguracao,
        message: 'Configuração de mensagens automáticas criada com sucesso'
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Dados de entrada inválidos',
          errors: error.errors
        })
      }

      console.error('Erro ao criar configuração de mensagens automáticas:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  }

  // Atualizar configuração
  static async updateConfiguracao(req: Request, res: Response): Promise<Response> {
    try {
      const cliente_id = req.headers['cliente_id'] as string;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório no cabeçalho da requisição'
        });
      }
      
      try {
        z.string().uuid().parse(cliente_id);
      } catch {
        return res.status(400).json({
          success: false,
          message: 'cliente_id deve ser um UUID válido'
        });
      }
      
      const { id } = idParamSchema.parse(req.params)
      const validatedData = updateConfigAutomaticMessagesSchema.parse(req.body)
      
      const configuracaoAtualizada = await AutomaticMessagesConfigService.update(id, validatedData)
      
      return res.json({
        success: true,
        data: configuracaoAtualizada,
        message: 'Configuração de mensagens automáticas atualizada com sucesso'
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Dados de entrada inválidos',
          errors: error.errors
        })
      }

      console.error('Erro ao atualizar configuração de mensagens automáticas:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  }

  // Buscar configurações por status ativo
  static async getConfiguracaoByAtivo(req: Request, res: Response): Promise<Response> {
    try {
      const { ativo } = req.query;
      
      if (ativo === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetro ativo é obrigatório'
        });
      }
      
      const ativoBoolean = ativo === 'true';
      
      const configuracoes = await AutomaticMessagesConfigService.getByAtivo(ativoBoolean);
      
      return res.json({
        success: true,
        data: configuracoes,
        message: `Configurações de mensagens automáticas ${ativoBoolean ? 'ativas' : 'inativas'} recuperadas com sucesso`
      });
    } catch (error) {
      console.error('Erro ao buscar configurações por status ativo:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Atualizar configuração por ID com validação de cliente
  static async updateConfiguracaoById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = idParamSchema.parse(req.params)
      const validatedData = updateConfigAutomaticMessagesSchema.parse(req.body)
      const cliente_id = req.headers['cliente_id'] as string
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório no cabeçalho da requisição'
        })
      }
      
      try {
        z.string().uuid().parse(cliente_id)
      } catch {
        return res.status(400).json({
          success: false,
          message: 'cliente_id deve ser um UUID válido'
        })
      }
      
      const { cliente_id: _, ...updateData } = validatedData
      
      const configuracaoAtualizada = await AutomaticMessagesConfigService.updateById(id, cliente_id, updateData)
      
      return res.json({
        success: true,
        data: configuracaoAtualizada,
        message: 'Configuração de mensagens automáticas atualizada com sucesso'
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Dados de entrada inválidos',
          errors: error.errors
        })
      }
      
      console.error('Erro ao atualizar configuração de mensagens automáticas:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  }
}
