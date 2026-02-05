import { supabase } from '../lib/supabase'
import { EvolutionApiV2Service } from './evolution-api-v2.service'
import { LeadQualificationService } from './leadQualificationService'
import { ProspectingService } from './prospectingService'

const SDR_MAYA_PHONE = process.env.SDR_MAYA_PHONE || ''
const SDR_MAYA_INSTANCE = process.env.SDR_MAYA_INSTANCE || ''
const SDR_MAYA_APIKEY = process.env.SDR_MAYA_APIKEY || ''

export class SdrMayaWhatsAppService {

  static async routeToMaya(prospectId: string) {
    if (!supabase) return { success: false, message: 'Supabase nao configurado', data: null }

    // Buscar prospect
    const { data: prospect, error } = await supabase
      .from('linkedin_prospects')
      .select('*')
      .eq('id', prospectId)
      .single()

    if (error || !prospect) {
      return { success: false, message: 'Prospect nao encontrado', data: null }
    }

    if (prospect.lead_score < 70) {
      return {
        success: false,
        message: `Score insuficiente: ${prospect.lead_score}/100 (minimo 70)`,
        data: null
      }
    }

    if (prospect.whatsapp_enviado) {
      return { success: false, message: 'WhatsApp ja foi enviado para este prospect', data: null }
    }

    if (!SDR_MAYA_PHONE || !SDR_MAYA_INSTANCE) {
      console.warn('[SdrMaya] SDR_MAYA_PHONE ou SDR_MAYA_INSTANCE nao configurados')
      return { success: false, message: 'Configuracao do SDR Maya incompleta (variavel SDR_MAYA_PHONE ou SDR_MAYA_INSTANCE)', data: null }
    }

    // Gerar briefing com IA
    const briefResult = await LeadQualificationService.generateBrief(prospectId)
    const brief = briefResult.success ? briefResult.data : null

    // Montar mensagem para Maya
    const message = this.formatMayaMessage(prospect, brief)

    try {
      // Enviar via Evolution API
      const evolutionService = new EvolutionApiV2Service()
      await evolutionService.sendText(
        SDR_MAYA_INSTANCE,
        SDR_MAYA_PHONE,
        message,
        SDR_MAYA_APIKEY
      )

      // Atualizar prospect
      await supabase
        .from('linkedin_prospects')
        .update({
          whatsapp_enviado: true,
          whatsapp_enviado_at: new Date().toISOString(),
          sdm_maya_conversando: true,
          status: 'em_negociacao'
        })
        .eq('id', prospectId)

      await ProspectingService.logActivity(
        prospect.cliente_id,
        prospectId,
        'whatsapp_enviado',
        `Lead roteado para SDR Maya via WhatsApp. Score: ${prospect.lead_score}/100`
      )

      console.log(`[SdrMaya] Lead ${prospect.nome} enviado para Maya com sucesso`)
      return { success: true, message: 'Lead enviado para SDR Maya', data: { prospect_id: prospectId } }
    } catch (error) {
      console.error('[SdrMaya] Erro ao enviar para Maya:', error)
      return { success: false, message: 'Erro ao enviar WhatsApp para Maya', data: null }
    }
  }

  static async enableAutoResponses(prospectId: string, whatsappNumber: string) {
    if (!supabase) return { success: false, message: 'Supabase nao configurado', data: null }

    const { data: prospect } = await supabase
      .from('linkedin_prospects')
      .select('*')
      .eq('id', prospectId)
      .single()

    if (!prospect) {
      return { success: false, message: 'Prospect nao encontrado', data: null }
    }

    // Atualizar prospect com numero de WhatsApp
    await supabase
      .from('linkedin_prospects')
      .update({
        whatsapp_number: whatsappNumber,
        status: 'em_negociacao'
      })
      .eq('id', prospectId)

    await ProspectingService.logActivity(
      prospect.cliente_id,
      prospectId,
      'auto_response_ativado',
      `Respostas automaticas NeoSale AI ativadas para ${whatsappNumber}`
    )

    // Enviar mensagem inicial contextualizada
    const initialMessage = this.getInitialMessage(prospect)

    try {
      if (SDR_MAYA_INSTANCE && SDR_MAYA_APIKEY) {
        const evolutionService = new EvolutionApiV2Service()
        await evolutionService.sendText(
          SDR_MAYA_INSTANCE,
          whatsappNumber,
          initialMessage,
          SDR_MAYA_APIKEY
        )
      }

      return { success: true, message: 'Respostas automaticas ativadas', data: null }
    } catch (error) {
      console.error('[SdrMaya] Erro ao enviar mensagem inicial:', error)
      return { success: false, message: 'Erro ao enviar mensagem inicial', data: null }
    }
  }

  private static formatMayaMessage(prospect: any, brief: any): string {
    const lines = [
      'NOVO LEAD QUALIFICADO',
      '',
      `${prospect.nome} | ${prospect.cargo || 'Cargo nao informado'} @ ${prospect.empresa || 'Empresa nao informada'}`,
      `Setor: ${prospect.setor}`,
      `Score: ${prospect.lead_score}/100`,
    ]

    if (brief) {
      lines.push('')
      lines.push('--- BRIEFING IA ---')
      if (brief.dor) lines.push(`DOR: ${brief.dor}`)
      if (brief.abordagem) lines.push(`ABORDAGEM: ${brief.abordagem}`)
      if (brief.cta) lines.push(`CTA: ${brief.cta}`)
      if (brief.objecao) lines.push(`OBJECAO: ${brief.objecao}`)
    }

    lines.push('')
    lines.push('---')
    if (prospect.url_perfil) lines.push(`LinkedIn: ${prospect.url_perfil}`)
    lines.push(`Ref: ${prospect.id}`)
    lines.push('')
    lines.push(`Responda OK quando falar com ${prospect.nome}`)

    return lines.join('\n')
  }

  private static getInitialMessage(prospect: any): string {
    const messages: Record<string, string> = {
      clinicas: `Oi ${prospect.nome}! Tudo bem? Sou da NeoSale AI. Vi que voce atua na area de saude e gostaria de saber: como voces lidam com os agendamentos que chegam pelo WhatsApp fora do horario comercial?`,
      energia_solar: `Oi ${prospect.nome}! Tudo bem? Sou da NeoSale AI. Vi que voce atua com energia solar. Pergunta rapida: quanto tempo em media leva entre o lead pedir um orcamento e voces responderem?`,
      imobiliarias: `Oi ${prospect.nome}! Tudo bem? Sou da NeoSale AI. Vi que voce trabalha com imoveis. Pergunta rapida: como voces fazem para atender os leads que chegam pelo WhatsApp a noite e nos finais de semana?`
    }
    return messages[prospect.setor] || messages.clinicas
  }
}
