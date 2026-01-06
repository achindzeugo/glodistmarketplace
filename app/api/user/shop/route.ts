import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_BASE_URL = 'https://glodistapi.onrender.com/api'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth_token')?.value

    if (!authToken) {
      return NextResponse.json(
        { error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    // Appel à l'API pour récupérer les informations de la boutique de l'utilisateur
    const response = await fetch(`${API_BASE_URL}/user/shop/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        // L'utilisateur n'a pas de boutique
        return NextResponse.json({ shop: null })
      }
      return NextResponse.json(
        { error: 'Erreur lors de la récupération de la boutique' },
        { status: response.status }
      )
    }

    const shopData = await response.json()
    return NextResponse.json({ shop: shopData })

  } catch (error) {
    console.error('Erreur lors de la récupération de la boutique:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}