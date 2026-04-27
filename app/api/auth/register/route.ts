import { NextRequest, NextResponse } from "next/server"
import { apiFetch, User } from "@/lib/api"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const user = await apiFetch<User>("/auth/register/", {
      method: "POST",
      body: JSON.stringify(body),
    })
    return NextResponse.json({ user, message: "Compte créé avec succès" }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erreur lors de l'inscription" },
      { status: err.status || 400 }
    )
  }
}
