import { User } from "./api"

// Lecture du cookie user_data côté client (non HTTP-only, juste les infos publiques)
export function getClientUser(): User | null {
  if (typeof window === "undefined") return null
  try {
    const match = document.cookie.match(/(?:^|;\s*)user_data=([^;]*)/)
    if (!match) return null
    return JSON.parse(decodeURIComponent(match[1]))
  } catch {
    return null
  }
}

export function isClientAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return document.cookie.includes("user_data=")
}

export async function clientLogout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
  // Nettoyer le cookie client-side
  document.cookie = "user_data=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"
}
