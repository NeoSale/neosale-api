import nodemailer from 'nodemailer'

interface SmtpConfig {
  host: string
  port: number
  user: string
  password: string
  fromEmail: string
  fromName: string
  secure: boolean
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
 * Service for sending email notifications via SMTP
 */
export class EmailNotificationService {
  private transporter: nodemailer.Transporter | null = null
  private config: SmtpConfig

  constructor(config: SmtpConfig) {
    this.config = config

    if (config.host && config.user && config.password) {
      this.transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure || config.port === 465,
        auth: {
          user: config.user,
          pass: config.password,
        },
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
   * Send email notification
   */
  async send(
    recipientEmail: string,
    subjectTemplate: string,
    bodyTemplate: string,
    payload: NotificationPayload
  ): Promise<SendResult> {
    if (!this.transporter) {
      console.log('⚠️ Email transporter not configured')
      return {
        success: false,
        error: 'Email service not configured',
      }
    }

    try {
      const subject = this.parseTemplate(subjectTemplate, payload)
      const html = this.parseTemplate(bodyTemplate, payload)

      const result = await this.transporter.sendMail({
        from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
        to: recipientEmail,
        subject,
        html,
      })

      console.log('✅ Email sent successfully:', result.messageId)
      return {
        success: true,
        messageId: result.messageId,
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('❌ Failed to send email:', errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  /**
   * Verify SMTP connection
   */
  async verify(): Promise<boolean> {
    if (!this.transporter) {
      return false
    }

    try {
      await this.transporter.verify()
      console.log('✅ SMTP connection verified')
      return true
    } catch (error) {
      console.error('❌ SMTP verification failed:', error)
      return false
    }
  }
}
