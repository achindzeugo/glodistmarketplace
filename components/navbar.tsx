"use client"

import Link from "next/link"
import { ShoppingCart, Search, Menu, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { AuthManager } from "@/lib/auth"
import { User } from "@/lib/api"

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)

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

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-black tracking-tighter text-secondary">Glo</span>
              <span className="text-2xl font-black tracking-tighter text-primary">Dist</span>
            </div>
          </Link>

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

          <div className="flex items-center space-x-2 md:space-x-4">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative hover:scale-110 transition-transform duration-200">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold animate-pulse">
                  3
                </span>
              </Button>
            </Link>

            {!isLoggedIn && (
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
            )}

            {/* Masquer le bouton "Vendre sur Glodist" pour les vendeurs */}
            {(!isLoggedIn || (user && user.role !== 'Vendeur')) && (
              <Link href="/shop-registration">
                <Button
                  variant="outline"
                  className="hidden border-primary text-primary hover:bg-primary/10 md:inline-flex bg-transparent"
                >
                  <Store className="mr-2 h-4 w-4" />
                  Vendre sur Glodist
                </Button>
              </Link>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-left flex items-center gap-2">
                    <span className="text-xl font-black tracking-tighter text-secondary">Glo</span>
                    <span className="text-xl font-black tracking-tighter text-primary">Dist</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 py-6">
                  <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Rechercher..." className="w-full bg-muted pl-9" />
                  </div>
                  <nav className="flex flex-col gap-2">
                    <Link href="/" className="px-2 py-3 text-lg font-semibold hover:text-primary">
                      Accueil
                    </Link>
                    <Link href="/products" className="px-2 py-3 text-lg font-semibold hover:text-primary">
                      Produits
                    </Link>
                    <Link href="/shops" className="px-2 py-3 text-lg font-semibold hover:text-primary">
                      Boutiques
                    </Link>
                  </nav>
                  {!isLoggedIn && (
                    <div className="flex flex-col gap-2 pt-4 border-t">
                      <Link href="/login" className="w-full">
                        <Button variant="outline" className="w-full bg-transparent">
                          Connexion
                        </Button>
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
