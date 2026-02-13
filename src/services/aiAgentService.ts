import { supabase } from '../lib/supabase'
import { LlmConfigService } from './llmConfigService'
import { LlmProviderFactory, ChatMessage } from './llmProviderService'
import { PromptConfigService } from './promptConfigService'
import { ParametroService } from './parametroService'
import { ChatService } from './chatService'
import { AiAgentLogService } from './aiAgentLogService'
import evolutionApiServiceV2 from './evolution-api-v2.service'

export interface AiAgentContext {
  leadId: string
  clienteId: string
  context: 'follow_up' | 'prospeccao' | 'google_calendar' | 'whatsapp_reply'
  metadata?: Record<string, any> | undefined
}

export interface AiAgentResult {
  success: boolean
  messagesSent: number
  totalTokens: number
  latencyMs: number
  error?: string | undefined
}

interface AgentData {
  agent: any
  instanceName: string
  phone: string
  leadName: string
  evolutionApiKey: string
}

export class AiAgentService {
  /**
   * Main AI Agent execution engine.
   * Replicates and extends the N8N NeoSale-NeoSDR workflow.
   *
   * Flow:
   * 1. Load LLM config (provider/model/apiKey)
   * 2. Load context prompt (follow_up / prospeccao / etc)
   * 3. Load agent for lead (via instance_name → evolution_api_v2 → agentes)
   * 4. Load system prompts from parametros
   * 5. Load last 20 messages from n8n_chat_histories
   * 6. Compose system prompt
   * 7. Call LLM
   * 8. Process response: strip markdown → split \n\n
   * 9. For each paragraph: typing → send → record n8n_chat_histories → record chat
   * 10. Log tokens/latency/cost
   */
  static async execute(ctx: AiAgentContext): Promise<AiAgentResult> {
    const start = Date.now()
    let llmConfig = { provider: '', model: '', apiKey: '', temperature: 0.7, maxTokens: 1024 }

    try {
      // 1. Load LLM config
      llmConfig = await LlmConfigService.getOrDefault(ctx.clienteId)

      // 2. Load context prompt
      const contextPrompt = await PromptConfigService.getPromptOrDefault(ctx.clienteId, ctx.context)

      // 3. Load agent for lead
      const agentData = await this.loadAgentForLead(ctx.leadId, ctx.clienteId)

      // 4. Load system prompts from parametros
      let promptProtecao = null, promptTools = null, promptAgendamento = null, promptNaoAgendamento = null
      let systemPromptFollowup = null
      if (ctx.context === 'follow_up') {
        systemPromptFollowup = await ParametroService.getByChave('system_prompt_followup')
      } else {
        [promptProtecao, promptTools, promptAgendamento, promptNaoAgendamento] = await Promise.all([
          ParametroService.getByChave('prompt_sistema_protecao_agentes'),
          ParametroService.getByChave('prompt_tools'),
          ParametroService.getByChave('prompt_agendamento'),
          ParametroService.getByChave('prompt_nao_agendamento'),
        ])
      }

      // 5. Load last 20 messages from n8n_chat_histories
      const chatHistory = await this.loadChatHistory(ctx.leadId)

      // 6. Compose system prompt
      const isFollowUp = ctx.context === 'follow_up'
      const systemPrompt = isFollowUp
        ? this.composeFollowUpSystemPrompt({
            promptTemplate: systemPromptFollowup?.valor || '',
            phone: agentData.phone,
            leadName: agentData.leadName,
            contextPrompt,
            metadata: ctx.metadata,
          })
        : this.composeSystemPrompt({
            phone: agentData.phone,
            promptTools: promptTools?.valor || '',
            agentPrompt: agentData.agent?.prompt || '',
            contextPrompt,
            hasAgendamento: agentData.agent?.agendamento === true,
            promptAgendamento: promptAgendamento?.valor || '',
            promptNaoAgendamento: promptNaoAgendamento?.valor || '',
            promptProtecao: promptProtecao?.valor || '',
            metadata: ctx.metadata,
          })

      // Log system prompt and chat history for debugging
      console.log(`[AiAgent] Context: ${ctx.context}, Lead: ${ctx.leadId}`)
      console.log(`[AiAgent] Metadata: ${JSON.stringify(ctx.metadata || {})}`)
      console.log(`[AiAgent] Context prompt (${contextPrompt ? contextPrompt.length + ' chars' : 'empty'}): ${contextPrompt ? contextPrompt.substring(0, 150) + '...' : '(none)'}`)
      console.log(`[AiAgent] System prompt (${systemPrompt.length} chars):\n${systemPrompt.substring(0, 500)}...`)
      console.log(`[AiAgent] Chat history: ${chatHistory.length} messages`)
      if (chatHistory.length > 0) {
        const lastMsg = chatHistory[chatHistory.length - 1]
        console.log(`[AiAgent] Last message in history: [${lastMsg.role}] ${lastMsg.content.substring(0, 100)}...`)
      }

      // 7. Call LLM
      const llm = LlmProviderFactory.create(llmConfig.provider, llmConfig.apiKey)
      const llmResponse = await llm.chat(
        systemPrompt,
        chatHistory,
        llmConfig.model,
        llmConfig.temperature,
        llmConfig.maxTokens
      )

      const latencyMs = Date.now() - start

      if (!llmResponse.content) {
        throw new Error('LLM returned empty response')
      }

      console.log(`[AiAgent] LLM response (${llmResponse.content.length} chars, ${llmResponse.totalTokens} tokens): ${llmResponse.content.substring(0, 200)}`)

      // 8. Process response: strip markdown → split \n\n
      const cleanText = this.stripMarkdown(llmResponse.content)
      const paragraphs = cleanText
        .split('\n\n')
        .map(p => p.trim())
        .filter(p => p.length > 0)

      // 9. Send each paragraph
      let messagesSent = 0
      for (const paragraph of paragraphs) {
        try {
          // Typing indicator with random delay 5-15s
          const typingDelay = Math.floor(Math.random() * 10000) + 5000
          await evolutionApiServiceV2.sendPresence(
            agentData.instanceName,
            agentData.phone,
            'composing',
            typingDelay,
            agentData.evolutionApiKey
          )

          // Wait for typing delay
          await this.delay(typingDelay)

          // Send text via Evolution API
          await evolutionApiServiceV2.sendText(
            agentData.instanceName,
            agentData.phone,
            paragraph,
            agentData.evolutionApiKey
          )

          // Record in n8n_chat_histories (AI memory - MUST be first)
          await this.recordN8nChatHistory(ctx.leadId, 'ai', paragraph)

          // Record in chat table
          await ChatService.create({
            lead_id: ctx.leadId,
            cliente_id: ctx.clienteId,
            tipo: 'ai',
            mensagem: paragraph,
            source: ctx.context,
            status: 'sucesso',
          })

          messagesSent++
        } catch (sendError: any) {
          console.error(`[AiAgent] Error sending paragraph: ${sendError.message}`)
          // Record failed message in chat
          await ChatService.create({
            lead_id: ctx.leadId,
            cliente_id: ctx.clienteId,
            tipo: 'ai',
            mensagem: paragraph,
            source: ctx.context,
            status: 'erro',
            erro: sendError.message,
          })
        }
      }

      // 10. Log
      const estimatedCost = this.estimateCost(
        llmConfig.provider,
        llmConfig.model,
        llmResponse.promptTokens,
        llmResponse.completionTokens
      )

      await AiAgentLogService.create({
        cliente_id: ctx.clienteId,
        lead_id: ctx.leadId,
        context: ctx.context,
        provider: llmConfig.provider,
        model: llmConfig.model,
        prompt_tokens: llmResponse.promptTokens,
        completion_tokens: llmResponse.completionTokens,
        total_tokens: llmResponse.totalTokens,
        latency_ms: latencyMs,
        estimated_cost: estimatedCost,
        status: 'success',
      })

      return {
        success: true,
        messagesSent,
        totalTokens: llmResponse.totalTokens,
        latencyMs,
      }
    } catch (error: any) {
      const latencyMs = Date.now() - start
      console.error(`[AiAgent] Execution error: ${error.message}`)

      await AiAgentLogService.create({
        cliente_id: ctx.clienteId,
        lead_id: ctx.leadId,
        context: ctx.context,
        provider: llmConfig.provider || 'unknown',
        model: llmConfig.model || 'unknown',
        latency_ms: latencyMs,
        status: 'error',
        error_message: error.message,
      })

      return {
        success: false,
        messagesSent: 0,
        totalTokens: 0,
        latencyMs,
        error: error.message,
      }
    }
  }

