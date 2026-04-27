import { NextRequest, NextResponse } from "next/server"
import { apiFetch, Product } from "@/lib/api"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await apiFetch<Product>(`/products/${params.id}/`, {
      next: { revalidate: 60 },
    })
    return NextResponse.json(product)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status || 404 })
  }
}
