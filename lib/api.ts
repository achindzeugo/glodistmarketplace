export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  nom: string
  prenom: string
  telephone: string
  password: string
  role: string
  statut_compte: string
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

  async getUserShop(): Promise<any> {
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
}

export const apiClient = new ApiClient()