import { supabase } from '../lib/supabase'
import { 
  GoogleCalendarIntegracao, 
  CreateGoogleCalendarIntegracaoData, 
  UpdateGoogleCalendarIntegracaoData,
  GoogleOAuthTokens,
  UpdateGoogleOAuthTokens,
} from '../models/google-calendar-integracoes.model'
import {
  GoogleCalendarAgendamento,
  CreateGoogleCalendarAgendamentoData,
  UpdateGoogleCalendarAgendamentoData,
} from '../models/google-calendar.model'
import { GoogleCalendarListQuery } from '../lib/validators'
import axios from 'axios'

export class GoogleCalendarService {
  /**
   * Verifica se o cliente Supabase está disponível
   */
  private static ensureSupabase() {
    if (!supabase) {
      throw new Error('Supabase client não está disponível')
    }
    return supabase
  }

  /**
   * Verifica se a conexão com o Google Calendar está funcionando
   */
  static async checkConnection(): Promise<boolean> {
    try {
      const client = this.ensureSupabase()
      const { error } = await client.from('google_calendar_integracoes').select('id').limit(1)
      return !error
    } catch (error) {
      console.error('Erro ao verificar conexão:', error)
      return false
    }
  }

  /**
   * Lista todas as configurações do Google Calendar
   */
  static async listarConfiguracoes(clienteId: string): Promise<GoogleCalendarIntegracao[]> {
    try {
      const client = this.ensureSupabase()
      let query = client
        .from('google_calendar_integracoes')
        .select('*')
        .order('created_at', { ascending: false })

      if (clienteId) {
        query = query.eq('cliente_id', clienteId)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`Erro ao listar configurações: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Erro no serviço listarConfiguracoes:', error)
      throw error
    }
  }

  /**
   * Busca uma configuração por ID
   */
  static async buscarConfiguracaoPorId(id: string, clienteId: string): Promise<GoogleCalendarIntegracao | null> {
    try {
      const client = this.ensureSupabase()
      let query = client
        .from('google_calendar_integracoes')
        .select('*')
        .eq('id', id)

      if (clienteId) {
        query = query.eq('cliente_id', clienteId)
      }

      const { data, error } = await query.single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        throw new Error(`Erro ao buscar configuração: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Erro no serviço buscarConfiguracaoPorId:', error)
      throw error
    }
  }

  /**
   * Busca a configuração ativa do cliente
   */
  static async buscarConfiguracaoAtiva(clienteId: string): Promise<GoogleCalendarIntegracao | null> {
    try {
      const client = this.ensureSupabase()
      const { data, error } = await client
        .from('google_calendar_integracoes')
        .select('*')
        .eq('cliente_id', clienteId)
        .eq('ativo', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Nenhuma configuração ativa encontrada
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Erro ao buscar configuração ativa:', error)
      throw error
    }
  }

  /**
   * Cria uma nova configuração do Google Calendar
   */
  static async criarConfiguracao(dados: CreateGoogleCalendarIntegracaoData): Promise<GoogleCalendarIntegracao> {
    try {
      const client = this.ensureSupabase()
      
      // Se esta configuração está sendo marcada como ativa, desativar outras
      if (dados.ativo) {
        await client
          .from('google_calendar_integracoes')
          .update({ ativo: false })
          .eq('cliente_id', dados.cliente_id)
      }

      const { data, error } = await client
        .from('google_calendar_integracoes')
        .insert(dados)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao criar configuração:', error)
      throw error
    }
  }

  /**
   * Atualiza uma configuração existente
   */
  static async atualizarConfiguracao(
    id: string,
    dados: UpdateGoogleCalendarIntegracaoData,
    clienteId: string
  ): Promise<GoogleCalendarIntegracao> {
    try {
      const client = this.ensureSupabase()
      
      // Se esta configuração está sendo marcada como ativa, desativar outras
      if (dados.ativo) {
        await client
          .from('google_calendar_integracoes')
          .update({ ativo: false })
          .eq('cliente_id', clienteId)
      }

      const { data, error } = await client
        .from('google_calendar_integracoes')
        .update(dados)
        .eq('id', id)
        .eq('cliente_id', clienteId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error)
      throw error
    }
  }

  /**
   * Deleta uma configuração
   */
  static async deletarConfiguracao(id: string, clienteId: string): Promise<void> {
    try {
      const client = this.ensureSupabase()
      const { error } = await client
        .from('google_calendar_integracoes')
        .delete()
        .eq('id', id)
        .eq('cliente_id', clienteId)

      if (error) throw error
    } catch (error) {
      console.error('Erro ao deletar configuração:', error)
      throw error
    }
  }

  /**
   * Atualiza os tokens OAuth de uma configuração
   */
  static async atualizarTokens(
    configuracaoId: string,
    tokens: UpdateGoogleOAuthTokens,
    clienteId: string
  ): Promise<GoogleCalendarIntegracao> {
    try {
      const client = this.ensureSupabase()
      const { data, error } = await client
        .from('google_calendar_integracoes')
        .update({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expiry: tokens.token_expiry
        })
        .eq('id', configuracaoId)
        .eq('cliente_id', clienteId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao atualizar tokens:', error)
      throw error
    }
  }

  // ===== MÉTODOS DE AGENDAMENTOS =====

  /**
   * Lista todos os agendamentos com filtros
   */
  static async listarAgendamentos(
    clienteId: string,
    filtros: GoogleCalendarListQuery
  ): Promise<{ agendamentos: GoogleCalendarAgendamento[]; total: number }> {
    try {
      const client = this.ensureSupabase()
      let query = client
        .from('google_calendar_agendamentos')
        .select(`
          *,
          google_calendar_integracoes!inner(cliente_id)
        `)

      // Filtrar por cliente_id através da junção
      query = query.eq('google_calendar_integracoes.cliente_id', clienteId)

      // Aplicar filtros
      if (filtros.search) {
        query = query.or(`titulo.ilike.%${filtros.search}%,descricao.ilike.%${filtros.search}%`)
      }

      if (filtros.status) {
        query = query.eq('status', filtros.status)
      }

      if (filtros.data_inicio) {
        query = query.gte('data_inicio', filtros.data_inicio)
      }

      if (filtros.data_fim) {
        query = query.lte('data_fim', filtros.data_fim)
      }

      if (filtros.sincronizado !== undefined) {
        if (filtros.sincronizado) {
          query = query.not('google_event_id', 'is', null)
        } else {
          query = query.is('google_event_id', null)
        }
      }

      // Contar total - criar uma nova query para contagem
      const countQuery = client
        .from('google_calendar_agendamentos')
        .select(`
          *,
          google_calendar_integracoes!inner(cliente_id)
        `, { count: 'exact', head: true })
        .eq('google_calendar_integracoes.cliente_id', clienteId)

      // Aplicar os mesmos filtros na query de contagem
      if (filtros.search) {
        countQuery.or(`titulo.ilike.%${filtros.search}%,descricao.ilike.%${filtros.search}%`)
      }

      if (filtros.status) {
        countQuery.eq('status', filtros.status)
      }

      if (filtros.data_inicio) {
        countQuery.gte('data_inicio', filtros.data_inicio)
      }

      if (filtros.data_fim) {
        countQuery.lte('data_fim', filtros.data_fim)
      }

      if (filtros.sincronizado !== undefined) {
        if (filtros.sincronizado) {
          countQuery.not('google_event_id', 'is', null)
        } else {
          countQuery.is('google_event_id', null)
        }
      }

      const { count } = await countQuery

      // Aplicar paginação
      const offset = ((filtros.page || 1) - 1) * (filtros.limit || 10)
      query = query
        .order('data_inicio', { ascending: false })
        .range(offset, offset + (filtros.limit || 10) - 1)

      const { data, error } = await query

      if (error) throw error

      return {
        agendamentos: data || [],
        total: count || 0
      }
    } catch (error) {
      console.error('Erro ao listar agendamentos:', error)
      throw error
    }
  }

  /**
   * Busca um agendamento por ID
   */
  static async buscarAgendamentoPorId(id: string, clienteId: string): Promise<GoogleCalendarAgendamento | null> {
    try {
      const client = this.ensureSupabase()
      let query = client
        .from('google_calendar_agendamentos')
        .select(`
          *,
          google_calendar_integracoes!inner(cliente_id)
        `)
        .eq('id', id)
        .eq('google_calendar_integracoes.cliente_id', clienteId)
        .single()

      const { data, error } = await query

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Erro ao buscar agendamento:', error)
      throw error
    }
  }

  /**
   * Cria um novo agendamento
   */
  static async criarAgendamento(dados: CreateGoogleCalendarAgendamentoData): Promise<GoogleCalendarAgendamento> {
    try {
      const client = this.ensureSupabase()
      const { data, error } = await client
        .from('google_calendar_agendamentos')
        .insert(dados)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      throw error
    }
  }

  /**
   * Atualiza um agendamento existente
   */
  static async atualizarAgendamento(
    id: string,
    dados: UpdateGoogleCalendarAgendamentoData,
    clienteId: string
  ): Promise<GoogleCalendarAgendamento> {
    try {
      const client = this.ensureSupabase()
      
      // Primeiro, verificar se o agendamento pertence ao cliente
      const agendamentoExistente = await this.buscarAgendamentoPorId(id, clienteId)
      if (!agendamentoExistente) {
        throw new Error('Agendamento não encontrado ou não pertence ao cliente')
      }

      // Atualizar o agendamento
      const { data, error } = await client
        .from('google_calendar_agendamentos')
        .update(dados)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error)
      throw error
    }
  }

  /**
   * Deleta um agendamento (soft delete)
   */
  static async deletarAgendamento(id: string, clienteId: string): Promise<void> {
    try {
      const client = this.ensureSupabase()
      
      // Primeiro, verificar se o agendamento pertence ao cliente
      const agendamentoExistente = await this.buscarAgendamentoPorId(id, clienteId)
      if (!agendamentoExistente) {
        throw new Error('Agendamento não encontrado ou não pertence ao cliente')
      }

      // Deletar o agendamento (soft delete)
      const { error } = await client
        .from('google_calendar_agendamentos')
        .update({ 
          deletado_em: new Date().toISOString(),
          status: 'cancelled'
        })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error)
      throw error
    }
  }

  /**
   * Atualiza informações de sincronização de um agendamento
   */
  static async atualizarSincronizacao(
    agendamentoId: string,
    googleEventId: string | null,
    erroSincronizacao: string | null = null,
    clienteId: string
  ): Promise<GoogleCalendarAgendamento> {
    try {
      const client = this.ensureSupabase()
      
      // Primeiro, verificar se o agendamento pertence ao cliente
      const agendamentoExistente = await this.buscarAgendamentoPorId(agendamentoId, clienteId)
      if (!agendamentoExistente) {
        throw new Error('Agendamento não encontrado ou não pertence ao cliente')
      }

      // Atualizar a sincronização
      const { data, error } = await client
        .from('google_calendar_agendamentos')
        .update({
          google_event_id: googleEventId,
          sincronizado_em: googleEventId ? new Date().toISOString() : null,
          erro_sincronizacao: erroSincronizacao
        })
        .eq('id', agendamentoId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao atualizar sincronização:', error)
      throw error
    }
  }

  // ===== MÉTODOS AUXILIARES =====

  /**
   * Verifica se uma configuração existe e pertence ao cliente
   */
  static async configuracaoExiste(id: string, clienteId: string): Promise<boolean> {
    try {
      const client = this.ensureSupabase()
      let query = client
        .from('google_calendar_integracoes')
        .select('id')
        .eq('id', id)
        .eq('cliente_id', clienteId)
        .single()

      const { data, error } = await query

      if (error && error.code === 'PGRST116') {
        return false
      }

      if (error) throw error
      return !!data
    } catch (error) {
      console.error('Erro ao verificar existência da configuração:', error)
      return false
    }
  }

  /**
   * Verifica se um agendamento existe e pertence ao cliente
   */
  static async agendamentoExiste(id: string, clienteId: string): Promise<boolean> {
    try {
      const client = this.ensureSupabase()
      let query = client
        .from('google_calendar_agendamentos')
        .select(`
          id,
          google_calendar_integracoes!inner(cliente_id)
        `)
        .eq('id', id)
        .eq('google_calendar_integracoes.cliente_id', clienteId)
        .single()

      const { data, error } = await query

      if (error && error.code === 'PGRST116') {
        return false
      }

      if (error) throw error
      return !!data
    } catch (error) {
      console.error('Erro ao verificar existência do agendamento:', error)
      return false
    }
  }

  // ===== MÉTODOS OAUTH =====

  /**
   * Gera URL de autorização OAuth do Google
   */
  static gerarUrlAutorizacao(configuracao: GoogleCalendarIntegracao): string {
    const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
    const redirectUri = configuracao.redirect_uri || ''
    const scope = configuracao.scope || 'https://www.googleapis.com/auth/calendar'
    
    const params = new URLSearchParams({
      client_id: configuracao.client_id || '',
      redirect_uri: redirectUri,
      scope: scope,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      state: configuracao.id || ''
    })

    return `${baseUrl}?${params.toString()}`
  }

  /**
   * Troca código de autorização por tokens OAuth
   */
  static async trocarCodigoPorTokens(
    code: string,
    configuracao: GoogleCalendarIntegracao
  ): Promise<GoogleOAuthTokens> {
    try {
      const tokenUrl = 'https://oauth2.googleapis.com/token'
      const redirectUri = configuracao.redirect_uri || ''
      
      const requestData = {
        client_id: configuracao.client_id || '',
        client_secret: configuracao.client_secret || '',
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      }

      const response = await axios.post(tokenUrl, requestData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      const tokenExpiry = new Date(Date.now() + response.data.expires_in * 1000).toISOString()

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_in: response.data.expires_in,
        token_type: response.data.token_type,
        scope: response.data.scope,
        token_expiry: tokenExpiry
      }
    } catch (error) {
      console.error('Erro ao trocar código por tokens:', error)
      if (axios.isAxiosError(error)) {
        throw new Error(`Falha na autenticação com Google: ${error.response?.data?.error_description || error.message}`)
      }
      throw new Error('Falha na autenticação com Google')
    }
  }

  /**
   * Renova access token usando refresh token
   */
  static async renovarAccessToken(
    configuracaoId: string,
    clienteId: string
  ): Promise<GoogleCalendarIntegracao> {
    try {
      const configuracao = await this.buscarConfiguracaoPorId(configuracaoId, clienteId)
      
      if (!configuracao || !configuracao.refresh_token) {
        throw new Error('Configuração ou refresh token não encontrado')
      }

      const tokenUrl = 'https://oauth2.googleapis.com/token'
      
      const requestData = {
        client_id: configuracao.client_id || '',
        client_secret: configuracao.client_secret || '',
        refresh_token: configuracao.refresh_token || '',
        grant_type: 'refresh_token'
      }

      const response = await axios.post(tokenUrl, requestData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      const novoTokenExpiry = new Date(Date.now() + response.data.expires_in * 1000).toISOString()

      // Atualizar tokens no banco
      const configuracaoAtualizada = await this.atualizarTokens(
        configuracaoId,
        {
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token || configuracao.refresh_token,
          token_expiry: novoTokenExpiry
        },
        clienteId
      )

      return configuracaoAtualizada
    } catch (error) {
      console.error('Erro ao renovar access token:', error)
      if (axios.isAxiosError(error)) {
        throw new Error(`Falha ao renovar token: ${error.response?.data?.error_description || error.message}`)
      }
      throw error
    }
  }

  /**
   * Verifica se o token está expirado e renova se necessário
   */
  static async verificarERenovarToken(
    configuracaoId: string,
    clienteId: string
  ): Promise<string> {
    try {
      const configuracao = await this.buscarConfiguracaoPorId(configuracaoId, clienteId)
      
      if (!configuracao || !configuracao.access_token) {
        throw new Error('Configuração ou access token não encontrado')
      }

      // Verificar se o token está próximo do vencimento (5 minutos antes)
      const agora = new Date()
      const expiry = new Date(configuracao.token_expiry || 0)
      const cincoMinutos = 5 * 60 * 1000

      if (expiry.getTime() - agora.getTime() < cincoMinutos) {
        console.log('Token próximo do vencimento, renovando...')
        const configuracaoRenovada = await this.renovarAccessToken(configuracaoId, clienteId)
        return configuracaoRenovada.access_token!
      }

      return configuracao.access_token
    } catch (error) {
      console.error('Erro ao verificar/renovar token:', error)
      throw error
    }
  }

  /**
   * Gera access token automaticamente para uma configuração
   */
  static async gerarAccessTokenAutomatico(
    configuracaoId: string,
    clienteId: string
  ): Promise<{ url_autorizacao: string; configuracao: GoogleCalendarIntegracao }> {
    try {
      const configuracao = await this.buscarConfiguracaoPorId(configuracaoId, clienteId)
      
      if (!configuracao) {
        throw new Error('Configuração não encontrada')
      }

      if (!configuracao.client_id || !configuracao.client_secret) {
        throw new Error('Client ID e Client Secret são obrigatórios para gerar access token')
      }

      // Se já tem access token válido, retorna a configuração
      if (configuracao.access_token && configuracao.token_expiry) {
        const agora = new Date()
        const expiry = new Date(configuracao.token_expiry)
        
        if (expiry.getTime() > agora.getTime()) {
          return {
            url_autorizacao: '',
            configuracao
          }
        }
      }

      // Gera URL de autorização
      const urlAutorizacao = this.gerarUrlAutorizacao(configuracao)

      return {
        url_autorizacao: urlAutorizacao,
        configuracao
      }
    } catch (error) {
      console.error('Erro ao gerar access token automático:', error)
      throw error
    }
  }
}