import { NextResponse } from "next/server"

const BASE_URL = "https://glodistapi.onrender.com/api/auth/boutiques/"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Forward relevant incoming headers (Authorization and cookies) to the API
    const forwardedHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    }

    const auth = request.headers.get("authorization")
    const cookie = request.headers.get("cookie")
    if (auth) forwardedHeaders["authorization"] = auth
    if (cookie) forwardedHeaders["cookie"] = cookie
    // If no Authorization header but an auth_token cookie exists, set Authorization
    if (!auth && cookie) {
      const m = cookie.match(/(?:^|;\s*)auth_token=([^;]+)/)
      if (m && m[1]) {
        try {
          const token = decodeURIComponent(m[1])
          forwardedHeaders["authorization"] = `Bearer ${token}`
        } catch (e) {
          forwardedHeaders["authorization"] = `Bearer ${m[1]}`
        }
      }
    }

    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: forwardedHeaders,
      body: JSON.stringify(body),
    })

    const text = await res.text()
    let data: any = null
    try {
      data = text ? JSON.parse(text) : null
    } catch (err) {
      data = text
    }

    if (!res.ok) {
      // Return diagnostic information to help debug 401/403/CORS from upstream
      const diagnostics = {
        proxied_status: res.status,
        proxied_url: BASE_URL,
        proxied_headers: {
          "www-authenticate": res.headers.get("www-authenticate"),
          "access-control-allow-credentials": res.headers.get("access-control-allow-credentials"),
          "access-control-allow-origin": res.headers.get("access-control-allow-origin"),
        },
        forwarded_headers: forwardedHeaders,
        proxied_body: data,
        original_body: body,
      }

      return NextResponse.json(diagnostics, { status: res.status })
    }

    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    return NextResponse.json({ detail: "Erreur proxy" }, { status: 500 })
  }
}
