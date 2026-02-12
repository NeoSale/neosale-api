import { supabase } from '../lib/supabase'
import { EventQueueService, EventQueueItem } from './eventQueueService'
import { AiAgentService } from './aiAgentService'
import { ControleEnviosService } from './controleEnviosService'

export interface FollowupConfig {
  id: string
  cliente_id: string
  is_active: boolean
  max_attempts: number
  intervals: number[]
  sending_schedule: Record<string, string>
  daily_send_limit: number
  created_at: string
  updated_at: string
}

export interface FollowupTracking {
  id: string
  lead_id: string
  cliente_id: string
  status: 'idle' | 'waiting' | 'in_progress' | 'responded' | 'exhausted' | 'cancelled'
  current_step: number
  next_send_at: string | null
  last_ai_message_at: string | null
  last_lead_message_at: string | null
  cycle_count: number
  created_at: string
  updated_at: string
}

export interface FollowupLog {
  id: string
  tracking_id: string
  lead_id: string
  cliente_id: string
  step: number
  status: 'sent' | 'failed' | 'cancelled'
  error_message: string | null
  created_at: string
}

const DAY_MAP: Record<number, string> = {
  0: 'domingo',
  1: 'segunda',
  2: 'terca',
  3: 'quarta',
  4: 'quinta',
  5: 'sexta',
  6: 'sabado',
}

export class FollowupService {
  // =============================================
  // EVENT HANDLERS
  // =============================================

