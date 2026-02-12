import OpenAI from 'openai'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  tool_call_id?: string
  tool_calls?: any[]
}

export interface LlmResponse {
  content: string
  toolCalls?: any[] | undefined
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export interface ILlmProvider {
  chat(
    systemPrompt: string,
    messages: ChatMessage[],
    model: string,
    temperature: number,
    maxTokens: number,
    tools?: any[]
  ): Promise<LlmResponse>
}

class OpenAIProvider implements ILlmProvider {
  private client: OpenAI

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey })
  }

  async chat(
    systemPrompt: string,
    messages: ChatMessage[],
    model: string,
    temperature: number,
    maxTokens: number,
    tools?: any[]
  ): Promise<LlmResponse> {
    const allMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))
    ]

    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      model,
      messages: allMessages,
      temperature,
      max_tokens: maxTokens,
    }

    if (tools && tools.length > 0) {
      params.tools = tools
    }

    const response = await this.client.chat.completions.create(params)
    const choice = response.choices[0]

    return {
      content: choice.message?.content || '',
      toolCalls: choice.message?.tool_calls,
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0
    }
  }
}

class AnthropicProvider implements ILlmProvider {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async chat(
    systemPrompt: string,
    messages: ChatMessage[],
    model: string,
    temperature: number,
    maxTokens: number
  ): Promise<LlmResponse> {
    // Dynamic import to avoid requiring the package if not used
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: this.apiKey })

    const anthropicMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
      content: m.content
    }))

    const response = await client.messages.create({
      model,
      system: systemPrompt,
      messages: anthropicMessages,
      temperature,
      max_tokens: maxTokens,
    })

    const textBlock = response.content.find(b => b.type === 'text')

    return {
      content: textBlock?.type === 'text' ? textBlock.text : '',
      promptTokens: response.usage?.input_tokens || 0,
      completionTokens: response.usage?.output_tokens || 0,
      totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)
    }
  }
}

class GoogleProvider implements ILlmProvider {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async chat(
    systemPrompt: string,
    messages: ChatMessage[],
    model: string,
    temperature: number,
    maxTokens: number
  ): Promise<LlmResponse> {
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(this.apiKey)

    const genModel = genAI.getGenerativeModel({
      model,
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      }
    })

    // Build Gemini history (all messages except the last user message)
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))

    const chat = genModel.startChat({ history })
    const lastMessage = messages[messages.length - 1]?.content || ''
    const result = await chat.sendMessage(lastMessage)
    const response = result.response

    return {
      content: response.text(),
      promptTokens: response.usageMetadata?.promptTokenCount || 0,
      completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: response.usageMetadata?.totalTokenCount || 0
    }
  }
}

export class LlmProviderFactory {
  static create(provider: string, apiKey: string): ILlmProvider {
    switch (provider) {
      case 'openai':
        return new OpenAIProvider(apiKey)
      case 'anthropic':
        return new AnthropicProvider(apiKey)
      case 'google':
        return new GoogleProvider(apiKey)
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`)
    }
  }

  /**
   * Test connection to the LLM provider by sending a minimal request.
   */
  static async testConnection(
    provider: string,
    apiKey: string,
    model: string
  ): Promise<{ success: boolean; message: string; latencyMs: number }> {
    const start = Date.now()

    try {
      const llm = LlmProviderFactory.create(provider, apiKey)
      const response = await llm.chat(
        'You are a test assistant.',
        [{ role: 'user', content: 'Say "OK" and nothing else.' }],
        model,
        0,
        10
      )

      const latencyMs = Date.now() - start

      if (response.content) {
        return {
          success: true,
          message: `Connection successful. Response: "${response.content.substring(0, 50)}"`,
          latencyMs
        }
      }

      return {
        success: false,
        message: 'No response received from the provider.',
        latencyMs
      }
    } catch (error: any) {
      const latencyMs = Date.now() - start
      return {
        success: false,
        message: error?.message || 'Unknown error',
        latencyMs
      }
    }
  }
}
