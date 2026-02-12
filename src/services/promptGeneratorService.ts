import { LlmConfigService } from './llmConfigService'
import { LlmProviderFactory } from './llmProviderService'
import { PromptConfigService } from './promptConfigService'
import { ParametroService } from './parametroService'
import { ClienteService, Cliente } from './clienteService'

const CONTEXTS = ['follow_up', 'prospeccao'] as const
const PARAM_KEYS: Record<string, string> = {
  follow_up: 'prompt_followup',
  prospeccao: 'prompt_prospeccao',
}

export class PromptGeneratorService {
  /**
   * Generate a personalized prompt for a single context on demand.
   * Returns the generated prompt text without saving it.
   */
  static async generateForContext(clienteId: string, context: string): Promise<string> {
    console.log(`[PromptGenerator] On-demand generation for client ${clienteId}, context ${context}`)

    const cliente = await ClienteService.getById(clienteId)
    if (!cliente) {
      throw new Error('Client not found')
    }

    const paramKey = PARAM_KEYS[context]
    if (!paramKey) {
      throw new Error(`Unknown context: ${context}`)
    }

    const param = await ParametroService.getByChave(paramKey)
    if (!param?.valor) {
      throw new Error(`No default prompt configured for ${context}. Add the "${paramKey}" parameter first.`)
    }

    // Use Anthropic params directly from parametros
    const apiKeyParam = await ParametroService.getByChave('apikey_anthropic')
    if (!apiKeyParam?.valor) {
      throw new Error('Anthropic API key not configured. Set the "apikey_anthropic" parameter.')
    }

    const modelParam = await ParametroService.getByChave('modelo_anthropic')
    const model = modelParam?.valor || 'claude-sonnet-4-5-20250929'

    const llm = LlmProviderFactory.create('anthropic', apiKeyParam.valor)
    const metaPrompt = this.buildMetaPrompt(cliente, param.valor)

    const response = await llm.chat(
      metaPrompt,
      [{ role: 'user', content: 'Gere o prompt personalizado conforme as instruções.' }],
      model,
      0.7,
      2048
    )

    if (!response.content || response.content.trim().length < 50) {
      throw new Error('LLM returned insufficient content')
    }

    console.log(`[PromptGenerator] Generated ${context} prompt for client ${clienteId} (${response.totalTokens} tokens)`)
    return response.content.trim()
  }

  /**
   * Generate personalized prompts for a new client using LLM.
   * Called after client creation (fire-and-forget).
   */
  static async generateForNewClient(clienteId: string): Promise<void> {
    console.log(`[PromptGenerator] Starting prompt generation for client ${clienteId}`)

    // Load client data
    const cliente = await ClienteService.getById(clienteId)
    if (!cliente) {
      console.error(`[PromptGenerator] Client ${clienteId} not found`)
      return
    }

    // Get LLM config (uses fallback chain: client config → Anthropic params → env)
    let llmConfig
    try {
      llmConfig = await LlmConfigService.getOrDefault(clienteId)
    } catch (error: any) {
      console.error(`[PromptGenerator] No LLM config available: ${error.message}`)
      return
    }

    const llm = LlmProviderFactory.create(llmConfig.provider, llmConfig.apiKey)

    for (const context of CONTEXTS) {
      try {
        // Load default prompt from parametros
        const paramKey = PARAM_KEYS[context]
        const param = await ParametroService.getByChave(paramKey)
        if (!param?.valor) {
          console.log(`[PromptGenerator] No default prompt for ${context}, skipping`)
          continue
        }

        // Build meta-prompt
        const metaPrompt = this.buildMetaPrompt(cliente, param.valor)

        // Call LLM
        const response = await llm.chat(
          metaPrompt,
          [{ role: 'user', content: 'Gere o prompt personalizado conforme as instruções.' }],
          llmConfig.model,
          0.7,
          2048
        )

        if (response.content && response.content.trim().length > 50) {
          // Save personalized prompt
          await PromptConfigService.upsert(clienteId, context, response.content.trim(), 'system:auto-generated')
          console.log(`[PromptGenerator] Generated ${context} prompt for client ${clienteId} (${response.totalTokens} tokens)`)
        } else {
          console.warn(`[PromptGenerator] LLM returned insufficient content for ${context}`)
        }
      } catch (error: any) {
        console.error(`[PromptGenerator] Error generating ${context} prompt for client ${clienteId}:`, error.message)
      }
    }

    console.log(`[PromptGenerator] Finished prompt generation for client ${clienteId}`)
  }

