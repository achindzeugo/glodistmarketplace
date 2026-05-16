import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { isTokenError, refreshAccessToken, setAccessTokenCookie } from "@/lib/server-auth"
import { normalizeShopListResponse } from "@/lib/shop-normalizer"
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
    const cookieStore = await cookies()
    let authToken = cookieStore.get("auth_token")?.value
    const refreshToken = cookieStore.get("refresh_token")?.value

    if (!authToken && refreshToken) {
      authToken = await refreshAccessToken(refreshToken)
    }

    if (!authToken) {
      return NextResponse.json(
        { error: "Votre session a expire. Veuillez vous reconnecter." },
        { status: 401 }
      )
    }

    const sendShopRequest = async (token: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/shops/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      })

      const data = await readJsonSafely(response)
      return { response, data }
    }

    let { response, data } = await sendShopRequest(authToken)

    if (!response.ok && refreshToken && isTokenError(response.status, data)) {
      const refreshedAccessToken = await refreshAccessToken(refreshToken)

      if (refreshedAccessToken) {
        authToken = refreshedAccessToken
        const retryResult = await sendShopRequest(refreshedAccessToken)
        response = retryResult.response
        data = retryResult.data

        if (response.ok) {
          const normalized = normalizeShopListResponse(data)
          const nextResponse = NextResponse.json({
            shop: normalized.results[0] ?? null,
            shops: normalized.results,
            pagination: {
              count: normalized.count,
              next: normalized.next,
              previous: normalized.previous,
            },
          })
          setAccessTokenCookie(nextResponse, refreshedAccessToken)
          return nextResponse
        }
      }
    }

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ shop: null, shops: [] })
      }

      if (response.status === 401) {
        return NextResponse.json(
          { error: "Votre session a expire. Veuillez vous reconnecter." },
          { status: 401 }
        )
      }

      return NextResponse.json(
        {
          error: extractApiErrorMessage(data, "Erreur lors de la recuperation de la boutique"),
        },
        { status: response.status }
      )
    }

    const normalized = normalizeShopListResponse(data)
    const nextResponse = NextResponse.json({
      shop: normalized.results[0] ?? null,
      shops: normalized.results,
      pagination: {
        count: normalized.count,
        next: normalized.next,
        previous: normalized.previous,
      },
    })

    if (refreshToken && authToken !== cookieStore.get("auth_token")?.value) {
      setAccessTokenCookie(nextResponse, authToken)
    }

    return nextResponse
  } catch (error) {
    console.error("Erreur lors de la recuperation de la boutique:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
