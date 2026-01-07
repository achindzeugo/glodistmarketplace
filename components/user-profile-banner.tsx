"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthManager } from "@/lib/auth"
import { User } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User as UserIcon, Settings, ShoppingBag } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserProfileBanner() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = AuthManager.isAuthenticated()
      const userData = AuthManager.getUser()
      setIsLoggedIn(authenticated)
      setUser(userData)
    }

    checkAuth()
    
    // Écouter les changements d'authentification
    const interval = setInterval(checkAuth, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    try {
      // Appeler la déconnexion via l'API pour supprimer les cookies
      await AuthManager.logout()
      
      // Nettoyer l'état local
      setIsLoggedIn(false)
      setUser(null)
      
      // Supprimer tous les mécanismes de sauvegarde côté client
      if (typeof window !== 'undefined') {
        // Nettoyer le localStorage au cas où il y aurait des données résiduelles
        localStorage.clear()
        
        // Nettoyer le sessionStorage
        sessionStorage.clear()
        
        // Forcer le rechargement de la page pour s'assurer que tous les états sont réinitialisés
        window.location.href = '/'
      }
      
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès. À bientôt !",
      })
      
    } catch (error) {
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur est survenue lors de la déconnexion",
        variant: "destructive",
      })
    }
  }

  const getInitials = (prenom: string, nom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
  }

  const getWelcomeMessage = () => {
    const hour = new Date().getHours()
    let greeting = "Bonsoir"
    
    if (hour < 12) {
      greeting = "Bonjour"
    } else if (hour < 18) {
      greeting = "Bon après-midi"
    }
    
    return `${greeting}, ${user?.prenom} !`
  }

  if (!isLoggedIn || !user) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-b">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src="" alt={`${user.prenom} ${user.nom}`} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(user.prenom, user.nom)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  {getWelcomeMessage()}
                </span>
                {user.role === 'Vendeur' && (
                  <span className="px-2 py-1 text-xs bg-secondary/20 text-secondary rounded-full font-medium">
                    Vendeur
                  </span>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user.role === 'Vendeur' && (
              //user.vente &&
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex items-center gap-2 border-secondary text-secondary hover:bg-secondary/10"
                onClick={() => router.push('/dashboard')}
              >
                <ShoppingBag className="h-4 w-4" />
                Ma Boutique
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden md:inline">Compte</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.prenom} {user.nom}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  Mon Profil
                </DropdownMenuItem>
                {user.role === 'Vendeur' && (
                  //user.vente &&
                  <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Ma Boutique
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive" 
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}