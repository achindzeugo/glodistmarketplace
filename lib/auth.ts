import { User } from './api'
import { clearClientShopCache } from './client-shop-cache'
import { getUserFriendlyErrorMessage } from './error-utils'

export type { User } from './api'

export class AuthManager {
  static setUser(user: User) {
    if (typeof window === 'undefined') {
      return
    }

    document.cookie = `user_data=${encodeURIComponent(JSON.stringify(user))};path=/;max-age=${60 * 60 * 24 * 7};SameSite=Lax`
  }

  static getUser(): User | null {
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';')
      const userDataCookie = cookies.find(cookie =>
        cookie.trim().startsWith('user_data=')
      )

      if (userDataCookie) {
        try {
          const userData = decodeURIComponent(userDataCookie.split('=')[1])
          return JSON.parse(userData)
        } catch (error) {
          console.error('Erreur lors de la lecture des donnees utilisateur:', error)
          return null
        }
      }
    }

    return null
  }

  static isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
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
      clearClientShopCache()
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la deconnexion')
      }

      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()

        const cookies = document.cookie.split(';')
        cookies.forEach(cookie => {
          const eqPos = cookie.indexOf('=')
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()

          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`
        })

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
      console.error('Erreur lors de la deconnexion:', error)
      clearClientShopCache()

      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }

      throw new Error(getUserFriendlyErrorMessage(error, 'Erreur lors de la deconnexion'))
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
