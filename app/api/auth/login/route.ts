import { NextRequest, NextResponse } from "next/server"
import { apiFetch, User } from "@/lib/api"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = await apiFetch<{ access: string; refresh: string; user: User }>(
      "/auth/login/",
      { method: "POST", body: JSON.stringify(body) }
    )

    const res = NextResponse.json({ user: data.user, message: "Connexion réussie" })

    const isProd = process.env.NODE_ENV === "production"

    // Token d'accès — HTTP-only, inaccessible au JS
    res.cookies.set("access_token", data.access, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1h
    })

    // Refresh token — HTTP-only
    res.cookies.set("refresh_token", data.refresh, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7j
    })

    // Données utilisateur lisibles côté client (pas de données sensibles)
    res.cookies.set("user_data", encodeURIComponent(JSON.stringify(data.user)), {
      httpOnly: false,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return res
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Identifiants invalides" },
      { status: err.status || 400 }
    )
  }
}
