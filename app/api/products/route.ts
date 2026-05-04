import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { NextRequest } from "next/server"
import { isTokenError, refreshAccessToken, setAccessTokenCookie } from "@/lib/server-auth"
import { extractApiErrorMessage } from "@/lib/user-normalizer"
import { normalizeProduct, normalizeProductPayload } from "@/lib/product-normalizer"

const API_BASE_URL = "https://glodistapi.onrender.com/api/v1"

async function readJsonSafely(response: Response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get("auth_token")?.value

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`
    }

    const searchParams = new URLSearchParams(request.nextUrl.searchParams.toString())
    const boutiqueId = searchParams.get("boutique")

    if (boutiqueId && !searchParams.get("shop")) {
      searchParams.delete("boutique")
      searchParams.set("shop", boutiqueId)
    }

    const query = searchParams.toString()
    const apiUrl = `${API_BASE_URL}/products/${query ? `?${query}` : ""}`
    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    })

    const data = await readJsonSafely(response)

    if (!response.ok) {
      return NextResponse.json(
        { error: extractApiErrorMessage(data, "Erreur lors du chargement des produits") },
        { status: response.status }
      )
    }

    const rawProducts = Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data)
        ? data
        : []

    return NextResponse.json(rawProducts.map(normalizeProduct))
  } catch (error) {
    console.error("Erreur lors du chargement des produits:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    let authToken = cookieStore.get("auth_token")?.value
    const refreshToken = cookieStore.get("refresh_token")?.value

    if (!authToken && refreshToken) {
      authToken = await refreshAccessToken(refreshToken)
    }

    if (!authToken) {
      return NextResponse.json(
        { error: "Vous n'etes pas authentifie." },
        { status: 401 }
      )
    }

    const productData = await request.json()
    const payload = normalizeProductPayload(productData)

    const sendCreateRequest = async (token: string) => {
      const response = await fetch(`${API_BASE_URL}/products/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await readJsonSafely(response)
      return { response, data }
    }

    let { response, data } = await sendCreateRequest(authToken)

    if (!response.ok && refreshToken && isTokenError(response.status, data)) {
      const refreshedAccessToken = await refreshAccessToken(refreshToken)

      if (refreshedAccessToken) {
        authToken = refreshedAccessToken
        const retryResult = await sendCreateRequest(refreshedAccessToken)
        response = retryResult.response
        data = retryResult.data

        if (response.ok) {
          const nextResponse = NextResponse.json(normalizeProduct(data), { status: 201 })
          setAccessTokenCookie(nextResponse, refreshedAccessToken)
          return nextResponse
        }
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: extractApiErrorMessage(data, "Erreur lors de la creation du produit."),
          details: data,
        },
        { status: response.status }
      )
    }

    const nextResponse = NextResponse.json(normalizeProduct(data), { status: 201 })

    if (refreshToken && authToken !== cookieStore.get("auth_token")?.value) {
      setAccessTokenCookie(nextResponse, authToken)
    }

    return nextResponse
  } catch (error) {
    console.error("Erreur interne du serveur lors de la creation du produit:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
