import { supabase } from '../lib/supabase'
import { NotificationSettingsService } from './notificationSettingsService'
import { EmailNotificationService } from './emailNotificationService'
import { WhatsAppNotificationService } from './whatsappNotificationService'

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

      // Get salesperson info
      const { data: salesperson } = await supabase!
        .from('profiles')
        .select('email, full_name')
        .eq('id', salespersonId)
        .single()

      if (!salesperson) {
        console.error('❌ Salesperson not found:', salespersonId)
        return result
      }

      // Get salesperson phone from usuarios table
      const { data: usuario } = await supabase!
        .from('usuarios')
        .select('telefone')
        .eq('id', salespersonId)
        .single()

      // Get assigner name if provided
      let assignerName = 'System'
      if (assignedBy) {
        const { data: assigner } = await supabase!
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
      if (settings.smtp_enabled && salesperson.email) {
        console.log('📧 Sending email notification to:', salesperson.email)

        const emailService = new EmailNotificationService({
          host: settings.smtp_host || '',
          port: settings.smtp_port || 587,
          user: settings.smtp_user || '',
          password: settings.smtp_password || '',
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
      }

      // Send WhatsApp notification
      if (settings.whatsapp_enabled && usuario?.telefone) {
        console.log('📱 Sending WhatsApp notification to:', usuario.telefone)

        const whatsappService = new WhatsAppNotificationService({
          baseUrl: settings.evolution_api_base_url || '',
          apiKey: settings.evolution_api_key || '',
          instanceName: settings.evolution_instance_name || '',
        })

        const whatsappResult = await whatsappService.send(
          usuario.telefone,
          settings.whatsapp_template || 'New lead: *{{lead_name}}* - {{lead_phone}}',
          payload
        )

        result.whatsappSent = whatsappResult.success
        if (whatsappResult.error) result.whatsappError = whatsappResult.error
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

      const emailService = new EmailNotificationService({
        host: settings.smtp_host || '',
        port: settings.smtp_port || 587,
        user: settings.smtp_user || '',
        password: settings.smtp_password || '',
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

      const whatsappService = new WhatsAppNotificationService({
        baseUrl: settings.evolution_api_base_url || '',
        apiKey: settings.evolution_api_key || '',
        instanceName: settings.evolution_instance_name || '',
      })

      const result = await whatsappService.send(
        recipientPhone,
        `✅ *Test Message*\n\nThis is a test message from NeoSale notification system.\n\nSent at: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`,
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
}
