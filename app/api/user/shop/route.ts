import { NextResponse } from "next/server"
import { cookies } from "next/headers"
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
    const authToken = cookieStore.get("auth_token")?.value

    if (!authToken) {
      return NextResponse.json(
        { error: "Token d'authentification manquant" },
        { status: 401 }
      )
    }

    const response = await fetch(`${API_BASE_URL}/auth/shops/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      cache: "no-store",
    })

    const data = await readJsonSafely(response)

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ shop: null, shops: [] })
      }

      return NextResponse.json(
        {
          error: extractApiErrorMessage(data, "Erreur lors de la recuperation de la boutique"),
        },
        { status: response.status }
      )
    }

    const normalized = normalizeShopListResponse(data)

    return NextResponse.json({
      shop: normalized.results[0] ?? null,
      shops: normalized.results,
      pagination: {
        count: normalized.count,
        next: normalized.next,
        previous: normalized.previous,
      },
    })
  } catch (error) {
    console.error("Erreur lors de la recuperation de la boutique:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
