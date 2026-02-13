import { supabase } from '../lib/supabase'
import { ParametroService } from './parametroService'
import { toBrazilTimestamp } from './eventQueueService'

export interface PromptConfig {
  id: string
  cliente_id: string
  context: 'follow_up' | 'prospeccao' | 'google_calendar'
  prompt: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PromptHistory {
  id: string
  prompt_config_id: string
  cliente_id: string
  previous_prompt: string
  changed_by: string | null
  created_at: string
}

const DEFAULT_PROMPT_KEYS: Record<string, string> = {
  follow_up: 'prompt_followup',
  prospeccao: 'prompt_prospeccao',
  google_calendar: 'prompt_google_calendar',
}

export class PromptConfigService {
  static async getAllByClienteId(clienteId: string): Promise<PromptConfig[]> {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('prompt_config')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('context')

    if (error) throw new Error(`Error fetching prompt configs: ${error.message}`)
    return data || []
  }

  static async getByContext(clienteId: string, context: string): Promise<PromptConfig | null> {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('prompt_config')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('context', context)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Error fetching prompt config: ${error.message}`)
    }

    return data
  }

  /**
   * Get prompt for a context, falling back to system defaults from parametros table.
   * Priority: prompt_config table → parametros table → empty string
   */
  static async getPromptOrDefault(clienteId: string, context: string): Promise<string> {
    const config = await this.getByContext(clienteId, context)

    if (config && config.is_active && config.prompt) {
      return config.prompt
    }

    // Fallback to parametros table
    const paramKey = DEFAULT_PROMPT_KEYS[context]
    if (paramKey) {
      const param = await ParametroService.getByChave(paramKey)
      if (param?.valor) return param.valor
    }

    return ''
  }

  /**
   * Create or update a prompt config. If exists, saves previous prompt to history.
   */
  static async upsert(
    clienteId: string,
    context: string,
    prompt: string,
    changedBy?: string | undefined
  ): Promise<PromptConfig> {
    if (!supabase) throw new Error('Supabase client not initialized')

    const existing = await this.getByContext(clienteId, context)

    if (existing) {
      // Save previous prompt to history
      await supabase
        .from('prompt_history')
        .insert({
          prompt_config_id: existing.id,
          cliente_id: clienteId,
          previous_prompt: existing.prompt,
          changed_by: changedBy || null,
        })

      // Update existing config
      const { data, error } = await supabase
        .from('prompt_config')
        .update({
          prompt,
          updated_at: toBrazilTimestamp(),
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw new Error(`Error updating prompt config: ${error.message}`)
      return data
    }

    // Create new
    const { data, error } = await supabase
      .from('prompt_config')
      .insert({
        cliente_id: clienteId,
        context,
        prompt,
        is_active: true,
        updated_at: toBrazilTimestamp(),
      })
      .select()
      .single()

    if (error) throw new Error(`Error creating prompt config: ${error.message}`)
    return data
  }

  static async delete(clienteId: string, context: string): Promise<void> {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { error } = await supabase
      .from('prompt_config')
      .delete()
      .eq('cliente_id', clienteId)
      .eq('context', context)

    if (error) throw new Error(`Error deleting prompt config: ${error.message}`)
  }

  static async getHistory(clienteId: string, context: string): Promise<PromptHistory[]> {
    if (!supabase) throw new Error('Supabase client not initialized')

    const config = await this.getByContext(clienteId, context)
    if (!config) return []

    const { data, error } = await supabase
      .from('prompt_history')
      .select('*')
      .eq('prompt_config_id', config.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw new Error(`Error fetching prompt history: ${error.message}`)
    return data || []
  }
}
