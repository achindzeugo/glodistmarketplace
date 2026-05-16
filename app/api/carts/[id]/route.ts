import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { isTokenError, refreshAccessToken, setAccessTokenCookie } from "@/lib/server-auth"
import { normalizeCart } from "@/lib/cart-normalizer"
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
  id: string,
  method: "GET" | "DELETE",
  authToken: string
) {
  const response = await fetch(`${API_BASE_URL}/products/carts/${id}/`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    cache: method === "GET" ? "no-store" : undefined,
  })

  const data = method === "DELETE" ? null : await readJsonSafely(response)
  return { response, data }
}

async function handleRequest(
  params: Promise<{ id: string }>,
  method: "GET" | "DELETE",
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
    let { response, data } = await sendProtectedRequest(id, method, authToken)

    if (!response.ok && refreshToken && isTokenError(response.status, data)) {
      const refreshedAccessToken = await refreshAccessToken(refreshToken)

      if (refreshedAccessToken) {
        authToken = refreshedAccessToken
        const retry = await sendProtectedRequest(id, method, refreshedAccessToken)
        response = retry.response
        data = retry.data

        if (response.ok) {
          if (method === "DELETE") {
            const nextResponse = new NextResponse(null, { status: 204 })
            setAccessTokenCookie(nextResponse, refreshedAccessToken)
            return nextResponse
          }

          const nextResponse = NextResponse.json(normalizeCart(data), { status: response.status })
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

    if (method === "DELETE") {
      const nextResponse = new NextResponse(null, { status: 204 })

      if (refreshToken && authToken !== cookieStore.get("auth_token")?.value) {
        setAccessTokenCookie(nextResponse, authToken)
      }

      return nextResponse
    }

    const nextResponse = NextResponse.json(normalizeCart(data), { status: response.status })

    if (refreshToken && authToken !== cookieStore.get("auth_token")?.value) {
      setAccessTokenCookie(nextResponse, authToken)
    }

    return nextResponse
  } catch (error) {
    console.error("Erreur lors de la gestion du panier:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRequest(params, "GET", "Vous devez etre connecte pour consulter ce panier.")
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRequest(params, "DELETE", "Vous devez etre connecte pour supprimer ce panier.")
}
