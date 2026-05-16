type UnknownRecord = Record<string, unknown>

function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback
}

function readBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback
}

function readNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" ? value : fallback
}

function mapRole(role: string): string {
  switch (role.toLowerCase()) {
    case "seller":
    case "vendeur":
      return "Vendeur"
    case "admin":
      return "Admin"
    case "client":
    default:
      return "Client"
  }
}

function mapAccountStatus(status: string): string {
  switch (status.toLowerCase()) {
    case "active":
    case "actif":
      return "Actif"
    case "pending":
    case "en_attente":
      return "En attente"
    case "suspended":
    case "suspendu":
      return "Suspendu"
    case "inactive":
    case "inactif":
      return "Inactif"
    default:
      return status || "Inactif"
  }
}

export function normalizeUser(rawUser: unknown) {
  const user = (rawUser || {}) as UnknownRecord

  return {
    id: readNumber(user.id),
    username: readString(user.username),
    email: readString(user.email),
    nom: readString(user.last_name) || readString(user.nom),
    prenom: readString(user.first_name) || readString(user.prenom),
    telephone: readString(user.phone) || readString(user.telephone),
    role: mapRole(readString(user.role)),
    statut_compte: mapAccountStatus(
      readString(user.account_status) || readString(user.statut_compte)
    ),
    vente: readBoolean(user.can_sell, readBoolean(user.vente)),
    date_creation: readString(user.created_at) || readString(user.date_creation),
  }
}

export function extractApiErrorMessage(errorData: unknown, fallback: string): string {
  if (!errorData || typeof errorData !== "object") {
    return fallback
  }

  const record = errorData as UnknownRecord

  if (typeof record.detail === "string") {
    return record.detail
  }

  if (typeof record.message === "string") {
    return record.message
  }

  if (Array.isArray(record.non_field_errors) && record.non_field_errors.length > 0) {
    return String(record.non_field_errors[0])
  }

  const messages = Object.values(record)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((value) => typeof value === "string")
    .map((value) => String(value))

  return messages[0] || fallback
}
