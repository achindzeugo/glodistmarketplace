import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://glodistapi.onrender.com/api'

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()

    // Appel à l'API externe pour l'inscription
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.detail || 'Erreur lors de l\'inscription' },
        { status: response.status }
      )
    }

    const authData = await response.json()

    return NextResponse.json({
      user: authData.user,
      message: 'Inscription réussie'
    })

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}