import { supabase } from '../lib/supabase'

export interface AiAgentLogInput {
  cliente_id: string
  lead_id?: string | undefined
  context: string
  provider: string
  model: string
  prompt_tokens?: number | undefined
  completion_tokens?: number | undefined
  total_tokens?: number | undefined
  latency_ms?: number | undefined
  estimated_cost?: number | undefined
  status: 'success' | 'error'
  error_message?: string | undefined
}

export class AiAgentLogService {
  static async create(data: AiAgentLogInput): Promise<void> {
    if (!supabase) return

    const { error } = await supabase
      .from('ai_agent_log')
      .insert({
        cliente_id: data.cliente_id,
        lead_id: data.lead_id || null,
        context: data.context,
        provider: data.provider,
        model: data.model,
        prompt_tokens: data.prompt_tokens || 0,
        completion_tokens: data.completion_tokens || 0,
        total_tokens: data.total_tokens || 0,
        latency_ms: data.latency_ms || 0,
        estimated_cost: data.estimated_cost || 0,
        status: data.status,
        error_message: data.error_message || null,
      })

    if (error) {
      console.error('[AiAgentLog] Error logging:', error.message)
    }
  }

  static async getByClienteId(
    clienteId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ data: any[]; total: number }> {
    if (!supabase) throw new Error('Supabase client not initialized')

    const offset = (page - 1) * limit

    const { data, error, count } = await supabase
      .from('ai_agent_log')
      .select('*', { count: 'exact' })
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw new Error(`Error fetching AI agent logs: ${error.message}`)
    return { data: data || [], total: count || 0 }
  }

  static async getStats(clienteId: string): Promise<{
    total_calls: number
    total_tokens: number
    total_cost: number
    by_context: Record<string, { calls: number; tokens: number; cost: number }>
  }> {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('ai_agent_log')
      .select('context, total_tokens, estimated_cost')
      .eq('cliente_id', clienteId)

    if (error) throw new Error(`Error fetching AI agent stats: ${error.message}`)

    const stats = {
      total_calls: 0,
      total_tokens: 0,
      total_cost: 0,
      by_context: {} as Record<string, { calls: number; tokens: number; cost: number }>,
    }

    for (const row of data || []) {
      stats.total_calls++
      stats.total_tokens += row.total_tokens || 0
      stats.total_cost += parseFloat(row.estimated_cost) || 0

      if (!stats.by_context[row.context]) {
        stats.by_context[row.context] = { calls: 0, tokens: 0, cost: 0 }
      }
      stats.by_context[row.context].calls++
      stats.by_context[row.context].tokens += row.total_tokens || 0
      stats.by_context[row.context].cost += parseFloat(row.estimated_cost) || 0
    }

    return stats
  }
}