  /**
   * Load agent configuration for a lead.
   * Path: leads.instance_name → evolution_api_v2 (by instance_name) → agentes (by id_agente)
   */
  private static async loadAgentForLead(leadId: string, clienteId: string): Promise<AgentData> {
    if (!supabase) throw new Error('Supabase client not initialized')

    // Get lead data
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('nome, telefone, instance_name')
      .eq('id', leadId)
      .eq('cliente_id', clienteId)
      .single()

    if (leadError || !lead) throw new Error(`Lead not found: ${leadId}`)
    if (!lead.telefone || !lead.instance_name) {
      throw new Error(`Lead ${leadId} has no phone or instance_name`)
    }

    // Get evolution instance
    const { data: instance, error: instanceError } = await supabase
      .from('evolution_api_v2')
      .select('id, id_agente, apikey')
      .eq('instance_name', lead.instance_name)
      .eq('cliente_id', clienteId)
      .single()

    if (instanceError || !instance) {
      throw new Error(`Evolution instance not found for: ${lead.instance_name}`)
    }

    // Get agent
    let agent = null
    if (instance.id_agente) {
      const { data: agentData, error: agentError } = await supabase
        .from('agentes')
        .select('id, nome, prompt, agendamento, prompt_agendamento, prompt_seguranca')
        .eq('id', instance.id_agente)
        .eq('cliente_id', clienteId)
        .single()

      if (!agentError && agentData) {
        agent = agentData
      }
    }

    // Evolution API key: instance-specific or global env
    const evolutionApiKey = instance.apikey
      || process.env.NEXT_PUBLIC_EVOLUTION_API_KEY_V2
      || ''

    return {
      agent,
      instanceName: lead.instance_name,
      phone: lead.telefone,
      leadName: lead.nome || '',
      evolutionApiKey,
    }
  }

