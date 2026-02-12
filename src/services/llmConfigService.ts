import { supabase } from '../lib/supabase'
import { ParametroService } from './parametroService'

export interface LlmConfig {
  id: string
  cliente_id: string
  provider: 'openai' | 'anthropic' | 'google'
  model: string
  api_key: string
  temperature: number
  max_tokens: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LlmConfigResolved {
  provider: string
  model: string
  apiKey: string
  temperature: number
  maxTokens: number
}

export class LlmConfigService {
  static async getByClienteId(clienteId: string): Promise<LlmConfig | null> {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('llm_config')
      .select('*')
      .eq('cliente_id', clienteId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Error fetching LLM config: ${error.message}`)
    }

    return data
  }

  static async create(clienteId: string, input: {
    provider: string
    model: string
    api_key: string
    temperature?: number
    max_tokens?: number
    is_active?: boolean
  }): Promise<LlmConfig> {
    if (!supabase) throw new Error('Supabase client not initialized')

    const existing = await this.getByClienteId(clienteId)
    if (existing) {
      throw new Error('LLM config already exists for this client. Use update instead.')
    }

    const { data, error } = await supabase
      .from('llm_config')
      .insert({
        cliente_id: clienteId,
        provider: input.provider,
        model: input.model,
        api_key: input.api_key,
        temperature: input.temperature ?? 0.7,
        max_tokens: input.max_tokens ?? 1024,
        is_active: input.is_active ?? true,
        updated_at: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
      })
      .select()
      .single()

    if (error) throw new Error(`Error creating LLM config: ${error.message}`)
    return data
  }

  static async update(clienteId: string, input: {
    provider?: string | undefined
    model?: string | undefined
    api_key?: string | undefined
    temperature?: number | undefined
    max_tokens?: number | undefined
    is_active?: boolean | undefined
  }): Promise<LlmConfig> {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('llm_config')
      .update({
        ...input,
        updated_at: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
      })
      .eq('cliente_id', clienteId)
      .select()
      .single()

    if (error) throw new Error(`Error updating LLM config: ${error.message}`)
    return data
  }

  static async delete(clienteId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { error } = await supabase
      .from('llm_config')
      .delete()
      .eq('cliente_id', clienteId)

    if (error) throw new Error(`Error deleting LLM config: ${error.message}`)
  }

  /**
   * Get LLM config for a client, falling back to system defaults.
   * Priority: llm_config table → parametros Anthropic → env OPENAI_API_KEY → error
   */
  static async getOrDefault(clienteId: string): Promise<LlmConfigResolved> {
    const config = await this.getByClienteId(clienteId)

    if (config && config.is_active) {
      return {
        provider: config.provider,
        model: config.model,
        apiKey: config.api_key,
        temperature: Number(config.temperature),
        maxTokens: config.max_tokens
      }
    }

    // Fallback to Anthropic params from parametros table
    try {
      const apiKeyParam = await ParametroService.getByChave('apikey_anthropic')
      if (apiKeyParam?.valor) {
        const modelParam = await ParametroService.getByChave('modelo_anthropic')
        return {
          provider: 'anthropic',
          model: modelParam?.valor || 'claude-sonnet-4-5-20250929',
          apiKey: apiKeyParam.valor,
          temperature: 0.7,
          maxTokens: 1024
        }
      }
    } catch {
      // Ignore errors, continue to next fallback
    }

    // Fallback to environment variable
    const envKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY
    if (envKey) {
      return {
        provider: 'openai',
        model: 'gpt-4.1-mini',
        apiKey: envKey,
        temperature: 0.7,
        maxTokens: 1024
      }
    }

    throw new Error('No LLM configuration found. Configure an API key in Settings > AI or set OPENAI_API_KEY environment variable.')
  }
}
