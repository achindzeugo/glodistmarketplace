import { NextResponse } from "next/server"
import { normalizeProduct } from "@/lib/product-normalizer"
import { normalizeShop } from "@/lib/shop-normalizer"
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
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const response = await fetch(`${API_BASE_URL}/shops/${id}/products/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    const data = await readJsonSafely(response)

    if (!response.ok) {
      return NextResponse.json(
        {
          error: extractApiErrorMessage(data, "Impossible de charger les produits de la boutique"),
        },
        { status: response.status }
      )
    }

    const products = Array.isArray(data?.products) ? data.products.map(normalizeProduct) : []

    return NextResponse.json({
      shop: data?.shop ? normalizeShop(data.shop) : null,
      products,
      total_products:
        typeof data?.total_products === "number"
          ? data.total_products
          : Number(data?.total_products || products.length),
    })
  } catch (error) {
    console.error("Erreur lors du chargement des produits de la boutique:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
