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

export type NormalizedShop = {
  id: number
  name: string
  description: string
  validation_status: string
  created_at: string
  validated_at: string | null
  owner: number
  owner_name: string
  total_products: number
  verified: boolean
}

export function normalizeShop(rawShop: unknown): NormalizedShop {
  const shop = (rawShop || {}) as UnknownRecord
  const validationStatus = readString(shop.validation_status, "validated")

  return {
    id: readNumber(shop.id),
    name: readString(shop.name) || readString(shop.nom) || "Boutique",
    description: readString(shop.description),
    validation_status: validationStatus,
    created_at: readString(shop.created_at),
    validated_at: readNullableString(shop.validated_at),
    owner: readNumber(shop.owner),
    owner_name: readString(shop.owner_name),
    total_products: readNumber(shop.total_products),
    verified: validationStatus ? validationStatus === "validated" : true,
  }
}

export function normalizeShopListResponse(rawData: unknown) {
  const data = (rawData || {}) as UnknownRecord
  const rawResults = Array.isArray(data.results)
    ? data.results
    : Array.isArray(rawData)
      ? rawData
      : []

  return {
    count: readNumber(data.count, rawResults.length),
    next: readNullableString(data.next),
    previous: readNullableString(data.previous),
    results: rawResults.map(normalizeShop),
  }
}

export type NormalizedShopStats = {
  shop: Pick<NormalizedShop, "id" | "name" | "owner_name">
  products: {
    total: number
    active: number
    total_stock: number
    avg_price: number
  }
  sales: {
    total_quantity: number
    total_revenue: number
    total_orders: number
  }
}

export type NormalizedShopOrderItem = {
  id: string
  name: string
  quantity: number
  total: number
}

export type NormalizedShopOrder = {
  id: string
  customer: string
  customer_email: string
  date: string
  total: number
  status: string
  items: NormalizedShopOrderItem[]
}

function normalizeOrderItem(rawItem: unknown, index: number): NormalizedShopOrderItem {
  if (typeof rawItem === "string") {
    return {
      id: `item-${index}`,
      name: rawItem,
      quantity: 1,
      total: 0,
    }
  }

  const item = (rawItem || {}) as UnknownRecord

  return {
    id: String(item.id ?? item.product_id ?? `item-${index}`),
    name: readString(item.name) || readString(item.product_name) || readString(item.title) || "Produit",
    quantity: readNumber(item.quantity, 1),
    total: readNumber(item.total ?? item.subtotal ?? item.price),
  }
}

export function normalizeShopStats(rawStats: unknown): NormalizedShopStats {
  const stats = (rawStats || {}) as UnknownRecord
  const shop = (stats.shop || {}) as UnknownRecord
  const products = (stats.products || {}) as UnknownRecord
  const sales = (stats.sales || {}) as UnknownRecord

  return {
    shop: {
      id: readNumber(shop.id),
      name: readString(shop.name),
      owner_name: readString(shop.owner_name),
    },
    products: {
      total: readNumber(products.total),
      active: readNumber(products.active),
      total_stock: readNumber(products.total_stock),
      avg_price: readNumber(products.avg_price),
    },
    sales: {
      total_quantity: readNumber(sales.total_quantity),
      total_revenue: readNumber(sales.total_revenue),
      total_orders: readNumber(sales.total_orders),
    },
  }
}

export function normalizeShopOrdersResponse(rawOrders: unknown) {
  const data = (rawOrders || {}) as UnknownRecord
  const rawOrderList = Array.isArray(data.orders) ? data.orders : []

  const orders = rawOrderList.map((rawOrder, index) => {
    if (typeof rawOrder === "string") {
      return {
        id: `order-${index + 1}`,
        customer: "Client",
        customer_email: "",
        date: "",
        total: 0,
        status: rawOrder,
        items: [],
      }
    }

    const order = (rawOrder || {}) as UnknownRecord
    const customerRecord =
      order.customer && typeof order.customer === "object"
        ? (order.customer as UnknownRecord)
        : null

    const itemList = Array.isArray(order.items)
      ? order.items
      : Array.isArray(order.order_items)
        ? order.order_items
        : Array.isArray(order.products)
          ? order.products
          : []

    return {
      id: String(order.id ?? order.order_number ?? order.reference ?? `order-${index + 1}`),
      customer:
        readString(order.customer_name) ||
        readString(customerRecord?.name) ||
        readString(customerRecord?.full_name) ||
        readString(customerRecord?.username) ||
        "Client",
      customer_email:
        readString(order.customer_email) ||
        readString(customerRecord?.email),
      date: readString(order.created_at) || readString(order.date),
      total: readNumber(order.total_amount ?? order.total ?? order.amount),
      status: readString(order.status) || readString(order.status_label) || "En attente",
      items: itemList.map((item, itemIndex) => normalizeOrderItem(item, itemIndex)),
    }
  })

  return {
    shop: data.shop ? normalizeShop(data.shop) : null,
    orders,
    total_orders: readNumber(data.total_orders, orders.length),
  }
}
