import { NextRequest, NextResponse } from 'next/server'
import { extractApiErrorMessage } from '@/lib/user-normalizer'

const API_BASE_URL = 'https://glodistapi.onrender.com/api/v1'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      )
    }

    const response = await fetch(`${API_BASE_URL}/auth/password/forgot/`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => null)
      return NextResponse.json(
        { error: extractApiErrorMessage(error, 'Erreur lors de la demande de réinitialisation') },
        { status: response.status }
      )
    }

    return NextResponse.json({
      message: 'Si le compte existe, un email de réinitialisation a été envoyé.'
    })
  } catch (error) {
    console.error('Erreur lors du mot de passe oublié:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
