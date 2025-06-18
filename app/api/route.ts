import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'API do Agente de Verificação IA está funcionando!',
    status: 'online',
    timestamp: new Date().toISOString(),
    endpoints: {
      'POST /api/verify-email': 'Verificar se email existe e gerar código',
      'POST /api/verify-code': 'Verificar código de verificação'
    }
  })
}

