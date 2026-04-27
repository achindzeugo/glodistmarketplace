import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  if (!token) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("document") as File
  const docType = formData.get("document_type") as string

  if (!file || !docType) {
    return NextResponse.json({ error: "Fichier et type de document requis" }, { status: 400 })
  }

  const allowed = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Format non supporté (JPG, PNG, PDF)" }, { status: 400 })
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Fichier trop volumineux (max 5MB)" }, { status: 400 })
  }

  const apiForm = new FormData()
  apiForm.append("document", file)
  apiForm.append("document_type", docType)

  const res = await fetch(`${API_BASE}/auth/identity/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: apiForm,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return NextResponse.json({ error: err.detail || "Erreur lors de l'envoi" }, { status: res.status })
  }

  return NextResponse.json({ message: "Document envoyé avec succès" })
}
