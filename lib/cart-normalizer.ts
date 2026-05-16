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

function readNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null
}

export type NormalizedCartItem = {
  id: number
  product: number
  product_name: string
  product_price: number
  quantity: number
}

export type NormalizedCart = {
  id: number
  code: string
  items: NormalizedCartItem[]
  total: number
  created_at: string
}

export function normalizeCartItem(rawItem: unknown): NormalizedCartItem {
  const item = (rawItem || {}) as UnknownRecord

  return {
    id: readNumber(item.id),
    product: readNumber(item.product),
    product_name: readString(item.product_name),
    product_price: readNumber(item.product_price),
    quantity: readNumber(item.quantity, 1),
  }
}

export function normalizeCart(rawCart: unknown): NormalizedCart {
  const cart = (rawCart || {}) as UnknownRecord
  const rawItems = Array.isArray(cart.items) ? cart.items : []

  return {
    id: readNumber(cart.id),
    code: readString(cart.code),
    items: rawItems.map(normalizeCartItem),
    total: readNumber(cart.total),
    created_at: readString(cart.created_at),
  }
}

export function normalizeCartListResponse(rawPayload: unknown) {
  const payload = (rawPayload || {}) as UnknownRecord
  const rawResults = Array.isArray(payload.results)
    ? payload.results
    : Array.isArray(rawPayload)
      ? rawPayload
      : []

  return {
    count: readNumber(payload.count, rawResults.length),
    next: readNullableString(payload.next),
    previous: readNullableString(payload.previous),
    results: rawResults.map(normalizeCart),
  }
}
