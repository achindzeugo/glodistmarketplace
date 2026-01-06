import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_BASE_URL = 'https://glodistapi.onrender.com/api'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth_token')?.value

    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`
    }

    const response = await fetch(`${API_BASE_URL}/products/`, {
      method: 'GET',
      headers
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erreur lors du chargement des produits' },
        { status: response.status }
      )
    }

    const data = await response.json()
    // L'API retourne probablement { results: [...] } pour la pagination
    return NextResponse.json(data.results || data)

  } catch (error) {
    console.error('Erreur lors du chargement des produits:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}