  /**
   * Handler for ai_message_sent event.
   * Triggered when N8N notifies that AI has responded to a lead.
   * Creates/resets tracking and schedules the first follow_up_send.
   */
  static async handleAiMessageSent(event: EventQueueItem): Promise<void> {
    const { lead_id, cliente_id } = event.payload

    // 1. Load config - if follow-up is not active, skip
    const config = await this.getConfig(cliente_id)
    if (!config || !config.is_active) {
      console.log(`[Followup] Follow-up not active for client ${cliente_id}, skipping`)
      return
    }

    // 2. Upsert tracking: reset step to 0, status to waiting, increment cycle
    const tracking = await this.upsertTracking(lead_id, cliente_id)

    // 3. Calculate next_send_at = now + intervals[0] minutes
    const intervals = config.intervals as number[]
    const delayMinutes = intervals[0] || 30
    let scheduledAt = new Date(Date.now() + delayMinutes * 60 * 1000)

    // 4. Adjust for business hours
    scheduledAt = this.getNextValidSlot(config.sending_schedule, scheduledAt)

    // 5. Cancel any pending follow_up_send events for this lead
    await EventQueueService.cancelByFilter('follow_up_send', { lead_id })

    // 6. Enqueue follow_up_send for step 1
    await EventQueueService.enqueue(
      cliente_id,
      'follow_up_send',
      { lead_id, cliente_id, step: 1 },
      scheduledAt,
      5
    )

    // 7. Update tracking
    if (!supabase) throw new Error('Supabase client not initialized')
    await supabase
      .from('followup_tracking')
      .update({
        last_ai_message_at: new Date().toISOString(),
        next_send_at: scheduledAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', tracking.id)

    console.log(`[Followup] Scheduled follow-up step 1 for lead ${lead_id} at ${scheduledAt.toISOString()}`)
  }

  /**
   * Handler for lead_message_received event.
   * Triggered when a lead responds. Cancels all pending follow-ups.
   */
  static async handleLeadMessageReceived(event: EventQueueItem): Promise<void> {
    const { lead_id } = event.payload

    // 1. Cancel all pending events for this lead
    const cancelled = await EventQueueService.cancelByLeadId(lead_id)

    // 2. Update tracking to responded, reset step
    if (!supabase) throw new Error('Supabase client not initialized')
    const { error } = await supabase
      .from('followup_tracking')
      .update({
        status: 'responded',
        current_step: 0,
        next_send_at: null,
        last_lead_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('lead_id', lead_id)

    if (error) {
      console.error(`[Followup] Error updating tracking for lead ${lead_id}:`, error.message)
    }

    console.log(`[Followup] Lead ${lead_id} responded. Cancelled ${cancelled} pending events.`)
  }

  /**
   * Handler for follow_up_send event.
   * The core handler that actually sends follow-up messages via AI Agent.
   */
  static async handleFollowUpSend(event: EventQueueItem): Promise<void> {
    const { lead_id, cliente_id, step } = event.payload
    if (!supabase) throw new Error('Supabase client not initialized')

    // 1. Load tracking
    const tracking = await this.getTrackingByLead(lead_id)
    if (!tracking) {
      console.log(`[Followup] No tracking found for lead ${lead_id}, skipping`)
      return
    }

    // 2. Race condition check: if status is not 'waiting', lead already responded
    if (tracking.status !== 'waiting') {
      console.log(`[Followup] Lead ${lead_id} status is '${tracking.status}', skipping follow-up`)
      return
    }

    // 3. Re-check: did lead send any message since last AI message?
    if (tracking.last_ai_message_at) {
      const { data: recentMessages } = await supabase
        .from('n8n_chat_histories')
        .select('id')
        .eq('session_id', lead_id)
        .gt('created_at', tracking.last_ai_message_at)
        .limit(1)

      if (recentMessages && recentMessages.length > 0) {
        // Check if any is from the lead (type='human')
        const { data: humanMessages } = await supabase
          .from('n8n_chat_histories')
          .select('id, message')
          .eq('session_id', lead_id)
          .gt('created_at', tracking.last_ai_message_at)

        const hasHumanMessage = humanMessages?.some(msg => {
          const message = typeof msg.message === 'string' ? JSON.parse(msg.message) : msg.message
          return message?.type === 'human'
        })

        if (hasHumanMessage) {
          console.log(`[Followup] Lead ${lead_id} sent a message since last AI message, aborting`)
          await supabase
            .from('followup_tracking')
            .update({ status: 'responded', current_step: 0, next_send_at: null, updated_at: new Date().toISOString() })
            .eq('id', tracking.id)
          return
        }
      }
    }

    // 4. Load config
    const config = await this.getConfig(cliente_id)
    if (!config || !config.is_active) {
      console.log(`[Followup] Config not active for client ${cliente_id}, skipping`)
      return
    }

    // 5. Check business hours
    const now = this.getBrazilNow()
    if (!this.isWithinBusinessHours(config.sending_schedule, now)) {
      const nextSlot = this.getNextValidSlot(config.sending_schedule, now)
      console.log(`[Followup] Outside business hours, rescheduling to ${nextSlot.toISOString()}`)
      await EventQueueService.enqueue(
        cliente_id, 'follow_up_send',
        { lead_id, cliente_id, step },
        nextSlot, 5
      )
      return
    }

    // 6. Check daily limit
    const today = this.getBrazilToday()
    const limitCheck = await ControleEnviosService.podeEnviarMensagem(today, cliente_id)
    if (!limitCheck.podeEnviar) {
      console.log(`[Followup] Daily limit reached for client ${cliente_id}`)
      await EventQueueService.enqueue(
        cliente_id, 'daily_limit_reached',
        { lead_id, cliente_id }, undefined, 3
      )
      // Reschedule for next business day
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      const nextSlot = this.getNextValidSlot(config.sending_schedule, tomorrow)
      await EventQueueService.enqueue(
        cliente_id, 'follow_up_send',
        { lead_id, cliente_id, step },
        nextSlot, 5
      )
      return
    }

    // 7. Update tracking to in_progress
    await supabase
      .from('followup_tracking')
      .update({ status: 'in_progress', updated_at: new Date().toISOString() })
      .eq('id', tracking.id)

    // 8. Execute AI Agent
    try {
      const result = await AiAgentService.execute({
        leadId: lead_id,
        clienteId: cliente_id,
        context: 'follow_up',
        metadata: { stepNumber: step },
      })

      if (!result.success) {
        throw new Error(result.error || 'AI Agent execution failed')
      }

      // 9. Increment daily send count
      await ControleEnviosService.incrementarQuantidadeEnviada(today, 1, cliente_id)

      // 10. Log success
      await supabase.from('followup_log').insert({
        tracking_id: tracking.id,
        lead_id,
        cliente_id,
        step,
        status: 'sent',
      })

      // 11. Check if more steps remain
      const intervals = config.intervals as number[]
      if (step < config.max_attempts) {
        const nextDelay = intervals[step] || intervals[intervals.length - 1] || 1440
        let nextSendAt = new Date(Date.now() + nextDelay * 60 * 1000)
        nextSendAt = this.getNextValidSlot(config.sending_schedule, nextSendAt)

        await EventQueueService.enqueue(
          cliente_id, 'follow_up_send',
          { lead_id, cliente_id, step: step + 1 },
          nextSendAt, 5
        )

        await supabase
          .from('followup_tracking')
          .update({
            status: 'waiting',
            current_step: step,
            next_send_at: nextSendAt.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', tracking.id)

        console.log(`[Followup] Step ${step} sent for lead ${lead_id}. Next step ${step + 1} at ${nextSendAt.toISOString()}`)
      } else {
        // All attempts exhausted
        await EventQueueService.enqueue(
          cliente_id, 'follow_up_exhausted',
          { lead_id, cliente_id }, undefined, 7
        )

        await supabase
          .from('followup_tracking')
          .update({
            status: 'exhausted',
            current_step: step,
            next_send_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', tracking.id)

        console.log(`[Followup] All ${config.max_attempts} attempts exhausted for lead ${lead_id}`)
      }
    } catch (error: any) {
      // Log failure
      await supabase.from('followup_log').insert({
        tracking_id: tracking.id,
        lead_id,
        cliente_id,
        step,
        status: 'failed',
        error_message: error.message,
      })

      // Restore tracking to waiting so retry can pick it up
      await supabase
        .from('followup_tracking')
        .update({ status: 'waiting', updated_at: new Date().toISOString() })
        .eq('id', tracking.id)

      throw error // Re-throw so EventQueueProcessor handles retry
    }
  }

  /**
   * Handler for follow_up_exhausted event.
   */
  static async handleFollowUpExhausted(event: EventQueueItem): Promise<void> {
    const { lead_id, cliente_id } = event.payload
    if (!supabase) throw new Error('Supabase client not initialized')

    await supabase
      .from('followup_tracking')
      .update({ status: 'exhausted', next_send_at: null, updated_at: new Date().toISOString() })
      .eq('lead_id', lead_id)

    console.log(`[Followup] Lead ${lead_id} marked as exhausted`)
  }

  /**
   * Handler for lead_opted_out event.
   * Cancels everything but keeps ai_habilitada = true (BR-10).
   */
  static async handleLeadOptedOut(event: EventQueueItem): Promise<void> {
    const { lead_id } = event.payload
    if (!supabase) throw new Error('Supabase client not initialized')

    // 1. Cancel all pending events
    await EventQueueService.cancelByLeadId(lead_id)

    // 2. Update tracking to cancelled
    await supabase
      .from('followup_tracking')
      .update({ status: 'cancelled', next_send_at: null, updated_at: new Date().toISOString() })
      .eq('lead_id', lead_id)

    // BR-10: Keep ai_habilitada = true (do NOT set to false)
    console.log(`[Followup] Lead ${lead_id} opted out. Follow-up cancelled.`)
  }

  /**
   * Handler for daily_limit_reached event.
   */
  static async handleDailyLimitReached(event: EventQueueItem): Promise<void> {
    const { cliente_id } = event.payload
    console.log(`[Followup] Daily send limit reached for client ${cliente_id}`)
  }

  // =============================================
  // CONFIG CRUD
  // =============================================

  static async getConfig(clienteId: string): Promise<FollowupConfig | null> {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('followup_config')
      .select('*')
      .eq('cliente_id', clienteId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Error fetching followup config: ${error.message}`)
    }

    return data
  }

  static async upsertConfig(clienteId: string, input: {
    is_active?: boolean | undefined
    max_attempts?: number | undefined
    intervals?: number[] | undefined
    sending_schedule?: Record<string, string | undefined> | undefined
    daily_send_limit?: number | undefined
  }): Promise<FollowupConfig> {
    if (!supabase) throw new Error('Supabase client not initialized')

    const existing = await this.getConfig(clienteId)

    if (existing) {
      const { data, error } = await supabase
        .from('followup_config')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw new Error(`Error updating followup config: ${error.message}`)
      return data
    }

    const { data, error } = await supabase
      .from('followup_config')
      .insert({
        cliente_id: clienteId,
        ...input,
      })
      .select()
      .single()

    if (error) throw new Error(`Error creating followup config: ${error.message}`)
    return data
  }

  // =============================================
  // TRACKING
  // =============================================

  static async getTrackingByLead(leadId: string): Promise<FollowupTracking | null> {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('followup_tracking')
      .select('*')
      .eq('lead_id', leadId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Error fetching followup tracking: ${error.message}`)
    }

    return data
  }

  static async getTrackingsByCliente(
    clienteId: string,
    status?: string | undefined
  ): Promise<FollowupTracking[]> {
    if (!supabase) throw new Error('Supabase client not initialized')

    let query = supabase
      .from('followup_tracking')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('updated_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw new Error(`Error fetching followup trackings: ${error.message}`)
    return data || []
  }

  /**
   * Upsert tracking: create if not exists, or reset for new cycle.
   */
  private static async upsertTracking(leadId: string, clienteId: string): Promise<FollowupTracking> {
    if (!supabase) throw new Error('Supabase client not initialized')

    const existing = await this.getTrackingByLead(leadId)

    if (existing) {
      const { data, error } = await supabase
        .from('followup_tracking')
        .update({
          status: 'waiting',
          current_step: 0,
          cycle_count: existing.cycle_count + 1,
          last_ai_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw new Error(`Error updating followup tracking: ${error.message}`)
      return data
    }

    const { data, error } = await supabase
      .from('followup_tracking')
      .insert({
        lead_id: leadId,
        cliente_id: clienteId,
        status: 'waiting',
        current_step: 0,
        cycle_count: 1,
        last_ai_message_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw new Error(`Error creating followup tracking: ${error.message}`)
    return data
  }

  // =============================================
  // STATISTICS
  // =============================================

  static async getStats(clienteId: string): Promise<{
    active_followups: number
    total_sent: number
    total_responded: number
    response_rate: number
    by_step: { step: number; sent: number; responded: number }[]
  }> {
    if (!supabase) throw new Error('Supabase client not initialized')

    // Active follow-ups (waiting or in_progress)
    const { data: activeData } = await supabase
      .from('followup_tracking')
      .select('id')
      .eq('cliente_id', clienteId)
      .in('status', ['waiting', 'in_progress'])

    const active_followups = activeData?.length || 0

    // Total sent logs
    const { data: sentData } = await supabase
      .from('followup_log')
      .select('id, step')
      .eq('cliente_id', clienteId)
      .eq('status', 'sent')

    const total_sent = sentData?.length || 0

    // Total responded trackings
    const { data: respondedData } = await supabase
      .from('followup_tracking')
      .select('id')
      .eq('cliente_id', clienteId)
      .eq('status', 'responded')

    const total_responded = respondedData?.length || 0

    // Response rate
    const { data: allTrackings } = await supabase
      .from('followup_tracking')
      .select('id')
      .eq('cliente_id', clienteId)
      .in('status', ['responded', 'exhausted'])

    const totalCompleted = allTrackings?.length || 0
    const response_rate = totalCompleted > 0 ? (total_responded / totalCompleted) * 100 : 0

    // By step
    const stepMap = new Map<number, { sent: number; responded: number }>()
    for (const log of sentData || []) {
      const entry = stepMap.get(log.step) || { sent: 0, responded: 0 }
      entry.sent++
      stepMap.set(log.step, entry)
    }

    const by_step = Array.from(stepMap.entries())
      .map(([step, data]) => ({ step, ...data }))
      .sort((a, b) => a.step - b.step)

    return { active_followups, total_sent, total_responded, response_rate, by_step }
  }

  // =============================================
  // HELPERS
  // =============================================

  private static getBrazilNow(): Date {
    const now = new Date()
    const brazilOffset = -3 * 60 // UTC-3
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60 * 1000
    return new Date(utcMs + brazilOffset * 60 * 1000)
  }

  static getBrazilToday(): string {
    const brazil = this.getBrazilNow()
    const year = brazil.getFullYear()
    const month = String(brazil.getMonth() + 1).padStart(2, '0')
    const day = String(brazil.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  private static isWithinBusinessHours(schedule: Record<string, string>, now: Date): boolean {
    const dayOfWeek = now.getDay()
    const dayName = DAY_MAP[dayOfWeek]
    const timeRange = schedule[dayName]

    if (!timeRange || timeRange === 'fechado') return false

    const [start, end] = timeRange.split('-')
    if (!start || !end) return false

    const [startHour, startMin] = start.split(':').map(Number)
    const [endHour, endMin] = end.split(':').map(Number)

    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin

    return currentMinutes >= startMinutes && currentMinutes < endMinutes
  }

  static getNextValidSlot(schedule: Record<string, string>, fromDate: Date): Date {
    const candidate = new Date(fromDate)

    // Try up to 7 days ahead
    for (let dayOffset = 0; dayOffset < 8; dayOffset++) {
      const checkDate = new Date(candidate.getTime() + dayOffset * 24 * 60 * 60 * 1000)
      const dayOfWeek = checkDate.getDay()
      const dayName = DAY_MAP[dayOfWeek]
      const timeRange = schedule[dayName]

      if (!timeRange || timeRange === 'fechado') continue

      const [start, end] = timeRange.split('-')
      if (!start || !end) continue

      const [startHour, startMin] = start.split(':').map(Number)
      const [endHour, endMin] = end.split(':').map(Number)

      if (dayOffset === 0) {
        // Same day: check if still within range
        const currentMinutes = candidate.getHours() * 60 + candidate.getMinutes()
        const endMinutes = endHour * 60 + endMin

        if (currentMinutes < endMinutes) {
          // If before start, move to start
          const startMinutes = startHour * 60 + startMin
          if (currentMinutes < startMinutes) {
            candidate.setHours(startHour, startMin, 0, 0)
            return candidate
          }
          // Already within range
          return candidate
        }
        // Past end, continue to next day
      } else {
        // Next day: return start of business hours
        const result = new Date(checkDate)
        result.setHours(startHour, startMin, 0, 0)
        return result
      }
    }

    // Fallback: return original date (no valid slot found in 7 days)
    return fromDate
  }
}
