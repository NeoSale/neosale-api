import { supabase } from '../lib/supabase'

export interface EventQueueItem {
  id: string
  cliente_id: string
  event_type: string
  payload: Record<string, any>
  priority: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  scheduled_at: string
  started_at: string | null
  completed_at: string | null
  retry_count: number
  max_retries: number
  error_message: string | null
  created_at: string
}

export class EventQueueService {
  static async enqueue(
    clienteId: string,
    eventType: string,
    payload: Record<string, any>,
    scheduledAt?: Date | undefined,
    priority?: number | undefined
  ): Promise<EventQueueItem> {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('event_queue')
      .insert({
        cliente_id: clienteId,
        event_type: eventType,
        payload,
        priority: priority ?? 5,
        scheduled_at: scheduledAt
          ? scheduledAt.toISOString()
          : new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw new Error(`Error enqueuing event: ${error.message}`)
    console.log(`[EventQueue] Enqueued ${eventType} for client ${clienteId}, scheduled at ${data.scheduled_at}`)
    return data
  }

  /**
   * Dequeue the next pending event using FOR UPDATE SKIP LOCKED via RPC.
   */
  static async dequeue(): Promise<EventQueueItem | null> {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase.rpc('dequeue_event')

    if (error) {
      console.error('[EventQueue] Error dequeuing:', error.message)
      return null
    }

    if (!data || (Array.isArray(data) && data.length === 0)) return null

    const event = Array.isArray(data) ? data[0] : data
    return event || null
  }

  static async complete(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { error } = await supabase
      .from('event_queue')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw new Error(`Error completing event: ${error.message}`)
  }

  /**
   * Mark event as failed. If retries remain, reset to pending with exponential backoff.
   */
  static async fail(id: string, errorMessage: string): Promise<void> {
    if (!supabase) throw new Error('Supabase client not initialized')

    // Get current event to check retry count
    const { data: event, error: fetchError } = await supabase
      .from('event_queue')
      .select('retry_count, max_retries')
      .eq('id', id)
      .single()

    if (fetchError) throw new Error(`Error fetching event: ${fetchError.message}`)

    const newRetryCount = (event.retry_count || 0) + 1

    if (newRetryCount < event.max_retries) {
      // Exponential backoff: 1min, 5min, 30min
      const backoffMinutes = [1, 5, 30]
      const delayMinutes = backoffMinutes[Math.min(newRetryCount - 1, backoffMinutes.length - 1)]
      const nextAttempt = new Date(Date.now() + delayMinutes * 60 * 1000)

      const { error } = await supabase
        .from('event_queue')
        .update({
          status: 'pending',
          retry_count: newRetryCount,
          error_message: errorMessage,
          scheduled_at: nextAttempt.toISOString(),
          started_at: null,
        })
        .eq('id', id)

      if (error) throw new Error(`Error retrying event: ${error.message}`)
      console.log(`[EventQueue] Event ${id} will retry in ${delayMinutes}min (attempt ${newRetryCount}/${event.max_retries})`)
    } else {
      // Max retries exceeded
      const { error } = await supabase
        .from('event_queue')
        .update({
          status: 'failed',
          retry_count: newRetryCount,
          error_message: errorMessage,
          completed_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw new Error(`Error failing event: ${error.message}`)
      console.log(`[EventQueue] Event ${id} permanently failed after ${newRetryCount} attempts`)
    }
  }

  /**
   * Cancel all pending events matching a filter on payload fields.
   */
  static async cancelByLeadId(leadId: string): Promise<number> {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('event_queue')
      .update({ status: 'cancelled' })
      .eq('status', 'pending')
      .eq('payload->>lead_id', leadId)
      .select('id')

    if (error) throw new Error(`Error cancelling events: ${error.message}`)
    const count = data?.length || 0
    if (count > 0) {
      console.log(`[EventQueue] Cancelled ${count} pending events for lead ${leadId}`)
    }
    return count
  }

  static async cancelByFilter(eventType: string, payloadFilter: Record<string, any>): Promise<number> {
    if (!supabase) throw new Error('Supabase client not initialized')

    let query = supabase
      .from('event_queue')
      .update({ status: 'cancelled' })
      .eq('status', 'pending')
      .eq('event_type', eventType)

    for (const [key, value] of Object.entries(payloadFilter)) {
      query = query.eq(`payload->>${key}`, String(value))
    }

    const { data, error } = await query.select('id')

    if (error) throw new Error(`Error cancelling events: ${error.message}`)
    return data?.length || 0
  }

  static async getPendingCount(clienteId?: string | undefined): Promise<Record<string, number>> {
    if (!supabase) throw new Error('Supabase client not initialized')

    let query = supabase
      .from('event_queue')
      .select('event_type')
      .eq('status', 'pending')

    if (clienteId) {
      query = query.eq('cliente_id', clienteId)
    }

    const { data, error } = await query

    if (error) throw new Error(`Error counting pending: ${error.message}`)

    const counts: Record<string, number> = {}
    for (const row of data || []) {
      counts[row.event_type] = (counts[row.event_type] || 0) + 1
    }
    return counts
  }
}
