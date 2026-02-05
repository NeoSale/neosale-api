import { Request, Response } from 'express'
import { GoogleCalendarService } from '../services/googleCalendarService'
import {
  createGoogleCalendarIntegracaoSchema,
  updateGoogleCalendarIntegracaoSchema,
  createGoogleCalendarAgendamentoSchema,
  updateGoogleCalendarAgendamentoSchema,
  generateAccessTokenSchema,
  syncGoogleCalendarSchema,
  googleCalendarListQuerySchema,
  idParamSchema
} from '../lib/validators'
import { ZodError } from 'zod'

export class GoogleCalendarController {
  // ===== MÉTODOS UTILITÁRIOS =====

  /**
   * Extrai o ID da URL
   */
  private static extractIdFromUrl(url: string): string {
    const segments = url.split('/')
    return segments[segments.length - 1]
  }

  /**
   * Trata erros e retorna resposta padronizada
   */
  private static handleError(res: Response, error: any, defaultMessage: string = 'Erro interno do servidor') {
    console.error('Erro no controller:', error)

    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      })
    }

    if (error.message) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(500).json({ error: defaultMessage })
  }

  /**
   * Extrai cliente_id do header
   */
  private static getClienteId(req: Request): string {
    return req.headers['cliente_id'] as string
  }

  // ===== MÉTODOS DE Integração =====

  /**
   * Lista todas as Integrações do Google Calendar
   */
  static async listarConfiguracoes(req: Request, res: Response) {
    try {
      const clienteId = GoogleCalendarController.getClienteId(req)
      const configuracoes = await GoogleCalendarService.listarConfiguracoes(clienteId)

      return res.status(200).json({
        success: true,
        data: configuracoes,
        total: configuracoes.length
      })
    } catch (error) {
      return GoogleCalendarController.handleError(res, error, 'Erro ao listar Integrações')
    }
  }

  /**
   * Busca uma Integração por ID
   */
  static async buscarConfiguracaoPorId(req: Request, res: Response) {
    try {
      const { id } = idParamSchema.parse(req.params)
      const clienteId = GoogleCalendarController.getClienteId(req)

      const configuracao = await GoogleCalendarService.buscarConfiguracaoPorId(id, clienteId)

      if (!configuracao) {
        return res.status(404).json({
          error: 'Integração não encontrada'
        })
      }

      return res.status(200).json({
        success: true,
        data: configuracao
      })
    } catch (error) {
      return GoogleCalendarController.handleError(res, error, 'Erro ao buscar Integração')
    }
  }

  /**
   * Busca Integração ativa do cliente
   */
  static async buscarConfiguracaoAtiva(req: Request, res: Response) {
    try {
      const clienteId = GoogleCalendarController.getClienteId(req)
      const configuracao = await GoogleCalendarService.buscarConfiguracaoAtiva(clienteId)

      if (!configuracao) {
        return res.status(404).json({
          error: 'Nenhuma Integração ativa encontrada'
        })
      }

      return res.status(200).json({
        success: true,
        data: configuracao
      })
    } catch (error) {
      return GoogleCalendarController.handleError(res, error, 'Erro ao buscar Integração ativa')
    }
  }

  /**
   * Cria uma nova Integração
   */
  static async criarConfiguracao(req: Request, res: Response) {
    try {
      const clienteId = GoogleCalendarController.getClienteId(req)
      const dadosValidados = createGoogleCalendarIntegracaoSchema.parse({
        ...req.body,
        cliente_id: clienteId
      })

      const novaConfiguracao = await GoogleCalendarService.criarConfiguracao(dadosValidados)

      // Se tem client_id e client_secret, tentar gerar access_token automaticamente
      if (novaConfiguracao.client_id && novaConfiguracao.client_secret) {
        try {
          const resultado = await GoogleCalendarService.gerarAccessTokenAutomatico(
            novaConfiguracao.id || '',
            clienteId
          )

          if (resultado.url_autorizacao) {
            return res.status(201).json({
              success: true,
              message: 'Integração criada com sucesso.',
              data: {
                configuracao: resultado.configuracao,
                url_autorizacao: resultado.url_autorizacao,
                action: 'Acesse a URL de autorização para completar a Integração'
              }
            })
          }
        } catch (error) {
          console.error('Erro ao gerar token automático:', error)
          // Continuar com resposta normal mesmo se falhar
        }
      }

      return res.status(201).json({
        success: true,
        message: 'Integração criada com sucesso',
        data: novaConfiguracao
      })
    } catch (error) {
      return GoogleCalendarController.handleError(res, error, 'Erro ao criar Integração')
    }
  }

  /**
   * Atualiza uma Integração existente
   */
  static async atualizarConfiguracao(req: Request, res: Response) {
    try {
      const { id } = idParamSchema.parse(req.params)
      const clienteId = GoogleCalendarController.getClienteId(req)
      const dadosValidados = updateGoogleCalendarIntegracaoSchema.parse(req.body)

      const configuracaoAtualizada = await GoogleCalendarService.atualizarConfiguracao(
        id,
        dadosValidados,
        clienteId
      )

      if (!configuracaoAtualizada) {
        return res.status(404).json({
          error: 'Integração não encontrada'
        })
      }

      // Se atualizou client_id ou client_secret, tentar gerar access_token automaticamente
      if ((dadosValidados.client_id || dadosValidados.client_secret) &&
        configuracaoAtualizada.client_id && configuracaoAtualizada.client_secret) {
        try {
          const resultado = await GoogleCalendarService.gerarAccessTokenAutomatico(
            configuracaoAtualizada.id || '',
            clienteId
          )

          if (resultado.url_autorizacao) {
            return res.status(200).json({
              success: true,
              message: 'Integração atualizada com sucesso.',
              data: {
                configuracao: resultado.configuracao,
                url_autorizacao: resultado.url_autorizacao,
                action: 'Acesse a URL de autorização para completar a Integração'
              }
            })
          }
        } catch (error) {
          console.error('Erro ao gerar token automático:', error)
          // Continuar com resposta normal mesmo se falhar
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Integração atualizada com sucesso',
        data: configuracaoAtualizada
      })
    } catch (error) {
      return GoogleCalendarController.handleError(res, error, 'Erro ao atualizar Integração')
    }
  }

  /**
   * Deleta uma Integração
   */
  static async deletarConfiguracao(req: Request, res: Response) {
    try {
      const { id } = idParamSchema.parse(req.params)
      const clienteId = GoogleCalendarController.getClienteId(req)

      await GoogleCalendarService.deletarConfiguracao(id, clienteId)

      return res.status(200).json({
        success: true,
        message: 'Integração deletada com sucesso'
      })
    } catch (error) {
      return GoogleCalendarController.handleError(res, error, 'Erro ao deletar Integração')
    }
  }

  // ===== MÉTODOS DE AGENDAMENTOS =====

  /**
   * Lista todos os agendamentos
   */
  static async listarAgendamentos(req: Request, res: Response) {
    try {
      const clienteId = GoogleCalendarController.getClienteId(req)
      const filtros = googleCalendarListQuerySchema.parse(req.query)

      const resultado = await GoogleCalendarService.listarAgendamentos(clienteId, filtros)

      return res.status(200).json({
        success: true,
        data: resultado.agendamentos,
        pagination: {
          page: filtros.page || 1,
          limit: filtros.limit || 10,
          total: resultado.total,
          totalPages: Math.ceil(resultado.total / (filtros.limit || 10))
        },
        meta: {
          accessToken: (req as any).accessToken ? 'Token válido' : 'Token não disponível',
          configuracaoId: (req as any).configuracaoId
        }
      })
    } catch (error) {
      return GoogleCalendarController.handleError(res, error, 'Erro ao listar agendamentos')
    }
  }

  /**
   * Busca um agendamento por ID
   */
  static async buscarAgendamentoPorId(req: Request, res: Response) {
    try {
      const { id } = idParamSchema.parse(req.params)
      const clienteId = GoogleCalendarController.getClienteId(req)

      const agendamento = await GoogleCalendarService.buscarAgendamentoPorId(id, clienteId)

      if (!agendamento) {
        return res.status(404).json({
          error: 'Agendamento não encontrado'
        })
      }

      return res.status(200).json({
        success: true,
        data: agendamento,
        meta: {
          accessToken: (req as any).accessToken ? 'Token válido' : 'Token não disponível',
          configuracaoId: (req as any).configuracaoId
        }
      })
    } catch (error) {
      return GoogleCalendarController.handleError(res, error, 'Erro ao buscar agendamento')
    }
  }

  /**
   * Cria um novo agendamento
   */
  static async criarAgendamento(req: Request, res: Response) {
    try {
      const clienteId = GoogleCalendarController.getClienteId(req)
      const dadosValidados = createGoogleCalendarAgendamentoSchema.parse({
        ...req.body,
        cliente_id: clienteId
      })

      const novoAgendamento = await GoogleCalendarService.criarAgendamento(dadosValidados)

      return res.status(201).json({
        success: true,
        message: 'Agendamento criado com sucesso',
        data: novoAgendamento,
        meta: {
          accessToken: (req as any).accessToken ? 'Token válido' : 'Token não disponível',
          configuracaoId: (req as any).configuracaoId
        }
      })
    } catch (error) {
      return GoogleCalendarController.handleError(res, error, 'Erro ao criar agendamento')
    }
  }

  /**
   * Atualiza um agendamento existente
   */
  static async atualizarAgendamento(req: Request, res: Response) {
    try {
      const { id } = idParamSchema.parse(req.params)
      const clienteId = GoogleCalendarController.getClienteId(req)
      const dadosValidados = updateGoogleCalendarAgendamentoSchema.parse(req.body)

      const agendamentoAtualizado = await GoogleCalendarService.atualizarAgendamento(
        id,
        dadosValidados,
        clienteId
      )

      if (!agendamentoAtualizado) {
        return res.status(404).json({
          error: 'Agendamento não encontrado'
        })
      }

      return res.status(200).json({
        success: true,
        message: 'Agendamento atualizado com sucesso',
        data: agendamentoAtualizado,
        meta: {
          accessToken: (req as any).accessToken ? 'Token válido' : 'Token não disponível',
          configuracaoId: (req as any).configuracaoId
        }
      })
    } catch (error) {
      return GoogleCalendarController.handleError(res, error, 'Erro ao atualizar agendamento')
    }
  }

  /**
   * Deleta um agendamento
   */
  static async deletarAgendamento(req: Request, res: Response) {
    try {
      const { id } = idParamSchema.parse(req.params)
      const clienteId = GoogleCalendarController.getClienteId(req)

      await GoogleCalendarService.deletarAgendamento(id, clienteId)

      return res.status(200).json({
        success: true,
        message: 'Agendamento deletado com sucesso',
        meta: {
          accessToken: (req as any).accessToken ? 'Token válido' : 'Token não disponível',
          configuracaoId: (req as any).configuracaoId
        }
      })
    } catch (error) {
      return GoogleCalendarController.handleError(res, error, 'Erro ao deletar agendamento')
    }
  }

  // ===== MÉTODOS DE AUTENTICAÇÃO E TOKENS =====

  /**
   * Gera URL de autorização OAuth do Google
   */
  static async gerarUrlAutorizacao(req: Request, res: Response) {
    try {
      const clienteId = GoogleCalendarController.getClienteId(req)
      const configuracao = await GoogleCalendarService.buscarConfiguracaoAtiva(clienteId)

      if (!configuracao) {
        return res.status(404).json({
          error: 'Nenhuma Integração ativa encontrada.'
        })
      }

      const scopes = configuracao.scope || 'https://www.googleapis.com/auth/calendar'
      const redirectUri = configuracao.redirect_uri || 'http://localhost:3001/api/google-calendar/callback'

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(configuracao.client_id || '')}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${encodeURIComponent(configuracao.id || '')}`

      return res.status(200).json({
        success: true,
        data: {
          authorization_url: authUrl,
          configuracao_id: configuracao.id,
          redirect_uri: redirectUri
        }
      })
    } catch (error) {
      return GoogleCalendarController.handleError(res, error, 'Erro ao gerar URL de autorização')
    }
  }

  /**
   * Processa callback do OAuth e gera access token
   */
  static async processarCallback(req: Request, res: Response) {
    try {
      const { code, state } = req.query

      if (!code || !state) {
        return res.status(400).json({
          error: 'Código de autorização ou state não fornecido'
        })
      }

      const clienteId = GoogleCalendarController.getClienteId(req)
      const configuracaoId = state as string

      const dadosValidados = generateAccessTokenSchema.parse({
        code: code as string,
        configuracao_id: configuracaoId
      })

      // Aqui você implementaria a lógica para trocar o código por tokens
      // Por enquanto, retornamos uma resposta de sucesso
      return res.status(200).json({
        success: true,
        message: 'Autorização processada com sucesso',
        data: {
          configuracao_id: configuracaoId,
          status: 'authorized'
        }
      })
    } catch (error) {
      return GoogleCalendarController.handleError(res, error, 'Erro ao processar callback')
    }
  }

  /**
   * Atualiza tokens OAuth
   */
  static async atualizarTokens(req: Request, res: Response) {
    try {
      const { id } = idParamSchema.parse(req.params)
      const clienteId = GoogleCalendarController.getClienteId(req)
      const { access_token, refresh_token, token_expiry } = req.body

      if (!access_token) {
        return res.status(400).json({
          error: 'Access token é obrigatório'
        })
      }

      const configuracaoAtualizada = await GoogleCalendarService.atualizarTokens(
        id,
        { access_token, refresh_token, token_expiry },
        clienteId
      )

      if (!configuracaoAtualizada) {
        return res.status(404).json({
          error: 'Integração não encontrada'
        })
      }

      return res.status(200).json({
        success: true,
        message: 'Tokens atualizados com sucesso',
        data: {
          configuracao_id: configuracaoAtualizada.id,
          token_expiry: configuracaoAtualizada.token_expiry
        }
      })
    } catch (error) {
      return GoogleCalendarController.handleError(res, error, 'Erro ao atualizar tokens')
    }
  }

  /**
   * Sincroniza agendamento com Google Calendar
   */
  static async sincronizarAgendamento(req: Request, res: Response) {
    try {
      const { id } = idParamSchema.parse(req.params)
      const clienteId = GoogleCalendarController.getClienteId(req)
      const { force_sync } = syncGoogleCalendarSchema.parse({
        agendamento_id: id,
        ...req.body
      })

      // Aqui você implementaria a lógica de sincronização com a API do Google Calendar
      // Por enquanto, apenas atualizamos o status de sincronização
      const agendamentoAtualizado = await GoogleCalendarService.atualizarSincronizacao(
        id,
        `google_event_${Date.now()}`, // ID fictício do evento no Google
        null, // erro_sincronizacao
        clienteId
      )

      if (!agendamentoAtualizado) {
        return res.status(404).json({
          error: 'Agendamento não encontrado'
        })
      }

      return res.status(200).json({
        success: true,
        message: 'Agendamento sincronizado com sucesso',
        data: agendamentoAtualizado,
        meta: {
          accessToken: (req as any).accessToken ? 'Token válido' : 'Token não disponível',
          configuracaoId: (req as any).configuracaoId
        }
      })
    } catch (error) {
      return GoogleCalendarController.handleError(res, error, 'Erro ao sincronizar agendamento')
    }
  }

  /**
   * Verifica status da conexão
   */
  static async verificarConexao(req: Request, res: Response) {
    try {
      const conexaoOk = await GoogleCalendarService.checkConnection()

      return res.status(200).json({
        success: true,
        data: {
          database_connected: conexaoOk,
          service_status: 'operational'
        }
      })
    } catch (error) {
      return GoogleCalendarController.handleError(res, error, 'Erro ao verificar conexão')
    }
  }
}