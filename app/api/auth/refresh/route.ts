import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { apiFetch } from "@/lib/api"

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get("refresh_token")?.value

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token manquant" }, { status: 401 })
    }

    const data = await apiFetch<{ access: string }>("/auth/token/refresh/", {
      method: "POST",
      body: JSON.stringify({ refresh: refreshToken }),
    })

    const res = NextResponse.json({ message: "Token rafraîchi" })
    res.cookies.set("access_token", data.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    })
    return res
  } catch (err: any) {
    return NextResponse.json({ error: "Session expirée" }, { status: 401 })
  }
}
