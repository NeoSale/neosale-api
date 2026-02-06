import axios, { AxiosInstance } from 'axios'

interface EvolutionApiConfig {
  baseUrl: string
  apiKey: string
  instanceName: string
}

interface NotificationPayload {
  leadName: string
  leadPhone: string
  leadEmail?: string
  leadCompany?: string
  assignedAt: string
  assignedBy?: string
}

interface SendResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Service for sending WhatsApp notifications via Evolution API
 */
export class WhatsAppNotificationService {
  private client: AxiosInstance | null = null
  private config: EvolutionApiConfig

  constructor(config: EvolutionApiConfig) {
    this.config = config

    if (config.baseUrl && config.apiKey) {
      this.client = axios.create({
        baseURL: config.baseUrl,
        headers: {
          'Content-Type': 'application/json',
          apikey: config.apiKey,
        },
        timeout: 30000,
      })
    }
  }

  /**
   * Parse template variables
   */
  private parseTemplate(template: string, payload: NotificationPayload): string {
    return template
      .replace(/\{\{lead_name\}\}/g, payload.leadName)
      .replace(/\{\{lead_phone\}\}/g, payload.leadPhone)
      .replace(/\{\{lead_email\}\}/g, payload.leadEmail || 'N/A')
      .replace(/\{\{lead_company\}\}/g, payload.leadCompany || 'N/A')
      .replace(/\{\{assigned_at\}\}/g, payload.assignedAt)
      .replace(/\{\{assigned_by\}\}/g, payload.assignedBy || 'System')
  }

  /**
   * Format phone number for WhatsApp
   */
  private formatPhoneNumber(phone: string): string {
    // Remove non-digits
    let cleaned = phone.replace(/\D/g, '')

    // Ensure country code (Brazil = 55)
    if (!cleaned.startsWith('55')) {
      cleaned = '55' + cleaned
    }

    return cleaned + '@s.whatsapp.net'
  }

  /**
   * Send WhatsApp message
   */
  async send(
    recipientPhone: string,
    messageTemplate: string,
    payload: NotificationPayload
  ): Promise<SendResult> {
    if (!this.client) {
      console.log('⚠️ WhatsApp client not configured')
      return {
        success: false,
        error: 'WhatsApp service not configured',
      }
    }

    try {
      const message = this.parseTemplate(messageTemplate, payload)
      const formattedPhone = this.formatPhoneNumber(recipientPhone)

      const response = await this.client.post(
        `/message/sendText/${this.config.instanceName}`,
        {
          number: formattedPhone,
          text: message,
        }
      )

      const messageId = response.data?.key?.id || response.data?.messageId
      console.log('✅ WhatsApp message sent:', messageId)

      return {
        success: true,
        messageId,
      }
    } catch (error: unknown) {
      let errorMessage = 'Unknown error'
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      console.error('❌ Failed to send WhatsApp:', errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  /**
   * Check if instance is connected
   */
  async checkConnection(): Promise<boolean> {
    if (!this.client) {
      return false
    }

    try {
      const response = await this.client.get(
        `/instance/connectionState/${this.config.instanceName}`
      )
      const state = response.data?.instance?.state
      console.log('📱 WhatsApp connection state:', state)
      return state === 'open'
    } catch (error) {
      console.error('❌ Failed to check WhatsApp connection:', error)
      return false
    }
  }
}
