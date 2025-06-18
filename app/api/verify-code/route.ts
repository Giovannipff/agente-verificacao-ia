import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isValidEmail, isValidVerificationCode, sanitizeInput, logSecurityEvent } from '../../../utils/security'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Rate limiting para verificação de código
const codeRateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkCodeRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutos
  const maxAttempts = 10 // Mais tentativas para códigos

  const record = codeRateLimitMap.get(ip)
  
  if (!record || now > record.resetTime) {
    codeRateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
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
    const ip = request.headers.get("x-forwarded-for") || "unknown"
    // Rate limiting
    if (!checkCodeRateLimit(ip)) {
      logSecurityEvent('CODE_RATE_LIMIT_EXCEEDED', { ip, endpoint: '/api/verify-code' })
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
        { status: 429 }
      )
    }

    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email e código são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar e sanitizar entrada
    const sanitizedEmail = sanitizeInput(email)
    const sanitizedCode = code.trim()

    if (!isValidEmail(sanitizedEmail)) {
      logSecurityEvent('INVALID_EMAIL_FORMAT_CODE', { email: sanitizedEmail, ip })
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      )
    }

    if (!isValidVerificationCode(sanitizedCode)) {
      logSecurityEvent('INVALID_CODE_FORMAT', { email: sanitizedEmail, code: sanitizedCode, ip })
      return NextResponse.json(
        { error: 'Código deve ter 6 dígitos' },
        { status: 400 }
      )
    }

    // Buscar código de verificação válido
    const { data: verificationData, error: verificationError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', sanitizedEmail)
      .eq('code', sanitizedCode)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (verificationError || !verificationData) {
      logSecurityEvent('CODE_VERIFICATION_FAILED', { 
        email: sanitizedEmail, 
        code: sanitizedCode, 
        ip,
        error: verificationError?.message 
      })
      return NextResponse.json(
        { error: 'Código inválido ou expirado' },
        { status: 400 }
      )
    }

    // Remover o código usado
    await supabase
      .from('verification_codes')
      .delete()
      .eq('id', verificationData.id)

    logSecurityEvent('CODE_VERIFIED_SUCCESS', { email: sanitizedEmail, ip })

    return NextResponse.json({
      message: 'Código verificado com sucesso',
      verified: true
    })

  } catch (error: any) {
    console.error('Erro na API:', error)
    logSecurityEvent('CODE_API_ERROR', { error: error.message, ip: request.ip })
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}


