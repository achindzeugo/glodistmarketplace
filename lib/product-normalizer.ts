type UnknownRecord = Record<string, unknown>

function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback
}

function readNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  return fallback
}

function normalizeStatus(status: string): string {
  switch (status.toLowerCase()) {
    case "active":
    case "actif":
      return "actif"
    case "inactive":
    case "inactif":
      return "inactif"
    case "out_of_stock":
    case "rupture":
      return "rupture"
    default:
      return status || "actif"
  }
}

function normalizeStatusToApi(status: string): string {
  switch (status.toLowerCase()) {
    case "actif":
    case "active":
      return "active"
    case "inactif":
    case "inactive":
      return "inactive"
    case "rupture":
    case "out_of_stock":
      return "out_of_stock"
    default:
      return status || "active"
  }
}

export function normalizeMedia(rawMedia: unknown) {
  const media = (rawMedia || {}) as UnknownRecord

  return {
    id: readNumber(media.id),
    type: readString(media.type) || readString(media.media_type) || "image",
    url: readString(media.url),
  }
}

export function normalizeMediaListResponse(rawPayload: unknown) {
  const payload = (rawPayload || {}) as UnknownRecord
  const rawResults = Array.isArray(payload.results)
    ? payload.results
    : Array.isArray(rawPayload)
      ? rawPayload
      : []

  return {
    count: readNumber(payload.count, rawResults.length),
    next: typeof payload.next === "string" ? payload.next : null,
    previous: typeof payload.previous === "string" ? payload.previous : null,
    results: rawResults.map(normalizeMedia),
  }
}

export function normalizeProduct(rawProduct: unknown) {
  const product = (rawProduct || {}) as UnknownRecord

  return {
    id: readNumber(product.id),
    nom: readString(product.name) || readString(product.nom),
    description: readString(product.description),
    prix: readNumber(product.price ?? product.prix),
    stock: readNumber(product.stock),
    date_produit: readString(product.created_at) || readString(product.date_produit),
    statut_produit: normalizeStatus(
      readString(product.status) || readString(product.statut_produit)
    ),
    categorie: String(product.category ?? product.categorie ?? ""),
    categorie_nom: readString(product.category_label) || readString(product.categorie_nom),
    boutique: String(product.shop ?? product.boutique ?? ""),
    boutique_nom: readString(product.shop_name) || readString(product.boutique_nom),
    medias: Array.isArray(product.medias) ? product.medias.map(normalizeMedia) : [],
  }
}

export function normalizeProductPayload(rawPayload: unknown) {
  const payload = (rawPayload || {}) as UnknownRecord

  return {
    name: readString(payload.name) || readString(payload.nom),
    description: readString(payload.description),
    price: String(payload.price ?? payload.prix ?? ""),
    stock: readNumber(payload.stock),
    status: normalizeStatusToApi(
      readString(payload.status) || readString(payload.statut_produit) || "active"
    ),
    category: readNumber(payload.category ?? payload.categorie),
    shop: readNumber(payload.shop ?? payload.boutique),
  }
}

export function normalizePartialProductPayload(rawPayload: unknown) {
  const payload = (rawPayload || {}) as UnknownRecord
  const normalized: Record<string, unknown> = {}

  if ("name" in payload || "nom" in payload) {
    normalized.name = readString(payload.name) || readString(payload.nom)
  }

  if ("description" in payload) {
    normalized.description = readString(payload.description)
  }

  if ("price" in payload || "prix" in payload) {
    normalized.price = String(payload.price ?? payload.prix ?? "")
  }

  if ("stock" in payload) {
    normalized.stock = readNumber(payload.stock)
  }

  if ("status" in payload || "statut_produit" in payload) {
    normalized.status = normalizeStatusToApi(
      readString(payload.status) || readString(payload.statut_produit) || "active"
    )
  }

  if ("category" in payload || "categorie" in payload) {
    normalized.category = readNumber(payload.category ?? payload.categorie)
  }

  if ("shop" in payload || "boutique" in payload) {
    normalized.shop = readNumber(payload.shop ?? payload.boutique)
  }

  return normalized
}

export function normalizeCategory(rawCategory: unknown) {
  const category = (rawCategory || {}) as UnknownRecord

  return {
    id: readNumber(category.id),
    libelle: readString(category.label) || readString(category.libelle),
    description: readString(category.description),
  }
}
