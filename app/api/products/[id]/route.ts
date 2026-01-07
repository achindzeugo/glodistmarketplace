import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_BASE_URL = 'https://glodistapi.onrender.com/api'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const authToken = cookieStore.get('auth_token')?.value

    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`
    }

    const response = await fetch(`${API_BASE_URL}/products/${params.id}`, {
      method: 'GET',
      headers
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: response.status }
      )
    }

    const product = await response.json()
    return NextResponse.json(product)

  } catch (error) {
    console.error('Erreur lors du chargement du produit:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}