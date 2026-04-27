import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { apiFetch, User } from "@/lib/api"

async function getToken() {
  const cookieStore = await cookies()
  return cookieStore.get("access_token")?.value
}

export async function GET() {
  const token = await getToken()
  if (!token) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  try {
    const user = await apiFetch<User>("/auth/profile/", { token })
    return NextResponse.json(user)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status || 500 })
  }
}

export async function PUT(req: NextRequest) {
  const token = await getToken()
  if (!token) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  try {
    const body = await req.json()
    const user = await apiFetch<User>("/auth/profile/", {
      method: "PUT",
      body: JSON.stringify(body),
      token,
    })

    const res = NextResponse.json(user)
    // Mettre à jour le cookie user_data
    res.cookies.set("user_data", encodeURIComponent(JSON.stringify(user)), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
    return res
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status || 500 })
  }
}
