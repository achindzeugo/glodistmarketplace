import { NextRequest, NextResponse } from "next/server"
import { apiFetch, Shop } from "@/lib/api"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shop = await apiFetch<Shop>(`/shops/${params.id}/`, {
      next: { revalidate: 60 },
    })
    return NextResponse.json(shop)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status || 404 })
  }
}
