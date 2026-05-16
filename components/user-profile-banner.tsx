"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthManager } from "@/lib/auth"
import { User } from "@/lib/api"
import { getCachedUserShopState } from "@/lib/client-shop-cache"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User as UserIcon, Settings, ShoppingBag, Store } from "lucide-react"
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
  const [hasShop, setHasShop] = useState(false)
  const [shopStatusResolved, setShopStatusResolved] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = AuthManager.isAuthenticated()
      const userData = AuthManager.getUser()
      setIsLoggedIn(authenticated)
      setUser(userData)

      if (!authenticated || !userData) {
        setHasShop(false)
        setShopStatusResolved(true)
        return
      }

      try {
        const shopState = await getCachedUserShopState(userData)
        setHasShop(shopState.hasShop)
        setShopStatusResolved(true)
        if (shopState.upgradedUser && shopState.hasShop) {
          setUser(shopState.upgradedUser)
          AuthManager.setUser(shopState.upgradedUser)
        }
      } catch {
        setHasShop(false)
        setShopStatusResolved(true)
      }
    }

    void checkAuth()
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const originKey = "welcome_banner_origin"
    const expiryKey = "welcome_banner_expiry"
    const currentOrigin = String(window.performance.timeOrigin)
    const storedOrigin = sessionStorage.getItem(originKey)
    const now = Date.now()

    let expiry = Number(sessionStorage.getItem(expiryKey) || 0)

    if (storedOrigin !== currentOrigin) {
      expiry = now + 60_000
      sessionStorage.setItem(originKey, currentOrigin)
      sessionStorage.setItem(expiryKey, String(expiry))
    }

    if (expiry <= now) {
      setShowWelcome(false)
      return
    }

    setShowWelcome(true)

    const timeout = window.setTimeout(() => {
      setShowWelcome(false)
      sessionStorage.setItem(expiryKey, String(Date.now()))
    }, expiry - now)

    return () => window.clearTimeout(timeout)
  }, [])

  const handleLogout = async () => {
    try {
      await AuthManager.logout()
      setIsLoggedIn(false)
      setUser(null)
      setHasShop(false)

      if (typeof window !== "undefined") {
        localStorage.clear()
        sessionStorage.clear()
        window.location.href = "/"
      }

      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès. À bientôt !",
      })
    } catch {
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

  if (!isLoggedIn || !user || !showWelcome) {
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
                {hasShop ? (
                  <span className="px-2 py-1 text-xs bg-secondary/20 text-secondary rounded-full font-medium">
                    Vendeur
                  </span>
                ) : null}
              </div>
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasShop ? (
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex items-center gap-2 border-secondary text-secondary hover:bg-secondary/10"
                onClick={() => router.push("/dashboard")}
              >
                <ShoppingBag className="h-4 w-4" />
                Ma Boutique
              </Button>
            ) : shopStatusResolved && user.role === "Client" ? (
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex items-center gap-2 border-secondary text-secondary hover:bg-secondary/10"
                onClick={() => router.push("/shop-registration")}
              >
                <Store className="h-4 w-4" />
                Devenir vendeur
              </Button>
            ) : null}

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
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  Mon Profil
                </DropdownMenuItem>
                {hasShop ? (
                  <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Ma Boutique
                  </DropdownMenuItem>
                ) : shopStatusResolved && user.role === "Client" ? (
                  <DropdownMenuItem onClick={() => router.push("/shop-registration")}>
                    <Store className="mr-2 h-4 w-4" />
                    Devenir vendeur
                  </DropdownMenuItem>
                ) : null}
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
