import { supabase } from '../lib/supabase'
import { LinkedInConfigService } from './linkedinConfigService'
import { LinkedInApiService } from './linkedinApiService'

const MIN_DELAY_MS = 120000 // 2 min
const MAX_DELAY_MS = 300000 // 5 min

interface ProspectInput {
  cliente_id: string
  linkedin_id?: string
  nome: string
  cargo?: string
  empresa?: string
  setor: string
  tamanho_empresa?: string
  url_perfil?: string
}

interface ProspectFilters {
  cliente_id: string
  status?: string | undefined
  setor?: string | undefined
  min_score?: number | undefined
  search?: string | undefined
  page?: number
  limit?: number
}

export class ProspectingService {

  private static handleSupabaseError(error: any, operation: string): string {
    const code = error?.code
    if (code === '23505') return 'Prospect ja existe com esse linkedin_id'
    if (code === '23503') return 'Referencia invalida'
    if (code === 'PGRST116') return 'Registro nao encontrado'
    console.error(`Erro em ProspectingService.${operation}:`, error)
    return `Erro ao ${operation}`
  }

  // ========== CRUD ==========

  static async getProspects(filters: ProspectFilters) {
    if (!supabase) return { success: false, message: 'Supabase nao configurado', data: null }

    const page = filters.page || 1
    const limit = filters.limit || 20
    const offset = (page - 1) * limit

    let query = supabase
      .from('linkedin_prospects')
      .select('*', { count: 'exact' })
      .eq('cliente_id', filters.cliente_id)

    if (filters.status) query = query.eq('status', filters.status)
    if (filters.setor) query = query.eq('setor', filters.setor)
    if (filters.min_score) query = query.gte('lead_score', filters.min_score)
    if (filters.search) {
      query = query.or(`nome.ilike.%${filters.search}%,empresa.ilike.%${filters.search}%,cargo.ilike.%${filters.search}%`)
    }

    const { data, error, count } = await query
      .order('touched_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return { success: false, message: this.handleSupabaseError(error, 'listar prospects'), data: null }
    }

    const total = count || 0
    return {
      success: true,
      message: 'Prospects listados com sucesso',
      data: {
        items: data || [],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    }
  }

  static async getProspectById(id: string) {
    if (!supabase) return { success: false, message: 'Supabase nao configurado', data: null }

    const { data, error } = await supabase
      .from('linkedin_prospects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return { success: false, message: this.handleSupabaseError(error, 'buscar prospect'), data: null }
    }

    return { success: true, message: 'Prospect encontrado', data }
  }

  static async createProspect(input: ProspectInput) {
    if (!supabase) return { success: false, message: 'Supabase nao configurado', data: null }

    const { data, error } = await supabase
      .from('linkedin_prospects')
      .upsert({
        cliente_id: input.cliente_id,
        linkedin_id: input.linkedin_id || null,
        nome: input.nome,
        cargo: input.cargo || null,
        empresa: input.empresa || null,
        setor: input.setor,
        tamanho_empresa: input.tamanho_empresa || null,
        url_perfil: input.url_perfil || null,
        status: 'novo'
      }, { onConflict: 'linkedin_id' })
      .select()
      .single()

    if (error) {
      return { success: false, message: this.handleSupabaseError(error, 'criar prospect'), data: null }
    }

    return { success: true, message: 'Prospect criado com sucesso', data }
  }

  static async updateProspect(id: string, updates: Record<string, any>) {
    if (!supabase) return { success: false, message: 'Supabase nao configurado', data: null }

    const { data, error } = await supabase
      .from('linkedin_prospects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { success: false, message: this.handleSupabaseError(error, 'atualizar prospect'), data: null }
    }

    return { success: true, message: 'Prospect atualizado com sucesso', data }
  }

  static async updateProspectStatus(clienteId: string, id: string, status: string) {
    const result = await this.updateProspect(id, { status })

    if (result.success) {
      await this.logActivity(clienteId, id, 'status_alterado', `Status alterado para: ${status}`)
    }

    return result
  }

  // ========== STATS ==========

  static async getStats(clienteId: string) {
    if (!supabase) return { success: false, message: 'Supabase nao configurado', data: null }

    const { data, error } = await supabase
      .from('linkedin_prospects')
      .select('status, lead_score')
      .eq('cliente_id', clienteId)

    if (error) {
      return { success: false, message: this.handleSupabaseError(error, 'buscar stats'), data: null }
    }

    const prospects = (data || []) as Array<{ status: string; lead_score: number }>
    const total = prospects.length
    const conexoes_enviadas = prospects.filter(p => p.status !== 'novo').length
    const conexoes_aceitas = prospects.filter(p =>
      ['conexao_aceita', 'respondeu', 'qualificado', 'em_negociacao', 'cliente'].includes(p.status)
    ).length
    const respondidos = prospects.filter(p =>
      ['respondeu', 'qualificado', 'em_negociacao', 'cliente'].includes(p.status)
    ).length
    const qualificados = prospects.filter(p =>
      ['qualificado', 'em_negociacao', 'cliente'].includes(p.status)
    ).length
    const em_negociacao = prospects.filter(p => p.status === 'em_negociacao').length
    const clientes = prospects.filter(p => p.status === 'cliente').length

    const scores = prospects.filter(p => p.lead_score > 0).map(p => p.lead_score)
    const score_medio = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0

    const taxa_aceitacao = conexoes_enviadas > 0
      ? Math.round((conexoes_aceitas / conexoes_enviadas) * 100)
      : 0

    const taxa_resposta = conexoes_aceitas > 0
      ? Math.round((respondidos / conexoes_aceitas) * 100)
      : 0

    return {
      success: true,
      message: 'Stats calculados com sucesso',
      data: {
        total_prospects: total,
        conexoes_enviadas,
        conexoes_aceitas,
        respondidos,
        qualificados,
        em_negociacao,
        clientes,
        score_medio,
        taxa_aceitacao,
        taxa_resposta
      }
    }
  }

  // ========== SETORES DINAMICOS ==========

  static async getActiveSetores() {
    if (!supabase) return { success: false, message: 'Supabase nao configurado', data: null }

    const { data, error } = await supabase
      .from('prospection_sequences')
      .select('setor')
      .eq('is_active', true)

    if (error) {
      return { success: false, message: this.handleSupabaseError(error, 'buscar setores'), data: null }
    }

    const setores = [...new Set((data || []).map((d: { setor: string }) => d.setor))].sort()
    return { success: true, message: 'Setores ativos', data: setores }
  }

  // ========== PROSPECTING AUTOMATION ==========

  static async runDailyProspecting(clienteId: string, setor: string) {
    console.log(`[ProspectingService] Iniciando prospeccao diaria para cliente ${clienteId}, setor: ${setor}`)

    let enviadas = 0
    let erros = 0
    let buscados_linkedin = 0

    // Buscar sequencia ativa para o setor e cliente
    const sequence = await this.getActiveSequence(clienteId, setor)
    if (!sequence) {
      console.log(`[ProspectingService] Nenhuma sequencia ativa para setor ${setor}, cliente ${clienteId}`)
      return { enviadas: 0, erros: 0, buscados_linkedin: 0 }
    }

    const connectionMessage = (sequence.messages as any[])[0]?.message || ''

    if (!supabase) return { enviadas: 0, erros: 0, buscados_linkedin: 0 }

    // Buscar config LinkedIn do cliente para determinar limites
    const linkedinConfig = await LinkedInConfigService.getByClienteId(clienteId)
    const dailyLimit = linkedinConfig.data?.daily_invite_limit || 25

    // FASE 1: Buscar novos prospects via LinkedIn API (se disponivel)
    const token = await LinkedInConfigService.getValidToken(clienteId)
    if (token && linkedinConfig.data) {
      try {
        const searchKeywords = (linkedinConfig.data.search_keywords as string[]) || []
        const targetIndustries = (linkedinConfig.data.target_industries as string[]) || []

        if (searchKeywords.length > 0) {
          const searchParams: Parameters<typeof LinkedInApiService.searchPeople>[1] = {
            keywords: searchKeywords.join(' '),
            count: linkedinConfig.data.daily_search_limit || 25,
          }
          if (targetIndustries[0]) searchParams.industry = targetIndustries[0]

          const searchResult = await LinkedInApiService.searchPeople(token, searchParams)

          if (searchResult.success && searchResult.data) {
            for (const result of searchResult.data.results) {
              try {
                await this.createProspect({
                  cliente_id: clienteId,
                  linkedin_id: result.urn,
                  nome: result.name,
                  cargo: result.title,
                  empresa: result.company,
                  setor,
                  url_perfil: result.profileUrl
                })
                buscados_linkedin++
              } catch {
                // Prospect ja existe (upsert com onConflict)
              }
            }
            console.log(`[ProspectingService] ${buscados_linkedin} prospects encontrados via LinkedIn para setor ${setor}`)
          }
        }
      } catch (error) {
        console.warn(`[ProspectingService] LinkedIn search indisponivel para cliente ${clienteId}:`, error)
      }
    }

    // FASE 2: Processar prospects com status 'novo'
    const { data: prospects } = await supabase
      .from('linkedin_prospects')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('status', 'novo')
      .eq('setor', setor)
      .limit(dailyLimit)

    if (!prospects || prospects.length === 0) {
      console.log(`[ProspectingService] Nenhum prospect novo para setor ${setor}`)
      return { enviadas: 0, erros: 0, buscados_linkedin: buscados_linkedin }
    }

    for (const prospect of prospects) {
      try {
        // Delay humanizado entre conexoes
        const delay = Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS)) + MIN_DELAY_MS
        await new Promise(resolve => setTimeout(resolve, delay))

        // Enviar convite via LinkedIn API (se disponivel)
        if (token && prospect.linkedin_id) {
          try {
            await LinkedInApiService.sendInvitation(token, prospect.linkedin_id, connectionMessage || undefined)
          } catch (error) {
            console.warn(`[ProspectingService] Falha ao enviar convite LinkedIn para ${prospect.nome}:`, error)
          }
        }

        // Atualizar status para contato_enviado
        await this.updateProspect(prospect.id, {
          status: 'contato_enviado',
          primeira_msg_enviada: true,
          primeira_msg_at: new Date().toISOString(),
          sequencia_name: sequence.name,
          sequencia_step: 1
        })

        await this.logActivity(clienteId, prospect.id, 'conexao_enviada',
          `Mensagem de conexao enviada: ${(connectionMessage || 'sem mensagem').substring(0, 100)}...`)

        enviadas++
        console.log(`[ProspectingService] Conexao enviada para ${prospect.nome} (${enviadas}/${dailyLimit})`)
      } catch (error) {
        erros++
        console.error(`[ProspectingService] Erro ao enviar conexao para ${prospect.nome}:`, error)
      }
    }

