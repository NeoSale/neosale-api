import { supabaseAdmin, supabase } from '../lib/supabase'
import { NotificationSettingsService } from './notificationSettingsService'
import { EmailNotificationService } from './emailNotificationService'
import evolutionApiServiceV2 from './evolution-api-v2.service'

interface Lead {
  id: string
  nome: string
  telefone: string
  email?: string
  empresa?: string
}

interface NotificationPayload {
  leadName: string
  leadPhone: string
  leadEmail?: string
  leadCompany?: string
  assignedAt: string
  assignedBy?: string
}

interface NotificationResult {
  emailSent: boolean
  whatsappSent: boolean
  emailError?: string
  whatsappError?: string
}

/**
 * Parse template variables
 */
function parseTemplate(template: string, payload: NotificationPayload): string {
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
function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '')
  if (!cleaned.startsWith('55')) {
    cleaned = '55' + cleaned
  }
  return cleaned + '@s.whatsapp.net'
}

/**
 * Get Evolution API instance config from agent
 */
async function getAgentEvolutionConfig(agentId: string): Promise<{
  instanceName: string
  apiKey: string
} | null> {
  const db = supabaseAdmin || supabase
  if (!db) return null

  // Get the instance linked to this agent from evolution_api_v2 table
  const { data: instance, error: instanceError } = await db
    .from('evolution_api_v2')
    .select('instance_name, apikey')
    .eq('id_agente', agentId)
    .limit(1)
    .single()

  if (instanceError || !instance) {
    console.warn('⚠️ No Evolution API instance found for agent:', agentId, instanceError?.message || '')
    return null
  }

  // Use instance apikey from DB, fallback to global env key
  const apiKey = instance.apikey || process.env.NEXT_PUBLIC_EVOLUTION_API_KEY_V2 || ''

  return {
    instanceName: instance.instance_name,
    apiKey,
  }
}

/**
 * Service for sending lead assignment notifications
 */
export class LeadNotificationService {
  /**
   * Notify salesperson about new lead assignment
   */
  static async notifyLeadAssignment(
    clienteId: string,
    salespersonId: string,
    lead: Lead,
    assignedBy?: string
  ): Promise<NotificationResult> {
    const result: NotificationResult = {
      emailSent: false,
      whatsappSent: false,
    }

    try {
      // Get notification settings for client
      const settings = await NotificationSettingsService.getByClienteId(clienteId)

      if (!settings) {
        console.log('⚠️ No notification settings found for client:', clienteId)
        return result
      }

      // Get salesperson info (including phone from profiles)
      const db = supabaseAdmin || supabase
      if (!db) {
        console.error('❌ Supabase client not available')
        return result
      }

      const { data: salesperson } = await db
        .from('profiles')
        .select('email, full_name, phone')
        .eq('id', salespersonId)
        .single()

      if (!salesperson) {
        console.error('❌ Salesperson not found:', salespersonId)
        return result
      }

      // Get assigner name if provided
      let assignerName = 'System'
      if (assignedBy) {
        const { data: assigner } = await db
          .from('profiles')
          .select('full_name')
          .eq('id', assignedBy)
          .single()
        assignerName = assigner?.full_name || 'System'
      }

      // Build payload conditionally to avoid undefined values
      const payload: NotificationPayload = {
        leadName: lead.nome,
        leadPhone: lead.telefone,
        assignedAt: new Date().toLocaleString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
        }),
        assignedBy: assignerName,
      }
      if (lead.email) payload.leadEmail = lead.email
      if (lead.empresa) payload.leadCompany = lead.empresa

      // Send email notification
      const smtpConfigured = settings.smtp_enabled && settings.smtp_host && settings.smtp_user && settings.smtp_password
      if (smtpConfigured && salesperson.email) {
        console.log('📧 Sending email notification to:', salesperson.email)

        const emailService = new EmailNotificationService({
          host: settings.smtp_host!,
          port: settings.smtp_port || 587,
          user: settings.smtp_user!,
          password: settings.smtp_password!,
          fromEmail: settings.smtp_from_email || '',
          fromName: settings.smtp_from_name || 'NeoSale',
          secure: settings.smtp_secure || false,
        })

        const emailResult = await emailService.send(
          salesperson.email,
          settings.email_template_subject || 'New Lead Assigned: {{lead_name}}',
          settings.email_template_body || '<p>New lead: {{lead_name}}</p>',
          payload
        )

        result.emailSent = emailResult.success
        if (emailResult.error) result.emailError = emailResult.error
      } else if (settings.smtp_enabled && !settings.smtp_host) {
        console.log('⚠️ Email enabled but SMTP not configured, skipping')
      }

