import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { isTokenError, refreshAccessToken, setAccessTokenCookie } from "@/lib/server-auth"
import { normalizeCart, normalizeCartListResponse } from "@/lib/cart-normalizer"
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

async function withAuthRequest<T>(
  execute: (token: string) => Promise<{ response: Response; data: unknown; parsed: T | null }>,
  unauthorizedMessage: string
) {
  const cookieStore = await cookies()
  let authToken = cookieStore.get("auth_token")?.value
  const refreshToken = cookieStore.get("refresh_token")?.value

  if (!authToken && refreshToken) {
    authToken = await refreshAccessToken(refreshToken)
  }

  if (!authToken) {
    return NextResponse.json({ error: unauthorizedMessage }, { status: 401 })
  }

  let { response, data, parsed } = await execute(authToken)

  if (!response.ok && refreshToken && isTokenError(response.status, data)) {
    const refreshedAccessToken = await refreshAccessToken(refreshToken)

    if (refreshedAccessToken) {
      authToken = refreshedAccessToken
      const retry = await execute(refreshedAccessToken)
      response = retry.response
      data = retry.data
      parsed = retry.parsed

      if (response.ok) {
        const nextResponse = NextResponse.json(parsed, { status: response.status })
        setAccessTokenCookie(nextResponse, refreshedAccessToken)
        return nextResponse
      }
    }
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: extractApiErrorMessage(data, "Erreur lors du chargement du panier"), details: data },
      { status: response.status }
    )
  }

  const nextResponse = NextResponse.json(parsed, { status: response.status })

  if (refreshToken && authToken !== cookieStore.get("auth_token")?.value) {
    setAccessTokenCookie(nextResponse, authToken)
  }

  return nextResponse
}

export async function GET(request: NextRequest) {
  return withAuthRequest(
    async (token) => {
      const query = request.nextUrl.searchParams.toString()
      const response = await fetch(`${API_BASE_URL}/products/carts/${query ? `?${query}` : ""}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      })

      const data = await readJsonSafely(response)
      return {
        response,
        data,
        parsed: normalizeCartListResponse(data),
      }
    },
    "Vous devez etre connecte pour consulter votre panier."
  )
}

export async function POST(request: NextRequest) {
  return withAuthRequest(
    async (token) => {
      const body = await request.json().catch(() => ({}))
      const payload = {
        code:
          typeof body?.code === "string" && body.code.trim().length > 0
            ? body.code.trim()
            : `GLD-${Date.now()}`,
      }

      const response = await fetch(`${API_BASE_URL}/products/carts/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await readJsonSafely(response)
      return {
        response,
        data,
        parsed: normalizeCart(data),
      }
    },
    "Vous devez etre connecte pour creer un panier."
  )
}
