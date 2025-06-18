import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, generateVerificationEmailHTML } from '../../../utils/email'
import { isValidEmail, sanitizeInput, logSecurityEvent } from '../../../utils/security'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Rate limiting simples em memória (para produção, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutos
  const maxAttempts = 5

  const record = rateLimitMap.get(ip)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= maxAttempts) {
    return false
  }
  
  record.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(ip)) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { ip, endpoint: '/api/verify-email' })
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
        { status: 429 }
      )
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    // Validar e sanitizar email
    const sanitizedEmail = sanitizeInput(email)
    if (!isValidEmail(sanitizedEmail)) {
      logSecurityEvent('INVALID_EMAIL_FORMAT', { email: sanitizedEmail, ip })
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      )
    }

    // Verificar se o email existe na tabela auth.users
    const { data: user, error: userError } = await supabase
      .from('auth.users')
      .select('email')
      .eq('email', sanitizedEmail)
      .single()

    if (userError || !user) {
      logSecurityEvent('EMAIL_NOT_FOUND', { email: sanitizedEmail, ip })
      return NextResponse.json(
        { error: 'Email não encontrado na base de dados' },
        { status: 404 }
      )
    }

    // Gerar código de verificação de 6 dígitos
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Calcular tempo de expiração (5 minutos)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

    // Remover códigos antigos para este email
    await supabase
      .from('verification_codes')
      .delete()
      .eq('email', sanitizedEmail)

    // Inserir novo código de verificação
    const { error: insertError } = await supabase
      .from('verification_codes')
      .insert({
        email: sanitizedEmail,
        code: verificationCode,
        expires_at: expiresAt
      })

    if (insertError) {
      console.error('Erro ao inserir código:', insertError)
      logSecurityEvent('DATABASE_ERROR', { error: insertError, ip })
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    // Enviar email com o código de verificação
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const emailResult = await sendEmail({
        to: sanitizedEmail,
        subject: 'Código de Verificação - Agente IA',
        html: generateVerificationEmailHTML(verificationCode)
      })

      if (!emailResult.success) {
        console.error('Erro ao enviar email:', emailResult.error)
        logSecurityEvent('EMAIL_SEND_ERROR', { error: emailResult.error, ip })
      } else {
        logSecurityEvent('EMAIL_SENT', { email: sanitizedEmail, ip })
      }
    } else {
      console.log(`Código de verificação para ${sanitizedEmail}: ${verificationCode}`)
      logSecurityEvent('CODE_GENERATED', { email: sanitizedEmail, ip })
    }

    return NextResponse.json({
      message: 'Código de verificação enviado por email',
      // Remover esta linha em produção quando o email estiver configurado
      ...((!process.env.SMTP_USER || !process.env.SMTP_PASS) && { code: verificationCode })
    })

  } catch (error: any) {
    console.error('Erro na API:', error)
    logSecurityEvent('API_ERROR', { error: error.message, ip: request.ip })
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

