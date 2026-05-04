import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { normalizeCategory } from "@/lib/product-normalizer"
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

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`
    }

    const response = await fetch(`${API_BASE_URL}/products/categories/`, {
      method: "GET",
      headers,
      cache: "no-store",
    })

    const data = await readJsonSafely(response)

    if (!response.ok) {
      return NextResponse.json(
        {
          error: extractApiErrorMessage(data, "Erreur lors de la recuperation des categories"),
          details: data,
        },
        { status: response.status }
      )
    }

    const rawCategories = Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data)
        ? data
        : []

    return NextResponse.json({
      count: typeof data?.count === "number" ? data.count : rawCategories.length,
      next: typeof data?.next === "string" ? data.next : null,
      previous: typeof data?.previous === "string" ? data.previous : null,
      results: rawCategories.map(normalizeCategory),
    })
  } catch (error) {
    console.error("Erreur interne du serveur lors de la recuperation des categories:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
