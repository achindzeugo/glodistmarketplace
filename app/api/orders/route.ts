import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { apiFetch, Order, PaginatedResponse } from "@/lib/api"

async function getToken() {
  const cookieStore = await cookies()
  return cookieStore.get("access_token")?.value
}

export async function GET(req: NextRequest) {
  const token = await getToken()
  if (!token) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const qs = searchParams.toString()
    const data = await apiFetch<PaginatedResponse<Order>>(
      `/orders/${qs ? `?${qs}` : ""}`,
      { token }
    )
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status || 500 })
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken()
  if (!token) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  try {
    const body = await req.json()
    const order = await apiFetch<Order>("/orders/", {
      method: "POST",
      body: JSON.stringify(body),
      token,
    })
    return NextResponse.json(order, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status || 500 })
  }
}
