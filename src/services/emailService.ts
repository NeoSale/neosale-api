/**
 * Serviço de Email
 * 
 * Responsável por enviar emails do sistema usando Resend.
 * 
 * Configuração necessária:
 * 1. npm install resend
 * 2. Adicionar RESEND_API_KEY no .env
 * 3. Configurar domínio no Resend (ou usar onboarding@resend.dev para testes)
 */

import { Resend } from 'resend';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static resend: Resend | null = null;

  /**
   * Inicializar cliente Resend
   */
  private static getResendClient(): Resend | null {
    if (!this.resend && process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
    return this.resend;
  }

  /**
   * Enviar email usando Resend
   * 
   * Se RESEND_API_KEY não estiver configurada, apenas loga no console.
   */
  static async enviarEmail(options: EmailOptions): Promise<boolean> {
    const resend = this.getResendClient();

    // Se não houver API key configurada, apenas logar no console
    if (!resend) {
      console.log('⚠️  RESEND_API_KEY não configurada. Email será apenas logado:');
      console.log('📧 ========== EMAIL ==========');
      console.log('Para:', options.to);
      console.log('Assunto:', options.subject);
      console.log('HTML:', options.html.substring(0, 200) + '...');
      console.log('============================');
      return true;
    }

    try {
      // Obter email de envio (usar domínio configurado ou email de teste)
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
      
      console.log('📧 Enviando email de:', fromEmail);
      console.log('📧 RESEND_FROM_EMAIL env:', process.env.RESEND_FROM_EMAIL);

      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        ...(options.text && { text: options.text })
      });

      if (error) {
        console.error('❌ Erro ao enviar email via Resend:', error);
        return false;
      }

      console.log('✅ Email enviado via Resend:', data?.id);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      return false;
    }
  }

  /**
   * Enviar email de reset de senha
   */
  static async enviarEmailResetSenha(
    email: string,
    nome: string,
    token: string
  ): Promise<boolean> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinir Senha - NeoSale</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5">
  <table width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f5;padding:40px 20px">
    <tr>
      <td align="center">
        <table width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px;text-align:center;border-radius:8px 8px 0 0">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:600">🔐 Redefinir Senha</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px">
              <p style="margin:0 0 20px;font-size:16px;color:#333;line-height:1.6">
                Olá <strong>${nome}</strong>,
              </p>
              
              <p style="margin:0 0 20px;font-size:16px;color:#333;line-height:1.6">
                Recebemos uma solicitação para redefinir a senha da sua conta no <strong>NeoSale</strong>.
              </p>

              <p style="margin:0 0 30px;font-size:16px;color:#333;line-height:1.6">
                Clique no botão abaixo para criar uma nova senha:
              </p>

              <!-- Button -->
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding:0 0 30px">
                    <a href="${resetLink}" 
                       style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#ffffff;text-decoration:none;border-radius:6px;font-size:16px;font-weight:600;box-shadow:0 4px 12px rgba(102,126,234,0.4)">
                      Redefinir Senha
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Alternative Link -->
              <p style="margin:0 0 20px;font-size:14px;color:#666;line-height:1.6">
                Ou copie e cole o link abaixo no seu navegador:
              </p>
              
              <p style="margin:0 0 30px;padding:15px;background:#f8f9fa;border:1px solid #e9ecef;border-radius:6px;font-size:13px;color:#495057;word-break:break-all;font-family:monospace">
                ${resetLink}
              </p>

              <!-- Warning -->
              <table width="100%" cellspacing="0" cellpadding="0" style="background:#fff3cd;border:1px solid #ffc107;border-radius:6px;padding:15px;margin-bottom:20px">
                <tr>
                  <td>
                    <p style="margin:0;font-size:14px;color:#856404;line-height:1.6">
                      ⚠️ <strong>Importante:</strong> Este link expira em <strong>1 hora</strong>.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 10px;font-size:14px;color:#666;line-height:1.6">
                Se você não solicitou a redefinição de senha, ignore este email. Sua senha permanecerá inalterada.
              </p>

              <p style="margin:0;font-size:14px;color:#666;line-height:1.6">
                Por segurança, nunca compartilhe este link com outras pessoas.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fa;padding:30px;text-align:center;border-radius:0 0 8px 8px;border-top:1px solid #e9ecef">
              <p style="margin:0 0 10px;font-size:14px;color:#6c757d">
                <strong>NeoSale</strong> - Sistema de Gestão de Leads
              </p>
              <p style="margin:0;font-size:12px;color:#adb5bd">
                Este é um email automático, por favor não responda.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const text = `
Olá ${nome},

Recebemos uma solicitação para redefinir a senha da sua conta no NeoSale.

Acesse o link abaixo para criar uma nova senha:
${resetLink}

⚠️ IMPORTANTE: Este link expira em 1 hora.

Se você não solicitou a redefinição de senha, ignore este email. Sua senha permanecerá inalterada.

Por segurança, nunca compartilhe este link com outras pessoas.

---
NeoSale - Sistema de Gestão de Leads
Este é um email automático, por favor não responda.
    `;

    return this.enviarEmail({
      to: email,
      subject: '🔐 Redefinir Senha - NeoSale',
      html,
      text
    });
  }
}
