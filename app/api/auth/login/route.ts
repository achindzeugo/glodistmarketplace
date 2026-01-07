import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://glodistapi.onrender.com/api'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Appel à l'API externe pour l'authentification
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.detail || error.message || 'Erreur de connexion' },
        { status: response.status }
      )
    }

    const authData = await response.json()
    
    // Structure attendue: { access, refresh, user }
    const { access, refresh, user } = authData

    // Créer la réponse avec les cookies HTTP-only
    const responseData = {
      user: user,
      message: 'Connexion réussie'
    }

    const nextResponse = NextResponse.json(responseData)

    // Cookie pour le token d'accès (HTTP-only, secure, sameSite)
    nextResponse.cookies.set('auth_token', access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 jour (durée du token access)
      path: '/'
    })

    // Cookie pour le refresh token (HTTP-only, secure, sameSite)
    nextResponse.cookies.set('refresh_token', refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours (durée du refresh token)
      path: '/'
    })

    // Cookie pour les données utilisateur (accessible côté client)
    nextResponse.cookies.set('user_data', JSON.stringify(user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/'
    })

    return nextResponse

  } catch (error) {
    console.error('Erreur lors de la connexion:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}