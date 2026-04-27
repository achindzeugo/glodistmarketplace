import { NextRequest, NextResponse } from "next/server"
import { apiFetch, PaginatedResponse, Product } from "@/lib/api"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const params = new URLSearchParams()

    for (const [key, value] of searchParams.entries()) {
      params.set(key, value)
    }

    const qs = params.toString()
    const data = await apiFetch<PaginatedResponse<Product>>(
      `/products/${qs ? `?${qs}` : ""}`,
      { next: { revalidate: 60 } } // cache 60s
    )
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status || 500 })
  }
}