    console.log(`[ProspectingService] Prospeccao ${setor} finalizada: ${enviadas} enviadas, ${erros} erros, ${buscados_linkedin} buscados`)
    return { enviadas, erros, buscados_linkedin }
  }

  // ========== ACTIVITIES ==========

  static async logActivity(clienteId: string, prospectId: string, acao: string, detalhes: string) {
    if (!supabase) return

    await supabase
      .from('prospection_activities')
      .insert({
        cliente_id: clienteId,
        prospect_id: prospectId,
        acao,
        detalhes
      })
  }

  static async getActivities(clienteId: string, filters?: { prospect_id?: string | undefined; acao?: string | undefined; limit?: number; offset?: number }) {
    if (!supabase) return { success: false, message: 'Supabase nao configurado', data: null }

    let query = supabase
      .from('prospection_activities')
      .select(`
        *,
        prospect:linkedin_prospects(id, nome, cargo, empresa, setor, status, lead_score)
      `)
      .eq('cliente_id', clienteId)

    if (filters?.prospect_id) query = query.eq('prospect_id', filters.prospect_id)
    if (filters?.acao) query = query.eq('acao', filters.acao)

    const limit = filters?.limit || 50
    const offset = filters?.offset || 0

    const { data, error } = await query
      .order('criado_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return { success: false, message: this.handleSupabaseError(error, 'listar atividades'), data: null }
    }

    return { success: true, message: 'Atividades listadas', data: data || [] }
  }

  // ========== SEQUENCES ==========

  static async getActiveSequence(clienteId: string, setor: string) {
    if (!supabase) return null

    const { data } = await supabase
      .from('prospection_sequences')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('setor', setor)
      .eq('tipo', 'conexao')
      .eq('is_active', true)
      .limit(1)
      .single()

    return data
  }

  static async getSequences(clienteId?: string) {
    if (!supabase) return { success: false, message: 'Supabase nao configurado', data: null }

    let query = supabase
      .from('prospection_sequences')
      .select('*')

    // Se clienteId fornecido, filtrar sequências do cliente + templates globais (cliente_id null)
    if (clienteId) {
      query = query.or(`cliente_id.eq.${clienteId},cliente_id.is.null`)
    }

    const { data, error } = await query.order('setor', { ascending: true })

    if (error) {
      return { success: false, message: this.handleSupabaseError(error, 'listar sequencias'), data: null }
    }

    return { success: true, message: 'Sequencias listadas', data: data || [] }
  }

  static async getSequenceById(clienteId: string, id: string) {
    if (!supabase) return { success: false, message: 'Supabase nao configurado', data: null }

    const { data, error } = await supabase
      .from('prospection_sequences')
      .select('*')
      .eq('id', id)
      .or(`cliente_id.eq.${clienteId},cliente_id.is.null`)
      .single()

    if (error) {
      return { success: false, message: this.handleSupabaseError(error, 'buscar sequencia'), data: null }
    }

    return { success: true, message: 'Sequencia encontrada', data }
  }

  static async createSequence(clienteId: string, input: { name: string; setor: string; tipo: string; messages: any[]; is_active?: boolean }) {
    if (!supabase) return { success: false, message: 'Supabase nao configurado', data: null }

    const { data, error } = await supabase
      .from('prospection_sequences')
      .insert({
        cliente_id: clienteId,
        name: input.name,
        setor: input.setor,
        tipo: input.tipo,
        messages: input.messages,
        is_active: input.is_active !== undefined ? input.is_active : true
      })
      .select()
      .single()

    if (error) {
      return { success: false, message: this.handleSupabaseError(error, 'criar sequencia'), data: null }
    }

    return { success: true, message: 'Sequencia criada com sucesso', data }
  }

  static async updateSequence(clienteId: string, id: string, updates: Record<string, any>) {
    if (!supabase) return { success: false, message: 'Supabase nao configurado', data: null }

    const { data, error } = await supabase
      .from('prospection_sequences')
      .update(updates)
      .eq('id', id)
      .eq('cliente_id', clienteId)
      .select()
      .single()

    if (error) {
      return { success: false, message: this.handleSupabaseError(error, 'atualizar sequencia'), data: null }
    }

    return { success: true, message: 'Sequencia atualizada com sucesso', data }
  }

  static async deleteSequence(clienteId: string, id: string) {
    if (!supabase) return { success: false, message: 'Supabase nao configurado', data: null }

    const { error } = await supabase
      .from('prospection_sequences')
      .delete()
      .eq('id', id)
      .eq('cliente_id', clienteId)

    if (error) {
      return { success: false, message: this.handleSupabaseError(error, 'deletar sequencia'), data: null }
    }

    return { success: true, message: 'Sequencia deletada com sucesso', data: null }
  }

}
