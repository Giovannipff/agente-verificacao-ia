import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  // Configuração do transportador de email
  // Para produção, use um serviço como SendGrid, Mailgun, ou AWS SES
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true para 465, false para outras portas
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    })

    console.log('Email enviado:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return { success: false, error }
  }
}

export function generateVerificationEmailHTML(code: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Código de Verificação</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #4F46E5;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background-color: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 8px 8px;
        }
        .code {
          background-color: #4F46E5;
          color: white;
          font-size: 32px;
          font-weight: bold;
          text-align: center;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
          letter-spacing: 8px;
        }
        .warning {
          background-color: #FEF3C7;
          border: 1px solid #F59E0B;
          color: #92400E;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Agente de Verificação IA</h1>
      </div>
      <div class="content">
        <h2>Código de Verificação</h2>
        <p>Olá,</p>
        <p>Recebemos uma solicitação para verificar o seu email. Use o código abaixo para continuar:</p>
        
        <div class="code">${code}</div>
        
        <div class="warning">
          <strong>⚠️ Importante:</strong>
          <ul>
            <li>Este código expira em 5 minutos</li>
            <li>Use apenas uma vez</li>
            <li>Não partilhe este código com ninguém</li>
          </ul>
        </div>
        
        <p>Se não solicitou esta verificação, pode ignorar este email.</p>
        
        <p>Obrigado,<br>Equipa do Agente de Verificação IA</p>
      </div>
    </body>
    </html>
  `
}