  /**
   * Load last 20 messages from n8n_chat_histories for a lead.
   */
  private static async loadChatHistory(leadId: string): Promise<ChatMessage[]> {
    if (!supabase) return []

    const { data, error } = await supabase
      .from('n8n_chat_histories')
      .select('message')
      .eq('session_id', leadId)
      .order('id', { ascending: false })
      .limit(20)

    if (error || !data) return []

    // Reverse to chronological order and convert to ChatMessage format
    return data
      .reverse()
      .map(row => {
        const msg = row.message as any
        return {
          role: msg?.type === 'ai' ? 'assistant' as const : 'user' as const,
          content: msg?.content || '',
        }
      })
      .filter(m => m.content.length > 0)
  }

  /**
   * Compose system prompt following N8N NeoSale-NeoSDR order:
   * 1. Date/time
   * 2. Lead phone
   * 3. prompt_tools
   * 4. agent.prompt
   * 5. context prompt (follow_up / prospeccao)
   * 6. prompt_agendamento OR prompt_nao_agendamento
   * 7. prompt_sistema_protecao_agentes
   */
  private static composeSystemPrompt(params: {
    phone: string
    promptTools: string
    agentPrompt: string
    contextPrompt: string
    hasAgendamento: boolean
    promptAgendamento: string
    promptNaoAgendamento: string
    promptProtecao: string
    metadata?: Record<string, any> | undefined
  }): string {
    const now = new Date()
    const brazilTime = now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    const dayOfWeek = now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'long' })

    const parts: string[] = []

    parts.push(`Data/hora atual: ${brazilTime}`)
    parts.push(`Dia da semana: ${dayOfWeek}`)
    parts.push(`Telefone do lead: ${params.phone}`)

    if (params.promptTools) {
      parts.push(params.promptTools)
    }

    if (params.agentPrompt) {
      parts.push(params.agentPrompt)
    }

    if (params.contextPrompt) {
      parts.push(params.contextPrompt)
    }

    if (params.hasAgendamento && params.promptAgendamento) {
      parts.push(params.promptAgendamento)
    } else if (!params.hasAgendamento && params.promptNaoAgendamento) {
      parts.push(params.promptNaoAgendamento)
    }

    if (params.promptProtecao) {
      parts.push(params.promptProtecao)
    }

    return parts.join('\n\n')
  }

  /**
   * Compose system prompt for follow-up messages using the parametrized template.
   *
   * Loads the prompt template from parametros (system_prompt_followup) and replaces
   * variables: {hoje}, {data}, {hora}, {dia_semana}, {nome}, {telefone},
   * {contextPrompt}, {template}.
   *
   * Falls back to a simple default if the parameter is not configured.
   */
  private static composeFollowUpSystemPrompt(params: {
    promptTemplate: string
    phone: string
    leadName: string
    contextPrompt: string
    metadata?: Record<string, any> | undefined
  }): string {
    const now = new Date()
    const dayOfWeek = now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'long' })
    const brazilDate = now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: 'numeric', month: 'long', year: 'numeric' })
    const brazilHour = now.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const hoje = `${dayOfWeek}, ${brazilDate} às ${brazilHour}`

    const firstName = (params.leadName || '').split(' ')[0] || ''
    const stepTemplate = params.metadata?.stepTemplate || ''

    const template = params.promptTemplate

    return template
      .replace(/\{hoje\}/g, hoje)
      .replace(/\{data\}/g, brazilDate)
      .replace(/\{hora\}/g, brazilHour)
      .replace(/\{dia_semana\}/g, dayOfWeek)
      .replace(/\{nome\}/g, firstName)
      .replace(/\{telefone\}/g, params.phone)
      .replace(/\{contextPrompt\}/g, params.contextPrompt || '')
      .replace(/\{template\}/g, stepTemplate)
  }

  /**
   * Remove markdown formatting from LLM response.
   */
  private static stripMarkdown(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')      // bold
      .replace(/\*(.*?)\*/g, '$1')            // italic
      .replace(/__(.*?)__/g, '$1')            // bold alt
      .replace(/_(.*?)_/g, '$1')              // italic alt
      .replace(/~~(.*?)~~/g, '$1')            // strikethrough
      .replace(/`{3}[\s\S]*?`{3}/g, '')       // code blocks
      .replace(/`(.*?)`/g, '$1')              // inline code
      .replace(/^#{1,6}\s+/gm, '')            // headings
      .replace(/^\s*[-*+]\s+/gm, '')          // unordered lists
      .replace(/^\s*\d+\.\s+/gm, '')          // ordered lists
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')  // images
      .replace(/^>\s+/gm, '')                 // blockquotes
      .replace(/---+/g, '')                   // horizontal rules
      .trim()
  }

  /**
   * Record message in n8n_chat_histories (AI memory table).
   */
  private static async recordN8nChatHistory(
    leadId: string,
    type: 'ai' | 'human',
    content: string
  ): Promise<void> {
    if (!supabase) return

    const { error } = await supabase
      .from('n8n_chat_histories')
      .insert({
        session_id: leadId,
        message: {
          type,
          content,
          additional_kwargs: {},
          response_metadata: {},
        },
      })

    if (error) {
      console.error('[AiAgent] Error recording n8n_chat_history:', error.message)
    }
  }

  /**
   * Estimate cost based on provider and model pricing (approximate).
   */
  private static estimateCost(
    provider: string,
    model: string,
    promptTokens: number,
    completionTokens: number
  ): number {
    // Prices per 1M tokens (USD)
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4.1-mini': { input: 0.40, output: 1.60 },
      'gpt-4o': { input: 2.50, output: 10.00 },
      'gpt-4.1': { input: 2.00, output: 8.00 },
      'claude-sonnet-4-20250514': { input: 3.00, output: 15.00 },
      'claude-haiku-4-20250514': { input: 0.80, output: 4.00 },
      'gemini-2.0-flash': { input: 0.10, output: 0.40 },
      'gemini-2.5-pro': { input: 1.25, output: 10.00 },
    }

    const price = pricing[model] || { input: 1.00, output: 3.00 }
    const inputCost = (promptTokens / 1_000_000) * price.input
    const outputCost = (completionTokens / 1_000_000) * price.output
    return parseFloat((inputCost + outputCost).toFixed(6))
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
