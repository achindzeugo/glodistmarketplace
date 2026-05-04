"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingCart, Search, Menu, User as UserIcon, LogOut, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AuthManager } from "@/lib/auth"
import { apiClient, User } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { AppLogo } from "@/components/app-logo"

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [hasShop, setHasShop] = useState(false)
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
        return
      }

      try {
        const userShopData = await apiClient.getUserShop()
        setHasShop(!!userShopData.shop?.id)
      } catch {
        setHasShop(false)
      }
    }

    void checkAuth()
    const interval = setInterval(() => {
      void checkAuth()
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    try {
      await AuthManager.logout()
      setIsLoggedIn(false)
      setUser(null)
      toast({ title: "Déconnexion réussie", description: "À bientôt !" })
      window.location.href = "/"
    } catch {
      toast({ title: "Erreur de déconnexion", variant: "destructive" })
    }
  }

  const getInitials = (u: User) =>
    `${u.prenom.charAt(0)}${u.nom.charAt(0)}`.toUpperCase()

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-24 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <AppLogo className="max-h-18 w-auto" priority />
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="transition-colors hover:text-primary hover:scale-105 transform duration-200">
              Accueil
            </Link>
            <Link href="/products" className="transition-colors hover:text-primary hover:scale-105 transform duration-200">
              Produits
            </Link>
            <Link href="/shops" className="transition-colors hover:text-primary hover:scale-105 transform duration-200">
              Boutiques
            </Link>
          </nav>

          {/* Search bar */}
          <div className="hidden flex-1 items-center max-w-md md:flex">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher des produits, boutiques..."
                className="w-full bg-muted pl-9 focus-visible:ring-primary"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center space-x-2 md:space-x-3">
            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative hover:scale-110 transition-transform duration-200">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>

            {isLoggedIn && user ? (
              /* User avatar dropdown */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:scale-105 transition-transform">
                    <Avatar className="h-8 w-8 border-2 border-secondary/40">
                      <AvatarFallback className="bg-secondary/20 text-secondary font-bold text-xs">
                        {getInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-semibold">{user.prenom} {user.nom}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    Mon Profil
                  </DropdownMenuItem>
                  {hasShop && (
                    <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Ma Boutique
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Login / Signup */
              <>
                <div className="hidden items-center space-x-1 md:flex">
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-xs">
                      Connexion
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="default" size="sm" className="text-xs bg-primary">
                      S'inscrire
                    </Button>
                  </Link>
                </div>
              </>
            )}

            {/* Mobile hamburger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-left">
                    <AppLogo className="max-h-16 w-auto" />
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 py-6">
                  <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Rechercher..." className="w-full bg-muted pl-9" />
                  </div>
                  <nav className="flex flex-col gap-2">
                    <Link href="/" className="px-2 py-3 text-lg font-semibold hover:text-primary">Accueil</Link>
                    <Link href="/products" className="px-2 py-3 text-lg font-semibold hover:text-primary">Produits</Link>
                    <Link href="/shops" className="px-2 py-3 text-lg font-semibold hover:text-primary">Boutiques</Link>
                  </nav>

                  {isLoggedIn && user ? (
                    <div className="flex flex-col gap-2 pt-4 border-t">
                      <div className="flex items-center gap-3 px-2 py-2">
                        <Avatar className="h-10 w-10 border-2 border-secondary/40">
                          <AvatarFallback className="bg-secondary/20 text-secondary font-bold">
                            {getInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">{user.prenom} {user.nom}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Link href="/profile">
                        <Button variant="outline" className="w-full gap-2 bg-transparent">
                          <UserIcon className="h-4 w-4" />
                          Mon Profil
                        </Button>
                      </Link>
                      {hasShop && (
                        <Link href="/dashboard">
                          <Button variant="outline" className="w-full gap-2 bg-transparent">
                            <ShoppingBag className="h-4 w-4" />
                            Ma Boutique
                          </Button>
                        </Link>
                      )}
                      <Button variant="destructive" className="w-full gap-2" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                        Se déconnecter
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 pt-4 border-t">
                      <Link href="/login" className="w-full">
                        <Button variant="outline" className="w-full bg-transparent">Connexion</Button>
                      </Link>
                      <Link href="/signup" className="w-full">
                        <Button className="w-full bg-primary">S'inscrire</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
