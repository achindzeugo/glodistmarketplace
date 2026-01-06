import { User } from './api'

export type { User } from './api'

export class AuthManager {
  static getUser(): User | null {
    if (typeof window !== 'undefined') {
      // Lire le cookie user_data côté client
      const cookies = document.cookie.split(';')
      const userDataCookie = cookies.find(cookie => 
        cookie.trim().startsWith('user_data=')
      )
      
      if (userDataCookie) {
        try {
          const userData = decodeURIComponent(userDataCookie.split('=')[1])
          return JSON.parse(userData)
        } catch (error) {
          console.error('Erreur lors de la lecture des données utilisateur:', error)
          return null
        }
      }
    }
    return null
  }

  static isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      // Vérifier la présence du cookie user_data
      const cookies = document.cookie.split(';')
      const userDataCookie = cookies.find(cookie => 
        cookie.trim().startsWith('user_data=')
      )
      return !!userDataCookie
    }
    return false
  }

  static async logout() {
    try {
      // Appeler l'API de déconnexion pour supprimer les cookies HTTP-only
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la déconnexion')
      }

      // Supprimer tous les mécanismes de sauvegarde côté client
      if (typeof window !== 'undefined') {
        // Nettoyer le localStorage complètement
        localStorage.clear()
        
        // Nettoyer le sessionStorage complètement
        sessionStorage.clear()
        
        // Supprimer manuellement tous les cookies accessibles côté client
        const cookies = document.cookie.split(';')
        cookies.forEach(cookie => {
          const eqPos = cookie.indexOf('=')
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
          // Supprimer le cookie en définissant une date d'expiration passée
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`
        })
        
        // Nettoyer l'IndexedDB si utilisé
        if ('indexedDB' in window) {
          try {
            const databases = await indexedDB.databases()
            databases.forEach(db => {
              if (db.name) {
                indexedDB.deleteDatabase(db.name)
              }
            })
          } catch (error) {
            console.warn('Impossible de nettoyer IndexedDB:', error)
          }
        }
        
        // Nettoyer le cache du service worker si présent
        if ('caches' in window) {
          try {
            const cacheNames = await caches.keys()
            await Promise.all(
              cacheNames.map(cacheName => caches.delete(cacheName))
            )
          } catch (error) {
            console.warn('Impossible de nettoyer le cache:', error)
          }
        }
      }
      
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      // Même en cas d'erreur, nettoyer côté client
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      throw error
    }
  }
}

export function requireAuth() {
  if (typeof window !== 'undefined' && !AuthManager.isAuthenticated()) {
    window.location.href = '/login'
    return false
  }
  return true
}