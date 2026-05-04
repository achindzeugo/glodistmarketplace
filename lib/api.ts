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

// Client API unifié qui utilise uniquement les routes Next.js
class ApiClient {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials),
      credentials: 'include'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erreur de connexion')
    }

    return response.json()
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData),
      credentials: 'include'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erreur lors de l\'inscription')
    }

    return response.json()
  }

  async logout(): Promise<void> {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la déconnexion')
    }
  }

  async getProducts(): Promise<Product[]> {
    const response = await fetch('/api/products', {
      method: 'GET',
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error('Erreur lors du chargement des produits')
    }

    return response.json()
  }

  async getProduct(id: string): Promise<Product> {
    const response = await fetch(`/api/products/${id}`, {
      method: 'GET',
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error('Produit non trouvé')
    }

    return response.json()
  }

  async getCategories(): Promise<CategoryListResponse> {
    const response = await fetch('/api/products/categories', {
      method: 'GET',
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error('Erreur lors du chargement des categories')
    }

    return response.json()
  }

  async updateProduct(id: string, payload: UpdateProductRequest, method: 'PUT' | 'PATCH' = 'PATCH'): Promise<Product> {
    const response = await fetch(`/api/products/${id}`, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      credentials: 'include'
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || 'Erreur lors de la mise a jour du produit')
    }

    return response.json()
  }

  async deleteProduct(id: string): Promise<void> {
    const response = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || 'Erreur lors de la suppression du produit')
    }
  }

  async getUserShop(): Promise<UserShopResponse> {
    const response = await fetch('/api/user/shop', {
      method: 'GET',
      credentials: 'include'
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Non authentifié')
      }
      throw new Error('Erreur lors de la récupération de la boutique')
    }

    return response.json()
  }

  async getShop(id: string): Promise<Shop> {
    const response = await fetch(`/api/boutiques/${id}`, {
      method: 'GET',
      credentials: 'include'
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || 'Boutique non trouvee')
    }

    return response.json()
  }

  async getShopProducts(id: string): Promise<{ shop: Shop | null; products: Product[]; total_products: number }> {
    const response = await fetch(`/api/boutiques/${id}/products`, {
      method: 'GET',
      credentials: 'include'
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || 'Impossible de charger les produits de la boutique')
    }

    return response.json()
  }

  async getShopStats(id: string): Promise<ShopStats> {
    const response = await fetch(`/api/boutiques/${id}/stats`, {
      method: 'GET',
      credentials: 'include'
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || 'Impossible de charger les statistiques de la boutique')
    }

    return response.json()
  }

  async getShopOrders(id: string): Promise<{ shop: Shop | null; orders: ShopOrder[]; total_orders: number }> {
    const response = await fetch(`/api/boutiques/${id}/orders`, {
      method: 'GET',
      credentials: 'include'
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || 'Impossible de charger les commandes de la boutique')
    }

    return response.json()
  }

  async getUserProfile(): Promise<any> {
    const response = await fetch('/api/user/profile', {
      method: 'GET',
      credentials: 'include'
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Non authentifié')
      }
      throw new Error('Erreur lors de la récupération du profil')
    }

    return response.json()
  }

  async updateUserProfile(profileData: any): Promise<any> {
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData),
      credentials: 'include'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erreur lors de la mise à jour du profil')
    }

    return response.json()
  }

  async getVerificationStatus(): Promise<any> {
    const response = await fetch('/api/user/identity', {
      method: 'GET',
      credentials: 'include'
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Non authentifié')
      }
      throw new Error('Erreur lors de la récupération du statut de vérification')
    }

    return response.json()
  }

  async forgotPassword(payload: ForgotPasswordRequest): Promise<{ message: string }> {
    const response = await fetch('/api/auth/password/forgot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erreur lors de la demande de réinitialisation')
    }

    return response.json()
  }

  async changePassword(payload: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await fetch('/api/auth/password/change', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      credentials: 'include'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erreur lors du changement de mot de passe')
    }

    return response.json()
  }

  async resetPassword(payload: ResetPasswordRequest): Promise<{ message: string }> {
    const response = await fetch('/api/auth/password/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erreur lors de la réinitialisation du mot de passe')
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()
