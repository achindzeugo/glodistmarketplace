import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { isTokenError, refreshAccessToken, setAccessTokenCookie } from "@/lib/server-auth"
import { normalizeCartItem } from "@/lib/cart-normalizer"
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

async function sendProtectedRequest(
  cartId: string,
  method: "GET" | "POST",
  authToken: string,
  payload?: { product: number; quantity: number }
) {
  const response = await fetch(`${API_BASE_URL}/products/carts/${cartId}/items/`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: method === "POST" ? JSON.stringify(payload) : undefined,
    cache: method === "GET" ? "no-store" : undefined,
  })

  const data = await readJsonSafely(response)
  return { response, data }
}

async function handleRequest(
  request: NextRequest,
  params: Promise<{ id: string }>,
  method: "GET" | "POST",
  unauthorizedMessage: string
) {
  try {
    const cookieStore = await cookies()
    let authToken = cookieStore.get("auth_token")?.value
    const refreshToken = cookieStore.get("refresh_token")?.value

    if (!authToken && refreshToken) {
      authToken = await refreshAccessToken(refreshToken)
    }

    if (!authToken) {
      return NextResponse.json({ error: unauthorizedMessage }, { status: 401 })
    }

    const { id } = await params
    const body = method === "POST" ? await request.json().catch(() => ({})) : null
    const payload =
      method === "POST"
        ? {
            product: Number(body?.product ?? 0),
            quantity: Math.max(1, Number(body?.quantity ?? 1)),
          }
        : undefined

    let { response, data } = await sendProtectedRequest(id, method, authToken, payload)

    if (!response.ok && refreshToken && isTokenError(response.status, data)) {
      const refreshedAccessToken = await refreshAccessToken(refreshToken)

      if (refreshedAccessToken) {
        authToken = refreshedAccessToken
        const retry = await sendProtectedRequest(id, method, refreshedAccessToken, payload)
        response = retry.response
        data = retry.data

        if (response.ok) {
          const nextResponse = NextResponse.json(
            method === "GET"
              ? {
                  count: Array.isArray((data as any)?.results) ? (data as any).results.length : 0,
                  next: null,
                  previous: null,
                  results: Array.isArray((data as any)?.results)
                    ? (data as any).results.map(normalizeCartItem)
                    : [],
                }
              : normalizeCartItem(data),
            { status: response.status }
          )
          setAccessTokenCookie(nextResponse, refreshedAccessToken)
          return nextResponse
        }
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: extractApiErrorMessage(data, "Erreur lors de la gestion des articles du panier"), details: data },
        { status: response.status }
      )
    }

    const parsed =
      method === "GET"
        ? {
            count: typeof (data as any)?.count === "number"
              ? (data as any).count
              : Array.isArray((data as any)?.results)
                ? (data as any).results.length
                : 0,
            next: typeof (data as any)?.next === "string" ? (data as any).next : null,
            previous: typeof (data as any)?.previous === "string" ? (data as any).previous : null,
            results: Array.isArray((data as any)?.results)
              ? (data as any).results.map(normalizeCartItem)
              : [],
          }
        : normalizeCartItem(data)

    const nextResponse = NextResponse.json(parsed, { status: response.status })

    if (refreshToken && authToken !== cookieStore.get("auth_token")?.value) {
      setAccessTokenCookie(nextResponse, authToken)
    }

    return nextResponse
  } catch (error) {
    console.error("Erreur lors de la gestion des articles du panier:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRequest(request, params, "GET", "Vous devez etre connecte pour consulter les articles du panier.")
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRequest(request, params, "POST", "Vous devez etre connecte pour ajouter au panier.")
}
