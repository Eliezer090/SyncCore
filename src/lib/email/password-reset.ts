import { Resend } from 'resend';

// Lazy initialization para evitar erros durante o build
let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

interface SendPasswordResetEmailParams {
  to: string;
  nome: string;
  resetToken: string;
}

export async function sendPasswordResetEmail({
  to,
  nome,
  resetToken,
}: SendPasswordResetEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const resetUrl = `${siteUrl}/auth/reset-password/confirm?token=${resetToken}`;
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

    const resend = getResend();
    await resend.emails.send({
      from: fromEmail,
      to,
      subject: 'Recuperação de Senha - SyncCore',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f5f7fa;
              border-radius: 8px;
              padding: 40px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              max-width: 200px;
              height: auto;
            }
            h1 {
              color: #1a1a1a;
              font-size: 24px;
              margin-bottom: 10px;
            }
            .slogan {
              color: #666;
              font-style: italic;
              margin-bottom: 30px;
            }
            .content {
              background-color: white;
              border-radius: 6px;
              padding: 30px;
              margin-bottom: 20px;
            }
            .button {
              display: inline-block;
              background-color: #1976d2;
              color: white;
              text-decoration: none;
              padding: 12px 30px;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
            }
            .button:hover {
              background-color: #1565c0;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 12px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 12px;
              margin-top: 30px;
            }
            .link {
              color: #1976d2;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>SyncCore</h1>
              <p class="slogan">Gestão inteligente em cada detalhe</p>
            </div>
            
            <div class="content">
              <h2>Olá, ${nome}!</h2>
              
              <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
              
              <p>Para criar uma nova senha, clique no botão abaixo:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Redefinir Senha</a>
              </div>
              
              <div class="warning">
                <strong>⏰ Atenção:</strong> Este link expira em 1 hora por motivos de segurança.
              </div>
              
              <p>Se você não conseguir clicar no botão, copie e cole este link no seu navegador:</p>
              <p class="link">${resetUrl}</p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p><strong>Não solicitou a redefinição de senha?</strong></p>
              <p>Se você não fez esta solicitação, ignore este e-mail. Sua senha permanecerá inalterada.</p>
            </div>
            
            <div class="footer">
              <p>Este é um e-mail automático. Por favor, não responda.</p>
              <p>&copy; ${new Date().getFullYear()} SyncCore. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar e-mail de reset:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao enviar e-mail',
    };
  }
}
