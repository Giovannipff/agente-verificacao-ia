import { NextRequest } from 'next/server'
import rateLimit from 'express-rate-limit'
import slowDown from 'express-slow-down'

// Rate limiting para prevenir ataques de força bruta
export const createRateLimiter = (windowMs: number, max: number) => {
  return rateLimit({
    windowMs,
    max,
    message: 'Muitas tentativas. Tente novamente mais tarde.',
    standardHeaders: true,
    legacyHeaders: false,
  })
}

// Slow down para reduzir a velocidade de tentativas
export const createSlowDown = (windowMs: number, delayAfter: number) => {
  return slowDown({
    windowMs,
    delayAfter,
    delayMs: 500, // Atraso de 500ms após delayAfter tentativas
  })
}

// Validação de email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validação de código de verificação
export function isValidVerificationCode(code: string): boolean {
  const codeRegex = /^\d{6}$/
  return codeRegex.test(code)
}

// Sanitização de entrada
export function sanitizeInput(input: string): string {
  return input.trim().toLowerCase()
}

// Verificação de origem da requisição
export function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []
  
  // Em desenvolvimento, permitir localhost
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  
  return origin ? allowedOrigins.includes(origin) : false
}

// Headers de segurança
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
}

// Logging de segurança
export function logSecurityEvent(event: string, details: any) {
  console.log(`[SECURITY] ${new Date().toISOString()} - ${event}:`, details)
}

