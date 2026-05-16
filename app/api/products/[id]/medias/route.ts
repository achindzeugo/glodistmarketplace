import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { isTokenError, refreshAccessToken, setAccessTokenCookie } from "@/lib/server-auth"
import { normalizeMedia, normalizeMediaListResponse } from "@/lib/product-normalizer"
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
    const { id } = await params

    const response = await fetch(`${API_BASE_URL}/products/${id}/medias/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    const data = await readJsonSafely(response)

    if (!response.ok) {
      return NextResponse.json(
        { error: extractApiErrorMessage(data, "Impossible de charger les medias du produit") },
        { status: response.status }
      )
    }

    return NextResponse.json(normalizeMediaListResponse(data))
  } catch (error) {
    console.error("Erreur lors du chargement des medias produit:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

async function sendProtectedMediaRequest(
  productId: string,
  authToken: string,
  payload: { media_type: string; url: string }
) {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/medias/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await readJsonSafely(response)
  return { response, data }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const body = await request.json().catch(() => ({}))
    const payload = {
      media_type: "image",
      url: typeof body?.url === "string" ? body.url.trim() : "",
    }

    let { response, data } = await sendProtectedMediaRequest(id, authToken, payload)

    if (!response.ok && refreshToken && isTokenError(response.status, data)) {
      const refreshedAccessToken = await refreshAccessToken(refreshToken)

      if (refreshedAccessToken) {
        authToken = refreshedAccessToken
        const retryResult = await sendProtectedMediaRequest(id, refreshedAccessToken, payload)
        response = retryResult.response
        data = retryResult.data

        if (response.ok) {
          const nextResponse = NextResponse.json(normalizeMedia(data), { status: response.status })
          setAccessTokenCookie(nextResponse, refreshedAccessToken)
          return nextResponse
        }
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: extractApiErrorMessage(data, "Impossible d'ajouter l'image du produit"),
          details: data,
        },
        { status: response.status }
      )
    }

    const nextResponse = NextResponse.json(normalizeMedia(data), { status: response.status })

    if (refreshToken && authToken !== cookieStore.get("auth_token")?.value) {
      setAccessTokenCookie(nextResponse, authToken)
    }

    return nextResponse
  } catch (error) {
    console.error("Erreur lors de l'ajout d'un media produit:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
