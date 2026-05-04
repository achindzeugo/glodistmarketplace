"use client"

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  shop: string
  shopId?: string
}

export const CART_STORAGE_KEY = "glodist_cart"
export const CART_UPDATED_EVENT = "glodist-cart-updated"

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

export function getCartItems(): CartItem[] {
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

export function saveCartItems(items: CartItem[]) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  notifyCartUpdated(items)
}

export function addCartItem(item: Omit<CartItem, "quantity">, quantity = 1) {
  const nextQuantity = Math.max(1, quantity)
  const items = getCartItems()
  const existingItemIndex = items.findIndex((cartItem) => cartItem.id === item.id)

  if (existingItemIndex >= 0) {
    const updatedItems = [...items]
    updatedItems[existingItemIndex] = {
      ...updatedItems[existingItemIndex],
      quantity: updatedItems[existingItemIndex].quantity + nextQuantity,
    }
    saveCartItems(updatedItems)
    return updatedItems
  }

  const updatedItems = [...items, { ...item, quantity: nextQuantity }]
  saveCartItems(updatedItems)
  return updatedItems
}

export function updateCartItemQuantity(id: string, quantity: number) {
  if (quantity < 1) {
    return removeCartItem(id)
  }

  const updatedItems = getCartItems().map((item) =>
    item.id === id ? { ...item, quantity } : item
  )

  saveCartItems(updatedItems)
  return updatedItems
}

export function removeCartItem(id: string) {
  const updatedItems = getCartItems().filter((item) => item.id !== id)
  saveCartItems(updatedItems)
  return updatedItems
}

export function clearCart() {
  saveCartItems([])
}
