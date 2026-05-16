import { NextRequest, NextResponse } from 'next/server'
import { extractApiErrorMessage, normalizeUser } from '@/lib/user-normalizer'

const API_BASE_URL = 'https://glodistapi.onrender.com/api/v1'

async function fetchProfile(accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(extractApiErrorMessage(error, 'Impossible de récupérer le profil utilisateur'))
  }

  return response.json()
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => null)
      return NextResponse.json(
        { error: extractApiErrorMessage(error, 'Erreur de connexion') },
        { status: response.status }
      )
    }

    const authData = await response.json().catch(() => ({}))
    const access =
      authData?.access ||
      authData?.access_token ||
      authData?.token ||
      authData?.data?.access
    const refresh =
      authData?.refresh ||
      authData?.refresh_token ||
      authData?.data?.refresh

    if (!access) {
      return NextResponse.json(
        { error: 'La réponse de connexion ne contient pas de token d’accès' },
        { status: 502 }
      )
    }

    const rawUser =
      authData?.user ||
      authData?.data?.user ||
      await fetchProfile(access)
    const user = normalizeUser(rawUser)

    const nextResponse = NextResponse.json({
      user,
      message: 'Connexion réussie',
    })

    nextResponse.cookies.set('auth_token', access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    if (refresh) {
      nextResponse.cookies.set('refresh_token', refresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
    }

    nextResponse.cookies.set('user_data', JSON.stringify(user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
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
