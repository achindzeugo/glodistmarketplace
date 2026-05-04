import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { extractApiErrorMessage } from '@/lib/user-normalizer'

const API_BASE_URL = 'https://glodistapi.onrender.com/api/v1'

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth_token')?.value

    if (!authToken) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { old_password, new_password } = await request.json()

    if (!old_password || !new_password) {
      return NextResponse.json(
        { error: 'Ancien et nouveau mot de passe requis' },
        { status: 400 }
      )
    }

    const response = await fetch(`${API_BASE_URL}/auth/password/change/`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ old_password, new_password }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => null)
      return NextResponse.json(
        { error: extractApiErrorMessage(error, 'Erreur lors du changement de mot de passe') },
        { status: response.status }
      )
    }

    return NextResponse.json({
      message: 'Mot de passe changé avec succès'
    })
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
