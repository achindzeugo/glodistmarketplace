import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_BASE_URL = 'https://glodistapi.onrender.com/api/v1'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refresh_token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Token de rafraîchissement manquant' },
        { status: 401 }
      )
    }

    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh: refreshToken })
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Token de rafraîchissement invalide' },
        { status: 401 }
      )
    }

    const data = await response.json()
    const { access } = data

    const nextResponse = NextResponse.json({ message: 'Token rafraîchi avec succès' })

    nextResponse.cookies.set('auth_token', access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/'
    })

    return nextResponse
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
