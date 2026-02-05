import { supabase } from '../lib/supabase'
import { LinkedInApiService } from './linkedinApiService'

export interface LinkedInConfig {
  id: string
  cliente_id: string
  client_id: string
  client_secret: string
  redirect_uri: string
  scopes: string
  access_token: string | null
  refresh_token: string | null
  token_expiry: string | null
  linkedin_user_id: string | null
  linkedin_user_name: string | null
  daily_search_limit: number
  daily_invite_limit: number
  search_keywords: string[]
  target_industries: string[]
  target_locations: string[]
  ativo: boolean
  last_sync_at: string | null
  last_error: string | null
  created_at: string
  updated_at: string
}

export interface CreateLinkedInConfigInput {
  client_id: string
  client_secret: string
  redirect_uri: string
  scopes?: string
  daily_search_limit?: number
  daily_invite_limit?: number
  search_keywords?: string[]
  target_industries?: string[]
  target_locations?: string[]
}

export interface UpdateLinkedInConfigInput {
  client_id?: string
  client_secret?: string
  redirect_uri?: string
  scopes?: string
  daily_search_limit?: number
  daily_invite_limit?: number
  search_keywords?: string[]
  target_industries?: string[]
  target_locations?: string[]
  ativo?: boolean
}

export class LinkedInConfigService {

  static async getByClienteId(clienteId: string): Promise<{ success: boolean; data: LinkedInConfig | null; message: string }> {
    if (!supabase) return { success: false, data: null, message: 'Supabase nao configurado' }
    try {
      const { data, error } = await supabase
        .from('linkedin_config')
        .select('*')
        .eq('cliente_id', clienteId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: true, data: null, message: 'Nenhuma configuracao LinkedIn encontrada' }
        }
        return { success: false, data: null, message: error.message }
      }

