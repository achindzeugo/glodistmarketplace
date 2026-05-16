import { extractApiErrorMessage, getUserFriendlyErrorMessage } from "./error-utils"

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  first_name: string
  last_name: string
  phone: string
  password: string
  role: string
  account_status: string
  can_sell: boolean
}

export interface User {
  id: number
  username: string
  email: string
  nom: string
  prenom: string
  telephone: string
  role: string
  statut_compte: string
  vente: boolean
  date_creation: string
}

export interface AuthResponse {
  user: User
  message: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ChangePasswordRequest {
  old_password: string
  new_password: string
}

export interface ResetPasswordRequest {
  uid: string
  token: string
  new_password: string
}

export interface Product {
  id: number
  nom: string
  description: string
  prix: number
  stock: number
  date_produit: string
  statut_produit: string
  categorie: string
  categorie_nom: string
  boutique: string
  boutique_nom: string
  medias: Array<{
    id: number
    type: string
    url: string
  }>
}

export interface ProductMedia {
  id: number
  type: string
  url: string
}

export interface Category {
  id: number
  libelle: string
  description: string
}

export interface CategoryListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Category[]
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
  total_products: number
  verified: boolean
}

export interface UserShopResponse {
  shop: Shop | null
  shops: Shop[]
  pagination?: {
    count: number
    next: string | null
    previous: string | null
  }
}

export interface ShopStats {
  shop: {
    id: number
    name: string
    owner_name: string
  }
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

export interface ShopOrderItem {
  id: string
  name: string
  quantity: number
  total: number
}

export interface ShopOrder {
  id: string
  customer: string
  customer_email: string
  date: string
  total: number
  status: string
  items: ShopOrderItem[]
}

export interface UpdateProductRequest {
  nom?: string
  description?: string
  prix?: number
  stock?: number
  statut_produit?: string
  categorie?: number
  boutique?: number
}

export interface AddProductMediaRequest {
  url: string
}

export interface ProductQueryParams {
  category?: number | string
  ordering?: string
  page?: number | string
  search?: string
  shop?: number | string
  status?: string
}

class ApiClient {
  private async request<T>(
    input: RequestInfo | URL,
    init: RequestInit,
    fallbackMessage: string,
    unauthorizedMessage?: string
  ): Promise<T> {
    try {
      const response = await fetch(input, init)

      if (!response.ok) {
        const errorMessage = await extractApiErrorMessage(
          response,
          fallbackMessage,
          unauthorizedMessage
        )

        throw new Error(errorMessage)
      }

      if (response.status === 204) {
        return undefined as T
      }

      return response.json()
    } catch (error) {
      throw new Error(getUserFriendlyErrorMessage(error, fallbackMessage))
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>(
      "/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        credentials: "include",
      },
      "Erreur de connexion"
    )
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>(
      "/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include",
      },
      "Erreur lors de l'inscription"
    )
  }

  async logout(): Promise<void> {
    await this.request<void>(
      "/api/auth/logout",
      {
        method: "POST",
        credentials: "include",
      },
      "Erreur lors de la deconnexion"
    )
  }

