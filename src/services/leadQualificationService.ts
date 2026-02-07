import { supabase } from '../lib/supabase'
import { getOpenAI } from '../lib/openai'
import { ProspectingService } from './prospectingService'

interface QualificationScore {
  setor_match: number
  cargo_seniority: number
  company_size: number
  engagement: number
  total: number
}

const PRIORITY_SECTORS = ['clinicas', 'energia_solar', 'imobiliarias']
const SENIOR_TITLES = ['diretor', 'gerente', 'ceo', 'cto', 'cfo', 'coo', 'head', 'vp', 'presidente', 'socio', 'dono', 'proprietario', 'fundador', 'founder']

export class LeadQualificationService {

  static async qualifyPendingLeads() {
    if (!supabase) {
      console.error('[LeadQualification] Supabase nao configurado')
      return { success: false, message: 'Supabase nao configurado', data: null }
    }

    console.log('[LeadQualification] Iniciando qualificacao de leads pendentes...')

    const { data: pendingLeads, error } = await supabase
      .from('linkedin_prospects')
      .select('*')
      .in('status', ['conexao_aceita', 'respondeu'])
      .is('lead_score', null)
      .limit(50)

    if (error) {
      console.error('[LeadQualification] Erro ao buscar leads pendentes:', error)
      return { success: false, message: 'Erro ao buscar leads pendentes', data: null }
    }

    if (!pendingLeads || pendingLeads.length === 0) {
      // Tambem qualificar leads com score 0
      const { data: zeroScoreLeads } = await supabase
        .from('linkedin_prospects')
        .select('*')
        .in('status', ['conexao_aceita', 'respondeu'])
        .eq('lead_score', 0)
        .limit(50)

      if (!zeroScoreLeads || zeroScoreLeads.length === 0) {
        console.log('[LeadQualification] Nenhum lead pendente para qualificar')
        return { success: true, message: 'Nenhum lead pendente', data: { qualified: 0 } }
      }

      return this.processLeads(zeroScoreLeads)
    }

    return this.processLeads(pendingLeads)
  }

  private static async processLeads(leads: any[]) {
    let qualified = 0
    let errors = 0

    for (const lead of leads) {
      try {
        const score = this.calculateScore(lead)

        let newStatus = lead.status
        if (score.total >= 70) {
          newStatus = 'qualificado'
          qualified++
        } else if (score.total < 50) {
          newStatus = 'descqualificado'
        }

        await supabase!
          .from('linkedin_prospects')
          .update({
            lead_score: score.total,
            score_breakdown: score,
            status: newStatus
          })
          .eq('id', lead.id)

        await ProspectingService.logActivity(
          lead.cliente_id,
          lead.id,
          'qualificacao_executada',
          `Score: ${score.total}/100 (setor: ${score.setor_match}, cargo: ${score.cargo_seniority}, empresa: ${score.company_size}, engajamento: ${score.engagement}). Status: ${newStatus}`
        )

        console.log(`[LeadQualification] ${lead.nome}: score ${score.total} -> ${newStatus}`)
      } catch (error) {
        errors++
        console.error(`[LeadQualification] Erro ao qualificar ${lead.nome}:`, error)
      }
    }

    console.log(`[LeadQualification] Finalizado: ${qualified} qualificados, ${errors} erros de ${leads.length} leads`)
    return {
      success: true,
      message: `${qualified} leads qualificados de ${leads.length} processados`,
      data: { qualified, errors, total: leads.length }
    }
  }

  static calculateScore(prospect: any): QualificationScore {
    let setor_match = 10
    if (PRIORITY_SECTORS.includes(prospect.setor)) {
      setor_match = 20
    }

    let cargo_seniority = 10
    const cargoLower = (prospect.cargo || '').toLowerCase()
    if (SENIOR_TITLES.some(title => cargoLower.includes(title))) {
      cargo_seniority = 20
    }

    let company_size = 5
    const tamanho = (prospect.tamanho_empresa || '').toLowerCase()
    if (tamanho === 'media' || tamanho === 'grande') {
      company_size = 15
    }

    let engagement = 5
    if (prospect.respondeu && prospect.respondeu_at) {
      const responseTime = prospect.aceita_at
        ? new Date(prospect.respondeu_at).getTime() - new Date(prospect.aceita_at).getTime()
        : Infinity
      if (responseTime < 60 * 60 * 1000) { // menos de 1 hora
        engagement = 10
      }
    }

    const total = Math.min(setor_match + cargo_seniority + company_size + engagement, 100)

    return { setor_match, cargo_seniority, company_size, engagement, total }
  }

  static async generateBrief(prospectId: string): Promise<{ success: boolean; message: string; data: any }> {
    if (!supabase) return { success: false, message: 'Supabase nao configurado', data: null }

    const { data: prospect, error } = await supabase
      .from('linkedin_prospects')
      .select('*')
      .eq('id', prospectId)
      .single()

    if (error || !prospect) {
      return { success: false, message: 'Prospect nao encontrado', data: null }
    }

    try {
      const prompt = `Voce e um especialista em vendas B2B. Gere um briefing para o SDR abordar este lead:

Lead: ${prospect.nome}
Cargo: ${prospect.cargo || 'nao informado'}
Empresa: ${prospect.empresa || 'nao informada'}
Setor: ${prospect.setor}
Score: ${prospect.lead_score}/100

Gere em JSON:
{
  "dor": "Principal dor do setor em 1 linha",
  "abordagem": "Como abordar em 2 linhas",
  "cta": "Call-to-action especifico em 1 linha",
  "objecao": "Objecao comum + resposta em 3 linhas"
}`

      const response = await getOpenAI().chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        response_format: { type: 'json_object' }
      })

      const brief = JSON.parse(response.choices[0].message.content || '{}')

      return { success: true, message: 'Briefing gerado', data: brief }
    } catch (error) {
      console.error('[LeadQualification] Erro ao gerar briefing:', error)
      return { success: false, message: 'Erro ao gerar briefing com IA', data: null }
    }
  }
}