      // Send WhatsApp notification via Evolution API V2
      if (!settings.whatsapp_enabled) {
        console.log('⚠️ WhatsApp notifications disabled, skipping')
      } else if (!settings.notification_agent_id) {
        console.log('⚠️ WhatsApp enabled but no notification agent configured, skipping')
      } else if (!salesperson.phone) {
        console.log('⚠️ WhatsApp enabled but salesperson has no phone number, skipping')
      } else {
        console.log('📱 Sending WhatsApp notification to:', salesperson.phone)

        const agentConfig = await getAgentEvolutionConfig(settings.notification_agent_id)

        if (agentConfig) {
          const message = parseTemplate(
            settings.whatsapp_template || 'Novo lead: *{{lead_name}}* - {{lead_phone}}',
            payload
          )
          const formattedPhone = formatPhoneNumber(salesperson.phone)

          try {
            const sendResult = await evolutionApiServiceV2.sendText(
              agentConfig.instanceName,
              formattedPhone,
              message,
              agentConfig.apiKey
            )

            result.whatsappSent = true
            console.log('✅ WhatsApp notification sent:', sendResult?.key?.id || 'ok')
          } catch (whatsappError) {
            const errorMsg = whatsappError instanceof Error ? whatsappError.message : 'Unknown error'
            console.error('❌ Failed to send WhatsApp notification:', errorMsg)
            result.whatsappError = errorMsg
          }
        } else {
          console.warn('⚠️ Could not get Evolution API config from agent')
        }
      }

      console.log('🔔 Notification result:', result)
      return result
    } catch (error) {
      console.error('❌ Error sending lead notifications:', error)
      return result
    }
  }

  /**
   * Test email notification
   */
  static async testEmail(
    clienteId: string,
    recipientEmail: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const settings = await NotificationSettingsService.getByClienteId(clienteId)

      if (!settings || !settings.smtp_enabled) {
        return { success: false, error: 'Email notifications not configured' }
      }

      if (!settings.smtp_host || !settings.smtp_user || !settings.smtp_password) {
        return { success: false, error: 'SMTP credentials not configured (host, user, or password missing)' }
      }

      const emailService = new EmailNotificationService({
        host: settings.smtp_host,
        port: settings.smtp_port || 587,
        user: settings.smtp_user,
        password: settings.smtp_password,
        fromEmail: settings.smtp_from_email || '',
        fromName: settings.smtp_from_name || 'NeoSale',
        secure: settings.smtp_secure || false,
      })

      const result = await emailService.send(
        recipientEmail,
        'Test Email - NeoSale Notifications',
        `
          <h2>Test Email</h2>
          <p>This is a test email from NeoSale notification system.</p>
          <p>If you received this email, your SMTP configuration is working correctly.</p>
          <p>Sent at: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
        `,
        {
          leadName: 'Test Lead',
          leadPhone: '11999999999',
          assignedAt: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
        }
      )

      if (result.error) {
        return { success: result.success, error: result.error }
      }
      return { success: result.success }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return { success: false, error: message }
    }
  }

  /**
   * Test WhatsApp notification
   */
  static async testWhatsApp(
    clienteId: string,
    recipientPhone: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const settings = await NotificationSettingsService.getByClienteId(clienteId)

      if (!settings || !settings.whatsapp_enabled) {
        return { success: false, error: 'WhatsApp notifications not configured' }
      }

      if (!settings.notification_agent_id) {
        return { success: false, error: 'No notification agent configured for WhatsApp' }
      }

      const agentConfig = await getAgentEvolutionConfig(settings.notification_agent_id)

      if (!agentConfig) {
        return { success: false, error: 'Could not get Evolution API config from agent' }
      }

      const formattedPhone = formatPhoneNumber(recipientPhone)
      const testMessage = `✅ *Mensagem de Teste*\n\nEsta é uma mensagem de teste do sistema de notificações NeoSale.\n\nEnviada em: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`

      const sendResult = await evolutionApiServiceV2.sendText(
        agentConfig.instanceName,
        formattedPhone,
        testMessage,
        agentConfig.apiKey
      )

      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return { success: false, error: message }
    }
  }
}
