import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { isTokenError, refreshAccessToken, setAccessTokenCookie } from "@/lib/server-auth"
import { normalizeShop, normalizeShopListResponse } from "@/lib/shop-normalizer"
import { extractApiErrorMessage } from "@/lib/user-normalizer"

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

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/shops/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    })

    const data = await readJsonSafely(response)

    if (!response.ok) {
      return NextResponse.json(
        {
          error: extractApiErrorMessage(data, "Erreur lors du chargement des boutiques"),
        },
        { status: response.status }
      )
    }

    return NextResponse.json(normalizeShopListResponse(data))
  } catch (error) {
    console.error("Erreur lors du chargement des boutiques:", error)
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
        { error: "Vous devez etre connecte pour creer une boutique." },
        { status: 401 }
      )
    }

    const body = await request.json()
    const payload = {
      name: body?.name || body?.nom || "",
      description: body?.description || "",
    }

    const sendCreateRequest = async (token: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/shops/`, {
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
          const nextResponse = NextResponse.json(normalizeShop(data), { status: response.status })
          setAccessTokenCookie(nextResponse, refreshedAccessToken)
          return nextResponse
        }
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: extractApiErrorMessage(data, "Impossible de creer la boutique"),
          details: data,
        },
        { status: response.status }
      )
    }

    const nextResponse = NextResponse.json(normalizeShop(data), { status: response.status })

    if (refreshToken && authToken !== cookieStore.get("auth_token")?.value) {
      setAccessTokenCookie(nextResponse, authToken)
    }

    return nextResponse
  } catch (error) {
    console.error("Erreur lors de la creation de la boutique:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
