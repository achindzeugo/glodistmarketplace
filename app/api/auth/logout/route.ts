import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_BASE_URL = 'https://glodistapi.onrender.com/api/v1'

export async function POST() {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth_token')?.value
  const refreshToken = cookieStore.get('refresh_token')?.value

  if (authToken && refreshToken) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout/`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ refresh: refreshToken }),
      })
    } catch (error) {
      console.warn('Impossible de notifier le logout côté API distante:', error)
    }
  }

  const response = NextResponse.json({ message: 'Déconnexion réussie' })

  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  })

  response.cookies.set('refresh_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  })

  response.cookies.set('user_data', '', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  })

  return response
}
