import { NextRequest, NextResponse } from 'next/server'
import { extractApiErrorMessage } from '@/lib/user-normalizer'

const API_BASE_URL = 'https://glodistapi.onrender.com/api/v1'

export async function POST(request: NextRequest) {
  try {
    const { uid, token, new_password } = await request.json()

    if (!uid || !token || !new_password) {
      return NextResponse.json(
        { error: 'uid, token et nouveau mot de passe requis' },
        { status: 400 }
      )
    }

    const response = await fetch(`${API_BASE_URL}/auth/password/reset/`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid, token, new_password }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => null)
      return NextResponse.json(
        { error: extractApiErrorMessage(error, 'Erreur lors de la réinitialisation du mot de passe') },
        { status: response.status }
      )
    }

    return NextResponse.json({
      message: 'Mot de passe réinitialisé avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
