import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'API do Agente de Verificação IA está funcionando',
    endpoints: {
      'POST /api/verify-email': 'Verificar se email existe e gerar código',
      'POST /api/verify-code': 'Verificar código de verificação'
    }
  })
}

