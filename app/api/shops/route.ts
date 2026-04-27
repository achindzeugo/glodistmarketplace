import { NextRequest, NextResponse } from "next/server"
import { apiFetch, PaginatedResponse, Shop } from "@/lib/api"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const qs = searchParams.toString()
    const data = await apiFetch<PaginatedResponse<Shop>>(
      `/shops/${qs ? `?${qs}` : ""}`,
      { next: { revalidate: 60 } }
    )
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status || 500 })
  }
}
