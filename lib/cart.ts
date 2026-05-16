"use client"

import { apiClient, Product } from "./api"
import { AuthManager } from "./auth"

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  shop: string
  shopId?: string
  remoteItemId?: string
}

type RemoteCartItem = {
  id: number
  product: number
  product_name: string
  product_price: number
  quantity: number
}

type RemoteCart = {
  id: number
  code: string
  items: RemoteCartItem[]
  total: number
  created_at: string
}

type RemoteCartListResponse = {
  count: number
  next: string | null
  previous: string | null
  results: RemoteCart[]
}

export const CART_STORAGE_KEY = "glodist_cart"
export const CART_UPDATED_EVENT = "glodist-cart-updated"
const CART_REMOTE_ID_STORAGE_KEY = "glodist_remote_cart_id"

let cartSyncPromise: Promise<CartItem[]> | null = null

function canUseStorage() {
  return typeof window !== "undefined"
}

function notifyCartUpdated(items: CartItem[]) {
  if (!canUseStorage()) {
    return
  }

  window.dispatchEvent(
    new CustomEvent(CART_UPDATED_EVENT, {
      detail: items,
    })
  )
}

function getStoredCartItems(): CartItem[] {
  if (!canUseStorage()) {
    return []
  }

  const rawItems = window.localStorage.getItem(CART_STORAGE_KEY)

  if (!rawItems) {
    return []
  }

  try {
    const parsed = JSON.parse(rawItems)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveStoredCartItems(items: CartItem[]) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  notifyCartUpdated(items)
}

function getActiveRemoteCartId() {
  if (!canUseStorage()) {
    return null
  }

  return window.localStorage.getItem(CART_REMOTE_ID_STORAGE_KEY)
}

function setActiveRemoteCartId(id: string | null) {
  if (!canUseStorage()) {
    return
  }

  if (!id) {
    window.localStorage.removeItem(CART_REMOTE_ID_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(CART_REMOTE_ID_STORAGE_KEY, id)
}

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    credentials: "include",
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    const message =
      typeof error?.error === "string"
        ? error.error
        : "Une erreur est survenue lors de la gestion du panier."

    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

function sortRemoteCarts(carts: RemoteCart[]) {
  return [...carts].sort((left, right) => {
    const leftDate = new Date(left.created_at).getTime()
    const rightDate = new Date(right.created_at).getTime()

    if (leftDate !== rightDate) {
      return rightDate - leftDate
    }

    return right.id - left.id
  })
}

async function fetchRemoteCarts() {
  const data = await requestJson<RemoteCartListResponse>("/api/carts")
  return Array.isArray(data?.results) ? data.results : []
}

async function fetchRemoteCartById(id: string) {
  return requestJson<RemoteCart>(`/api/carts/${id}`)
}

async function createRemoteCart() {
  const code = `GLD-${Date.now()}`
  const cart = await requestJson<RemoteCart>("/api/carts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  })

  setActiveRemoteCartId(String(cart.id))
  return cart
}

async function deleteRemoteCart(id: string) {
  await requestJson<void>(`/api/carts/${id}`, {
    method: "DELETE",
  })
}

async function addRemoteCartItem(cartId: string, productId: string, quantity: number) {
  return requestJson<RemoteCartItem>(`/api/carts/${cartId}/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product: Number(productId),
      quantity,
    }),
  })
}

async function getOrCreateRemoteCart(createIfMissing: boolean) {
  if (!AuthManager.isAuthenticated()) {
    return null
  }

  const storedCartId = getActiveRemoteCartId()

  if (storedCartId) {
    try {
      const cart = await fetchRemoteCartById(storedCartId)
      setActiveRemoteCartId(String(cart.id))
      return cart
    } catch {
      setActiveRemoteCartId(null)
    }
  }

  const carts = await fetchRemoteCarts()
  const [latestCart] = sortRemoteCarts(carts)

  if (latestCart) {
    setActiveRemoteCartId(String(latestCart.id))
    return latestCart
  }

  if (!createIfMissing) {
    return null
  }

  return createRemoteCart()
}

async function enrichProduct(productId: string) {
  try {
    return await apiClient.getProduct(productId)
  } catch {
    return null
  }
}

async function hydrateRemoteCartItems(cart: RemoteCart) {
  const uniqueProductIds = Array.from(
    new Set(cart.items.map((item) => String(item.product)).filter(Boolean))
  )

  const productEntries = await Promise.all(
    uniqueProductIds.map(async (productId) => {
      const product = await enrichProduct(productId)
      return [productId, product] as const
    })
  )

  const productMap = new Map<string, Product | null>(productEntries)

  return cart.items.map((item) => {
    const product = productMap.get(String(item.product))

    return {
      id: String(item.product),
      name: item.product_name || product?.nom || "Produit",
      price: Number(item.product_price) || product?.prix || 0,
      image: product?.medias?.[0]?.url || "/placeholder.svg",
      quantity: Math.max(1, item.quantity),
      shop: product?.boutique_nom || "",
      shopId: product?.boutique,
      remoteItemId: String(item.id),
    }
  })
}

async function replaceRemoteCartItems(items: CartItem[]) {
  if (!AuthManager.isAuthenticated()) {
    saveStoredCartItems(items)
    return items
  }

  const existingCart = await getOrCreateRemoteCart(items.length > 0)

  if (existingCart) {
    await deleteRemoteCart(String(existingCart.id))
    setActiveRemoteCartId(null)
  }

  if (items.length === 0) {
    saveStoredCartItems([])
    return []
  }

  const nextCart = await createRemoteCart()

  for (const item of items) {
    await addRemoteCartItem(String(nextCart.id), item.id, item.quantity)
  }

  return syncCartFromServer()
}

export async function syncCartFromServer() {
  if (!AuthManager.isAuthenticated()) {
    const storedItems = getStoredCartItems()
    notifyCartUpdated(storedItems)
    return storedItems
  }

  if (cartSyncPromise) {
    return cartSyncPromise
  }

  cartSyncPromise = (async () => {
    const cart = await getOrCreateRemoteCart(false)
    const items = cart ? await hydrateRemoteCartItems(cart) : []
    saveStoredCartItems(items)
    return items
  })().finally(() => {
    cartSyncPromise = null
  })

  return cartSyncPromise
}

export async function getCartItems() {
  if (!AuthManager.isAuthenticated()) {
    return getStoredCartItems()
  }

  return syncCartFromServer()
}

export function getCartItemsCount(items = getStoredCartItems()) {
  return items.reduce((total, item) => total + Math.max(0, item.quantity || 0), 0)
}

export async function addCartItem(item: Omit<CartItem, "quantity">, quantity = 1) {
  const nextQuantity = Math.max(1, quantity)

  if (!AuthManager.isAuthenticated()) {
    const items = getStoredCartItems()
    const existingItemIndex = items.findIndex((cartItem) => cartItem.id === item.id)

    if (existingItemIndex >= 0) {
      const updatedItems = [...items]
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + nextQuantity,
      }
      saveStoredCartItems(updatedItems)
      return updatedItems
    }

    const updatedItems = [...items, { ...item, quantity: nextQuantity }]
    saveStoredCartItems(updatedItems)
    return updatedItems
  }

  const cart = await getOrCreateRemoteCart(true)

  if (!cart) {
    throw new Error("Impossible de creer un panier pour cet utilisateur.")
  }

  await addRemoteCartItem(String(cart.id), item.id, nextQuantity)
  return syncCartFromServer()
}

export async function updateCartItemQuantity(id: string, quantity: number) {
  if (quantity < 1) {
    return removeCartItem(id)
  }

  const items = await getCartItems()
  const updatedItems = items.map((item) =>
    item.id === id ? { ...item, quantity } : item
  )

  return replaceRemoteCartItems(updatedItems)
}

export async function removeCartItem(id: string) {
  const items = await getCartItems()
  const updatedItems = items.filter((item) => item.id !== id)
  return replaceRemoteCartItems(updatedItems)
}

export async function clearCart() {
  return replaceRemoteCartItems([])
}
