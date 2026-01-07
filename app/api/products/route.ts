import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

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

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth_token')?.value

    if (!authToken) {
      return NextResponse.json(
        { error: "Vous n'êtes pas authentifié." },
        { status: 401 }
      )
    }

    const productData = await request.json()

    const response = await fetch(`${API_BASE_URL}/products/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(productData),
    })

    if (!response.ok) {
      const errorDetails = await response.json().catch(() => ({}))
      console.error("Erreur de l'API externe lors de la création du produit:", errorDetails)
      return NextResponse.json(
        { error: 'Erreur lors de la création du produit.', details: errorDetails },
        { status: response.status }
      )
    }

    const newProduct = await response.json()
    return NextResponse.json(newProduct, { status: 201 })

  } catch (error) {
    console.error('Erreur interne du serveur lors de la création du produit:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}