  async getProducts(params?: ProductQueryParams): Promise<Product[]> {
    const searchParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value).trim() !== "") {
          searchParams.set(key, String(value))
        }
      })
    }

    const query = searchParams.toString()

    return this.request<Product[]>(
      `/api/products${query ? `?${query}` : ""}`,
      {
        method: "GET",
        credentials: "include",
      },
      "Erreur lors du chargement des produits"
    )
  }

  async getProduct(id: string): Promise<Product> {
    return this.request<Product>(
      `/api/products/${id}`,
      {
        method: "GET",
        credentials: "include",
      },
      "Produit non trouve"
    )
  }

  async getCategories(): Promise<CategoryListResponse> {
    return this.request<CategoryListResponse>(
      "/api/products/categories",
      {
        method: "GET",
        credentials: "include",
      },
      "Erreur lors du chargement des categories"
    )
  }

  async updateProduct(
    id: string,
    payload: UpdateProductRequest,
    method: "PUT" | "PATCH" = "PATCH"
  ): Promise<Product> {
    return this.request<Product>(
      `/api/products/${id}`,
      {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      },
      "Erreur lors de la mise a jour du produit"
    )
  }

  async getProductMedias(
    productId: string
  ): Promise<{ count: number; next: string | null; previous: string | null; results: ProductMedia[] }> {
    return this.request<{ count: number; next: string | null; previous: string | null; results: ProductMedia[] }>(
      `/api/products/${productId}/medias`,
      {
        method: "GET",
        credentials: "include",
      },
      "Impossible de charger les images du produit"
    )
  }

  async addProductMedia(productId: string, payload: AddProductMediaRequest): Promise<ProductMedia> {
    return this.request<ProductMedia>(
      `/api/products/${productId}/medias`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      },
      "Impossible d'ajouter l'image du produit"
    )
  }

  async deleteProduct(id: string): Promise<void> {
    await this.request<void>(
      `/api/products/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      },
      "Erreur lors de la suppression du produit"
    )
  }

  async getUserShop(): Promise<UserShopResponse> {
    return this.request<UserShopResponse>(
      "/api/user/shop",
      {
        method: "GET",
        credentials: "include",
      },
      "Erreur lors de la recuperation de la boutique",
      "Non authentifie"
    )
  }

  async getShop(id: string): Promise<Shop> {
    return this.request<Shop>(
      `/api/boutiques/${id}`,
      {
        method: "GET",
        credentials: "include",
      },
      "Boutique non trouvee"
    )
  }

  async getShopProducts(
    id: string
  ): Promise<{ shop: Shop | null; products: Product[]; total_products: number }> {
    return this.request<{ shop: Shop | null; products: Product[]; total_products: number }>(
      `/api/boutiques/${id}/products`,
      {
        method: "GET",
        credentials: "include",
      },
      "Impossible de charger les produits de la boutique"
    )
  }

  async getShopStats(id: string): Promise<ShopStats> {
    return this.request<ShopStats>(
      `/api/boutiques/${id}/stats`,
      {
        method: "GET",
        credentials: "include",
      },
      "Impossible de charger les statistiques de la boutique"
    )
  }

  async getShopOrders(
    id: string
  ): Promise<{ shop: Shop | null; orders: ShopOrder[]; total_orders: number }> {
    return this.request<{ shop: Shop | null; orders: ShopOrder[]; total_orders: number }>(
      `/api/boutiques/${id}/orders`,
      {
        method: "GET",
        credentials: "include",
      },
      "Impossible de charger les commandes de la boutique"
    )
  }

  async getUserProfile(): Promise<any> {
    return this.request<any>(
      "/api/user/profile",
      {
        method: "GET",
        credentials: "include",
      },
      "Erreur lors de la recuperation du profil",
      "Non authentifie"
    )
  }

  async updateUserProfile(profileData: any): Promise<any> {
    return this.request<any>(
      "/api/user/profile",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
        credentials: "include",
      },
      "Erreur lors de la mise a jour du profil"
    )
  }

  async getVerificationStatus(): Promise<any> {
    return this.request<any>(
      "/api/user/identity",
      {
        method: "GET",
        credentials: "include",
      },
      "Erreur lors de la recuperation du statut de verification",
      "Non authentifie"
    )
  }

  async forgotPassword(payload: ForgotPasswordRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>(
      "/api/auth/password/forgot",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
      "Erreur lors de la demande de reinitialisation"
    )
  }

  async changePassword(payload: ChangePasswordRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>(
      "/api/auth/password/change",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      },
      "Erreur lors du changement de mot de passe"
    )
  }

  async resetPassword(payload: ResetPasswordRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>(
      "/api/auth/password/reset",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
      "Erreur lors de la reinitialisation du mot de passe"
    )
  }
}

export const apiClient = new ApiClient()
