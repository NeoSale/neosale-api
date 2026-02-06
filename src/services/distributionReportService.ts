import { supabase } from '../lib/supabase'

interface SalespersonStats {
  salespersonId: string
  salespersonName: string
  salespersonEmail: string
  totalLeadsReceived: number
  totalLeadsCompleted: number
  totalLeadsActive: number
  totalLeadsTransferred: number
  averageResponseTimeMinutes: number | null
  conversionRate: number
}

interface DailyTrend {
  date: string
  distributed: number
  completed: number
  transferred: number
}

interface StatusBreakdown {
  ativo: number
  concluido: number
  transferido: number
  cancelado: number
}

interface DistributionReport {
  period: {
    start: string
    end: string
  }
  summary: {
    totalLeadsDistributed: number
    totalLeadsInQueue: number
    totalLeadsCompleted: number
    averageConversionRate: number
  }
  byStatus: StatusBreakdown
  bySalesperson: SalespersonStats[]
  dailyTrend: DailyTrend[]
}

/**
 * Service for generating distribution reports
 */
export class DistributionReportService {
  /**
   * Get complete distribution report for a period
   */
  static async getReport(
    clienteId: string,
    startDate: string,
    endDate: string
  ): Promise<DistributionReport> {
    if (!supabase) throw new Error('Supabase not initialized')

    console.log('📊 Generating distribution report:', { clienteId, startDate, endDate })

    // Get all assignments in period
    const { data: assignments, error: assignmentsError } = await supabase
      .from('lead_atribuicoes')
      .select(`
        id,
        lead_id,
        vendedor_id,
        status,
        created_at,
        updated_at
      `)
      .eq('cliente_id', clienteId)
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`)

    if (assignmentsError) {
      console.error('❌ Error fetching assignments:', assignmentsError)
      throw assignmentsError
    }

    // Get queue count
    const { count: queueCount } = await supabase
      .from('lead_fila_espera')
      .select('*', { count: 'exact', head: true })
      .eq('cliente_id', clienteId)
      .eq('processado', false)

    // Get salesperson info
    const vendedorIds = [...new Set(assignments?.map((a) => a.vendedor_id) || [])]
    const { data: salespersons } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', vendedorIds.length > 0 ? vendedorIds : ['00000000-0000-0000-0000-000000000000'])

    const salespersonMap = new Map(
      salespersons?.map((s) => [s.id, { name: s.full_name || 'Unknown', email: s.email || '' }]) || []
    )

    // Aggregate data
    const byStatus: StatusBreakdown = {
      ativo: 0,
      concluido: 0,
      transferido: 0,
      cancelado: 0,
    }

    const bySalespersonMap = new Map<string, SalespersonStats>()
    const dailyMap = new Map<string, DailyTrend>()

    for (const assignment of assignments || []) {
      // By status
      const status = assignment.status as keyof StatusBreakdown
      if (status in byStatus) {
        byStatus[status]++
      }

      // By salesperson
      const spId = assignment.vendedor_id
      const spInfo = salespersonMap.get(spId) || { name: 'Unknown', email: '' }

      if (!bySalespersonMap.has(spId)) {
        bySalespersonMap.set(spId, {
          salespersonId: spId,
          salespersonName: spInfo.name,
          salespersonEmail: spInfo.email,
          totalLeadsReceived: 0,
          totalLeadsCompleted: 0,
          totalLeadsActive: 0,
          totalLeadsTransferred: 0,
          averageResponseTimeMinutes: null,
          conversionRate: 0,
        })
      }

      const sp = bySalespersonMap.get(spId)!
      sp.totalLeadsReceived++
      if (assignment.status === 'concluido') sp.totalLeadsCompleted++
      if (assignment.status === 'ativo') sp.totalLeadsActive++
      if (assignment.status === 'transferido') sp.totalLeadsTransferred++

      // Daily trend
      const date = assignment.created_at.split('T')[0]
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          distributed: 0,
          completed: 0,
          transferred: 0,
        })
      }

      const day = dailyMap.get(date)!
      day.distributed++
      if (assignment.status === 'concluido') day.completed++
      if (assignment.status === 'transferido') day.transferred++
    }

    // Calculate conversion rates
    for (const sp of bySalespersonMap.values()) {
      if (sp.totalLeadsReceived > 0) {
        sp.conversionRate = Math.round(
          (sp.totalLeadsCompleted / sp.totalLeadsReceived) * 100
        )
      }
    }

    // Sort salespeople by leads received
    const bySalesperson = Array.from(bySalespersonMap.values()).sort(
      (a, b) => b.totalLeadsReceived - a.totalLeadsReceived
    )

    // Calculate average conversion rate
    const totalConversionRate = bySalesperson.reduce(
      (sum, sp) => sum + sp.conversionRate,
      0
    )
    const averageConversionRate =
      bySalesperson.length > 0
        ? Math.round(totalConversionRate / bySalesperson.length)
        : 0

    // Sort daily trend by date
    const dailyTrend = Array.from(dailyMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    )

    const report: DistributionReport = {
      period: {
        start: startDate,
        end: endDate,
      },
      summary: {
        totalLeadsDistributed: assignments?.length || 0,
        totalLeadsInQueue: queueCount || 0,
        totalLeadsCompleted: byStatus.concluido,
        averageConversionRate,
      },
      byStatus,
      bySalesperson,
      dailyTrend,
    }

    console.log('✅ Report generated:', {
      totalDistributed: report.summary.totalLeadsDistributed,
      salespeople: bySalesperson.length,
    })

    return report
  }

  /**
   * Get lead assignments with pagination and filters
   */
  static async getAssignments(
    clienteId: string,
    filters: {
      vendedorId?: string
      status?: string
      startDate?: string
      endDate?: string
      page?: number
      limit?: number
    }
  ): Promise<{ data: unknown[]; total: number }> {
    if (!supabase) throw new Error('Supabase not initialized')

    const page = filters.page || 1
    const limit = filters.limit || 20
    const offset = (page - 1) * limit

    let query = supabase
      .from('lead_atribuicoes')
      .select(
        `
        id,
        lead_id,
        vendedor_id,
        atribuido_por,
        status,
        notificado,
        notificado_em,
        motivo_transferencia,
        created_at,
        updated_at,
        lead:lead_id(id, nome, telefone, email),
        vendedor:vendedor_id(id, full_name, email)
      `,
        { count: 'exact' }
      )
      .eq('cliente_id', clienteId)

    if (filters.vendedorId) {
      query = query.eq('vendedor_id', filters.vendedorId)
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.startDate) {
      query = query.gte('created_at', `${filters.startDate}T00:00:00`)
    }

    if (filters.endDate) {
      query = query.lte('created_at', `${filters.endDate}T23:59:59`)
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('❌ Error fetching assignments:', error)
      throw error
    }

    // Transform data
    const transformedData = (data || []).map((item: Record<string, unknown>) => {
      const lead = item.lead as { id: string; nome: string; telefone: string; email: string } | null
      const vendedor = item.vendedor as { id: string; full_name: string; email: string } | null

      return {
        id: item.id,
        leadId: item.lead_id,
        leadName: lead?.nome || 'Unknown',
        leadPhone: lead?.telefone || '',
        leadEmail: lead?.email || null,
        salespersonId: item.vendedor_id,
        salespersonName: vendedor?.full_name || 'Unknown',
        assignedBy: item.atribuido_por,
        assignedByName: null, // Could fetch if needed
        status: item.status,
        notified: item.notificado,
        notifiedAt: item.notificado_em,
        transferReason: item.motivo_transferencia,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }
    })

    return {
      data: transformedData,
      total: count || 0,
    }
  }
}
