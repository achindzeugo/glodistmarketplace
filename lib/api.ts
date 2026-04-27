const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  phone: string
  role: string
  account_status: string
  can_sell: boolean
  created_at: string
}

export interface Product {
  id: number
  name: string
  description: string
  price: string
  stock: number
  created_at: string
  updated_at: string
  status: string
  category: number
  category_label: string
  shop: number
  shop_name: string
  medias: Array<{ id: number; media_type: string; url: string }>
}

export interface Shop {
  id: number
  name: string
  description: string
  validation_status: string
  created_at: string
  validated_at: string | null
  owner: number
  owner_name: string
  total_products?: number
}

export interface CartItem {
  id: number
  product: number
  product_name: string
  product_price: string
  quantity: number
}

export interface Cart {
  id: number
  code: string
  created_at: string
  items: CartItem[]
  total: string
}

export interface Order {
  id: number
  created_at: string
  updated_at: string
  status: string
  total_price: string
  note: string
  user: number
  user_name: string
  items: any[]
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// Fetch avec token — utilisé côté serveur (API routes Next.js)
export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...fetchOptions } = options
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw { status: res.status, message: err?.detail || err?.message || "Erreur API" }
  }

  // 204 No Content
  if (res.status === 204) return {} as T
  return res.json()
}