      return { success: true, data, message: 'Configuracao encontrada' }
    } catch (error) {
      console.error('Erro em LinkedInConfigService.getByClienteId:', error)
      return { success: false, data: null, message: 'Erro interno ao buscar configuracao' }
    }
  }

  static async create(clienteId: string, input: CreateLinkedInConfigInput): Promise<{ success: boolean; data: LinkedInConfig | null; message: string }> {
    if (!supabase) return { success: false, data: null, message: 'Supabase nao configurado' }
    try {
      const { data, error } = await supabase
        .from('linkedin_config')
        .insert({
          cliente_id: clienteId,
          client_id: input.client_id,
          client_secret: input.client_secret,
          redirect_uri: input.redirect_uri,
          scopes: input.scopes || 'r_liteprofile r_emailaddress w_member_social',
          daily_search_limit: input.daily_search_limit ?? 25,
          daily_invite_limit: input.daily_invite_limit ?? 25,
          search_keywords: input.search_keywords || [],
          target_industries: input.target_industries || [],
          target_locations: input.target_locations || [],
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          return { success: false, data: null, message: 'Ja existe uma configuracao LinkedIn para este cliente' }
        }
        return { success: false, data: null, message: error.message }
      }

      return { success: true, data, message: 'Configuracao criada com sucesso' }
    } catch (error) {
      console.error('Erro em LinkedInConfigService.create:', error)
      return { success: false, data: null, message: 'Erro interno ao criar configuracao' }
    }
  }

  static async update(clienteId: string, input: UpdateLinkedInConfigInput): Promise<{ success: boolean; data: LinkedInConfig | null; message: string }> {
    if (!supabase) return { success: false, data: null, message: 'Supabase nao configurado' }
    try {
      const { data, error } = await supabase
        .from('linkedin_config')
        .update(input)
        .eq('cliente_id', clienteId)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, data: null, message: 'Configuracao nao encontrada' }
        }
        return { success: false, data: null, message: error.message }
      }

      return { success: true, data, message: 'Configuracao atualizada com sucesso' }
    } catch (error) {
      console.error('Erro em LinkedInConfigService.update:', error)
      return { success: false, data: null, message: 'Erro interno ao atualizar configuracao' }
    }
  }

  static async delete(clienteId: string): Promise<{ success: boolean; message: string }> {
    if (!supabase) return { success: false, message: 'Supabase nao configurado' }
    try {
      const { error } = await supabase
        .from('linkedin_config')
        .delete()
        .eq('cliente_id', clienteId)

      if (error) {
        return { success: false, message: error.message }
      }

      return { success: true, message: 'Configuracao removida com sucesso' }
    } catch (error) {
      console.error('Erro em LinkedInConfigService.delete:', error)
      return { success: false, message: 'Erro interno ao remover configuracao' }
    }
  }

  static async updateTokens(clienteId: string, tokens: {
    access_token: string
    refresh_token?: string
    token_expiry?: string
    linkedin_user_id?: string
    linkedin_user_name?: string
  }): Promise<{ success: boolean; data: LinkedInConfig | null; message: string }> {
    if (!supabase) return { success: false, data: null, message: 'Supabase nao configurado' }
    try {
      const updateData: Record<string, unknown> = {
        access_token: tokens.access_token,
        last_error: null,
      }

      if (tokens.refresh_token) updateData.refresh_token = tokens.refresh_token
      if (tokens.token_expiry) updateData.token_expiry = tokens.token_expiry
      if (tokens.linkedin_user_id) updateData.linkedin_user_id = tokens.linkedin_user_id
      if (tokens.linkedin_user_name) updateData.linkedin_user_name = tokens.linkedin_user_name

      const { data, error } = await supabase
        .from('linkedin_config')
        .update(updateData)
        .eq('cliente_id', clienteId)
        .select()
        .single()

      if (error) {
        return { success: false, data: null, message: error.message }
      }

      return { success: true, data, message: 'Tokens atualizados' }
    } catch (error) {
      console.error('Erro em LinkedInConfigService.updateTokens:', error)
      return { success: false, data: null, message: 'Erro ao atualizar tokens' }
    }
  }

  static async getValidToken(clienteId: string): Promise<string | null> {
    try {
      const result = await this.getByClienteId(clienteId)
      if (!result.success || !result.data) return null

      const config = result.data
      if (!config.access_token || !config.ativo) return null

      // Check if token is still valid
      if (config.token_expiry) {
        const expiry = new Date(config.token_expiry)
        const now = new Date()

        if (expiry > now) {
          return config.access_token
        }

        // Token expired — try refresh
        if (config.refresh_token) {
          try {
            const refreshResult = await LinkedInApiService.refreshAccessToken(
              config.refresh_token,
              config.client_id,
              config.client_secret
            )

            if (refreshResult.success && refreshResult.data) {
              const expiryDate = new Date(Date.now() + refreshResult.data.expires_in * 1000)
              await this.updateTokens(clienteId, {
                access_token: refreshResult.data.access_token,
                token_expiry: expiryDate.toISOString(),
              })
              return refreshResult.data.access_token
            }
          } catch (refreshError) {
            console.error(`[LinkedIn] Falha ao refresh token para cliente ${clienteId}:`, refreshError)
            if (supabase) {
              await supabase
                .from('linkedin_config')
                .update({ last_error: 'Token expirado e refresh falhou. Reconecte o LinkedIn.' })
                .eq('cliente_id', clienteId)
            }
          }
        }

        return null
      }

      // No expiry set — assume valid
      return config.access_token
    } catch (error) {
      console.error('Erro em LinkedInConfigService.getValidToken:', error)
      return null
    }
  }

  static async getActiveClients(): Promise<string[]> {
    if (!supabase) return []
    try {
      const { data, error } = await supabase
        .from('linkedin_config')
        .select('cliente_id')
        .eq('ativo', true)
        .not('access_token', 'is', null)

      if (error || !data) return []

      return data.map(row => row.cliente_id)
    } catch (error) {
      console.error('Erro em LinkedInConfigService.getActiveClients:', error)
      return []
    }
  }
}
