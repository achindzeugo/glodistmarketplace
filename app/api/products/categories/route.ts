import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_BASE_URL = 'https://glodistapi.onrender.com/api'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth_token')?.value

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`
    }

    const response = await fetch(`${API_BASE_URL}/products/categories/`, {
      method: 'GET',
      headers: headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: "Erreur lors de la récupération des catégories", details: errorData },
        { status: response.status }
      )
    }

    const categoriesData = await response.json()
    return NextResponse.json(categoriesData)

  } catch (error) {
    console.error('Erreur interne du serveur lors de la récupération des catégories:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
