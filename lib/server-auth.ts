import { NextResponse } from "next/server"

const API_BASE_URL = "https://glodistapi.onrender.com/api/v1"

export async function refreshAccessToken(refreshToken: string) {
  const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh: refreshToken }),
  })

  if (!response.ok) {
    return null
  }

  const data = await response.json().catch(() => null)
  const accessToken =
    data?.access ||
    data?.access_token ||
    null

  return typeof accessToken === "string" && accessToken.length > 0
    ? accessToken
    : null
}

export function setAccessTokenCookie(response: NextResponse, accessToken: string) {
  response.cookies.set("auth_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  })
}

export function isTokenError(status: number, errorData: unknown) {
  if (status !== 401 || !errorData || typeof errorData !== "object") {
    return false
  }

  const details = JSON.stringify(errorData).toLowerCase()

  return (
    details.includes("token") ||
    details.includes("jwt") ||
    details.includes("not valid")
  )
}