  /**
   * Generate a step template for a follow-up step using LLM.
   * Uses the client's follow-up prompt + client data to create a personalized template.
   */
  static async generateStepTemplate(
    clienteId: string,
    stepNumber: number,
    totalSteps: number
  ): Promise<string> {
    console.log(`[PromptGenerator] Generating step template ${stepNumber}/${totalSteps} for client ${clienteId}`)

    const cliente = await ClienteService.getById(clienteId)
    if (!cliente) {
      throw new Error('Client not found')
    }

    // Load client's follow-up prompt (personalized or default)
    let followupPrompt = ''
    try {
      followupPrompt = await PromptConfigService.getPromptOrDefault(clienteId, 'follow_up')
    } catch {
      // If no prompt config, try default from parametros
      const param = await ParametroService.getByChave('prompt_followup')
      followupPrompt = param?.valor || ''
    }

    // Use Anthropic params
    const apiKeyParam = await ParametroService.getByChave('apikey_anthropic')
    if (!apiKeyParam?.valor) {
      throw new Error('Anthropic API key not configured. Set the "apikey_anthropic" parameter.')
    }

    const modelParam = await ParametroService.getByChave('modelo_anthropic')
    const model = modelParam?.valor || 'claude-sonnet-4-5-20250929'

    const llm = LlmProviderFactory.create('anthropic', apiKeyParam.valor)

    const clientInfo = [
      `Nome da empresa: ${cliente.nome}`,
      cliente.nome_responsavel_principal ? `Responsável: ${cliente.nome_responsavel_principal}` : null,
      cliente.cidade && cliente.estado ? `Localização: ${cliente.cidade}/${cliente.estado}` : null,
      cliente.site_oficial ? `Site: ${cliente.site_oficial}` : null,
    ].filter(Boolean).join('\n')

    const systemPrompt = `Você é um especialista em copywriting para mensagens de follow-up via WhatsApp.

Dados da empresa:
${clientInfo}

${followupPrompt ? `Prompt do agente de follow-up:\n---\n${followupPrompt}\n---\n` : ''}

Sua tarefa: criar um template de mensagem de follow-up para o Step ${stepNumber} de ${totalSteps}.

Contexto dos steps:
- Step 1: Primeiro follow-up, tom mais leve e casual
- Steps intermediários: Aumentar levemente a urgência, trazer mais valor
- Último step: Mensagem de despedida, deixar porta aberta

Regras:
- Mensagem curta (2-4 linhas), natural para WhatsApp
- Use a variável {nome_lead} para personalizar
- Pode usar {telefone} e {tempo_silencio} se fizer sentido
- Tom profissional mas humano e informal
- NÃO use emojis excessivos (máx 1-2)
- NÃO use saudações genéricas como "Prezado" ou "Caro"
- Retorne APENAS o template da mensagem, sem explicações`

    const response = await llm.chat(
      systemPrompt,
      [{ role: 'user', content: `Gere o template de mensagem para o Step ${stepNumber} de ${totalSteps}.` }],
      model,
      0.8,
      512
    )

    if (!response.content || response.content.trim().length < 10) {
      throw new Error('LLM returned insufficient content')
    }

    console.log(`[PromptGenerator] Generated step ${stepNumber} template for client ${clienteId} (${response.totalTokens} tokens)`)
    return response.content.trim()
  }

  private static buildMetaPrompt(cliente: Cliente, defaultPrompt: string): string {
    const clientInfo = [
      `Nome da empresa: ${cliente.nome}`,
      cliente.nome_responsavel_principal ? `Responsável: ${cliente.nome_responsavel_principal}` : null,
      cliente.cidade && cliente.estado ? `Localização: ${cliente.cidade}/${cliente.estado}` : null,
      cliente.site_oficial ? `Site: ${cliente.site_oficial}` : null,
      cliente.horario_funcionamento ? `Horário de funcionamento: ${JSON.stringify(cliente.horario_funcionamento)}` : null,
    ].filter(Boolean).join('\n')

    return `Você é um especialista em criação de prompts para IA de vendas.

Sua tarefa: adaptar o prompt base abaixo para a empresa com os seguintes dados:

${clientInfo}

Prompt base:
---
${defaultPrompt}
---

Regras:
- Mantenha a estrutura e instruções do prompt base
- Personalize com o nome da empresa e contexto do negócio
- Mantenha tom profissional e natural
- Mantenha todas as variáveis ({nome_lead}, {telefone}, etc.) intactas
- Retorne APENAS o prompt personalizado, sem explicações ou comentários`
  }
}
