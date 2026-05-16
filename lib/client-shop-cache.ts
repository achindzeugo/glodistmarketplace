import { apiClient, Shop, User } from "./api"

type CachedValue<T> = {
  expiresAt: number
  value: T
}

type UserShopState = {
  hasShop: boolean
  shopId: string | null
  upgradedUser: User | null
}

const PUBLIC_SHOPS_TTL_MS = 60_000
const USER_SHOP_TTL_MS = 60_000

let publicShopsCache: CachedValue<Shop[]> | null = null
let publicShopsPromise: Promise<Shop[]> | null = null

let userShopStateCache: CachedValue<UserShopState> | null = null
let userShopStatePromise: Promise<UserShopState> | null = null

function isFresh<T>(cache: CachedValue<T> | null) {
  return !!cache && cache.expiresAt > Date.now()
}

export async function getCachedPublicShops() {
  if (isFresh(publicShopsCache)) {
    return publicShopsCache.value
  }

  if (publicShopsPromise) {
    return publicShopsPromise
  }

  publicShopsPromise = fetch("/api/boutiques", {
    credentials: "include",
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error("Impossible de charger les boutiques.")
      }

      const data = await response.json()
      const shops = (Array.isArray(data) ? data : data.results ?? []) as Shop[]

      publicShopsCache = {
        value: shops,
        expiresAt: Date.now() + PUBLIC_SHOPS_TTL_MS,
      }

      return shops
    })
    .finally(() => {
      publicShopsPromise = null
    })

  return publicShopsPromise
}

export async function getCachedUserShopState(user: User | null) {
  if (!user) {
    return {
      hasShop: false,
      shopId: null,
      upgradedUser: null,
    }
  }

  if (isFresh(userShopStateCache)) {
    return userShopStateCache.value
  }

  if (userShopStatePromise) {
    return userShopStatePromise
  }

  userShopStatePromise = apiClient
    .getUserShop()
    .then((userShopData) => {
      const shopId = userShopData.shop?.id ? String(userShopData.shop.id) : null
      const value = {
        hasShop: !!shopId,
        shopId,
        upgradedUser: shopId ? { ...user, role: "Vendeur", vente: true } : user,
      }

      userShopStateCache = {
        value,
        expiresAt: Date.now() + USER_SHOP_TTL_MS,
      }

      return value
    })
    .catch(() => {
      const value = {
        hasShop: false,
        shopId: null,
        upgradedUser: user,
      }

      userShopStateCache = {
        value,
        expiresAt: Date.now() + 5_000,
      }

      return value
    })
    .finally(() => {
      userShopStatePromise = null
    })

  return userShopStatePromise
}

export function clearClientShopCache() {
  publicShopsCache = null
  publicShopsPromise = null
  userShopStateCache = null
  userShopStatePromise = null
}
