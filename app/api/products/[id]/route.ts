import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { isTokenError, refreshAccessToken, setAccessTokenCookie } from "@/lib/server-auth"
import { normalizePartialProductPayload, normalizeProduct } from "@/lib/product-normalizer"
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get("auth_token")?.value
    const { id } = await params

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`
    }

    const response = await fetch(`${API_BASE_URL}/products/${id}/`, {
      method: "GET",
      headers,
      cache: "no-store",
    })

    const data = await readJsonSafely(response)

    if (!response.ok) {
      return NextResponse.json(
        { error: extractApiErrorMessage(data, "Produit non trouve") },
        { status: response.status }
      )
    }

    return NextResponse.json(normalizeProduct(data))
  } catch (error) {
    console.error("Erreur lors du chargement du produit:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

async function sendProtectedProductRequest(
  id: string,
  method: "PUT" | "PATCH" | "DELETE",
  authToken: string,
  payload?: unknown
) {
  const response = await fetch(`${API_BASE_URL}/products/${id}/`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: method === "DELETE" ? undefined : JSON.stringify(payload),
  })

  const data = method === "DELETE" ? null : await readJsonSafely(response)

  return { response, data }
}

async function handleProtectedMutation(
  request: NextRequest,
  params: Promise<{ id: string }>,
  method: "PUT" | "PATCH" | "DELETE"
) {
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

    const { id } = await params
    const requestBody =
      method === "DELETE" ? null : await request.json().catch(() => ({}))
    const payload =
      method === "DELETE" ? undefined : normalizePartialProductPayload(requestBody)

    let { response, data } = await sendProtectedProductRequest(id, method, authToken, payload)

    if (!response.ok && refreshToken && isTokenError(response.status, data)) {
      const refreshedAccessToken = await refreshAccessToken(refreshToken)

      if (refreshedAccessToken) {
        authToken = refreshedAccessToken
        const retryResult = await sendProtectedProductRequest(id, method, refreshedAccessToken, payload)
        response = retryResult.response
        data = retryResult.data

        if (response.ok) {
          if (method === "DELETE") {
            const nextResponse = new NextResponse(null, { status: 204 })
            setAccessTokenCookie(nextResponse, refreshedAccessToken)
            return nextResponse
          }

          const nextResponse = NextResponse.json(normalizeProduct(data), { status: response.status })
          setAccessTokenCookie(nextResponse, refreshedAccessToken)
          return nextResponse
        }
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: extractApiErrorMessage(data, `Erreur lors de la mise a jour du produit`),
          details: data,
        },
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

    const nextResponse = NextResponse.json(normalizeProduct(data), { status: response.status })

    if (refreshToken && authToken !== cookieStore.get("auth_token")?.value) {
      setAccessTokenCookie(nextResponse, authToken)
    }

    return nextResponse
  } catch (error) {
    console.error("Erreur lors de la mutation du produit:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleProtectedMutation(request, params, "PUT")
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleProtectedMutation(request, params, "PATCH")
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleProtectedMutation(request, params, "DELETE")
}
