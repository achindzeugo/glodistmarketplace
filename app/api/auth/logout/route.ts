import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { apiFetch } from "@/lib/api"

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get("refresh_token")?.value

  // Invalider le refresh token côté API si disponible
  if (refreshToken) {
    await apiFetch("/auth/logout/", {
      method: "POST",
      body: JSON.stringify({ refresh: refreshToken }),
    }).catch(() => {}) // silencieux si déjà expiré
  }

  const res = NextResponse.json({ message: "Déconnexion réussie" })
  res.cookies.delete("access_token")
  res.cookies.delete("refresh_token")
  res.cookies.delete("user_data")
  return res
}
