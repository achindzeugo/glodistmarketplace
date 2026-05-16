import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { extractApiErrorMessage } from "@/lib/user-normalizer"
import { normalizeShopStats } from "@/lib/shop-normalizer"

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
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get("auth_token")?.value

    if (!authToken) {
      return NextResponse.json(
        { error: "Vous devez etre connecte pour consulter les statistiques." },
        { status: 401 }
      )
    }

    const { id } = await params
    const response = await fetch(`${API_BASE_URL}/shops/${id}/stats/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      cache: "no-store",
    })

    const data = await readJsonSafely(response)

    if (!response.ok) {
      return NextResponse.json(
        {
          error: extractApiErrorMessage(data, "Impossible de charger les statistiques de la boutique"),
        },
        { status: response.status }
      )
    }

    return NextResponse.json(normalizeShopStats(data))
  } catch (error) {
    console.error("Erreur lors du chargement des statistiques de la boutique:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
