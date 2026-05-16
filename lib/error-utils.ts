const OFFLINE_MESSAGE = "Veuillez verifier votre connexion internet."
const RECONNECT_MESSAGE = "Connexion internet indisponible. Veuillez vous reconnecter a internet."
const SESSION_EXPIRED_MESSAGE = "Votre session a expire. Veuillez vous reconnecter."

function findFirstReadableMessage(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value.trim()
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message = findFirstReadableMessage(item)
      if (message) {
        return message
      }
    }

    return null
  }

  if (value && typeof value === "object") {
    for (const nestedValue of Object.values(value)) {
      const message = findFirstReadableMessage(nestedValue)
      if (message) {
        return message
      }
    }
  }

  return null
}

export function isNetworkConnectivityIssue(error: unknown): boolean {
  if (typeof window !== "undefined" && "navigator" in window && !window.navigator.onLine) {
    return true
  }

  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : ""

  const normalizedMessage = message.toLowerCase()

  return (
    error instanceof TypeError ||
    normalizedMessage.includes("failed to fetch") ||
    normalizedMessage.includes("networkerror") ||
    normalizedMessage.includes("fetch failed") ||
    normalizedMessage.includes("load failed") ||
    normalizedMessage.includes("network request failed")
  )
}

export function isAuthenticationIssue(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : ""

  const normalizedMessage = message.toLowerCase()

  return (
    normalizedMessage.includes("token") ||
    normalizedMessage.includes("jwt") ||
    normalizedMessage.includes("not valid") ||
    normalizedMessage.includes("non authentifie") ||
    normalizedMessage.includes("non authentifié") ||
    normalizedMessage.includes("authentication credentials") ||
    normalizedMessage.includes("session expire") ||
    normalizedMessage.includes("session expir")
  )
}

export function getUserFriendlyErrorMessage(
  error: unknown,
  fallback = "Une erreur est survenue."
): string {
  if (isNetworkConnectivityIssue(error)) {
    if (typeof window !== "undefined" && "navigator" in window && !window.navigator.onLine) {
      return OFFLINE_MESSAGE
    }

    return RECONNECT_MESSAGE
  }

  if (isAuthenticationIssue(error)) {
    return SESSION_EXPIRED_MESSAGE
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  if (typeof error === "string" && error.trim()) {
    return error.trim()
  }

  return fallback
}

export async function extractApiErrorMessage(
  response: Response,
  fallback: string,
  unauthorizedMessage?: string
): Promise<string> {
  if (response.status === 401 && unauthorizedMessage) {
    return unauthorizedMessage
  }

  try {
    const data = await response.json()

    const directMessage =
      findFirstReadableMessage(data?.error) ||
      findFirstReadableMessage(data?.detail) ||
      findFirstReadableMessage(data?.message) ||
      findFirstReadableMessage(data?.details) ||
      findFirstReadableMessage(data)

    return directMessage || fallback
  } catch {
    return fallback
  }
}
