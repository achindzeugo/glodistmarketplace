"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingCart, User, Search, Menu, Store, LayoutDashboard, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { getClientUser, clientLogout, isClientAuthenticated } from "@/lib/auth"
import { useCartStore } from "@/lib/cart-store"
import type { User as UserType } from "@/lib/api"

export function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [mounted, setMounted] = useState(false)
  const totalItems = useCartStore((s) => s.totalItems)

  useEffect(() => {
    setMounted(true)
    setUser(getClientUser())
  }, [])

  const handleLogout = async () => {
    await clientLogout()
    setUser(null)
    useCartStore.getState().clearCart()
    router.push("/")
    router.refresh()
  }

  const isLoggedIn = mounted && isClientAuthenticated()
  const canSell = user?.can_sell ?? false
  const cartCount = mounted ? totalItems() : 0

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
            <Link href="/" className="transition-colors hover:text-primary">Accueil</Link>
            <Link href="/shops" className="transition-colors hover:text-primary">Boutiques</Link>
            <Link href="/products" className="transition-colors hover:text-primary">Produits</Link>
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
            {isLoggedIn && canSell && (
              <Link href="/dashboard" className="hidden lg:block">
                <Button variant="ghost" className="text-primary font-bold gap-2 hover:bg-primary/5">
                  <LayoutDashboard className="h-4 w-4" />
                  Ma Boutique
                </Button>
              </Link>
            )}

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full border border-primary/10">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="font-bold">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-muted-foreground font-normal">{user?.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Mon Profil</Link>
                  </DropdownMenuItem>
                  {canSell && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="text-primary font-bold">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Ma Boutique
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center space-x-1 md:flex">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-xs">Connexion</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="default" size="sm" className="text-xs bg-primary">S'inscrire</Button>
                </Link>
              </div>
            )}

            {!isLoggedIn && (
              <Link href="/shop-registration">
                <Button variant="outline" className="hidden border-primary text-primary hover:bg-primary/10 md:inline-flex bg-transparent">
                  <Store className="mr-2 h-4 w-4" />
                  Vendre sur Glodist
                </Button>
              </Link>
            )}

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-left flex items-center gap-1">
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
                    <Link href="/" className="px-2 py-3 text-lg font-semibold hover:text-primary">Accueil</Link>
                    <Link href="/products" className="px-2 py-3 text-lg font-semibold hover:text-primary">Produits</Link>
                    <Link href="/shops" className="px-2 py-3 text-lg font-semibold hover:text-primary">Boutiques</Link>
                    {isLoggedIn && (
                      <>
                        <Link href="/profile" className="px-2 py-3 text-lg font-semibold hover:text-primary border-t pt-4 mt-2">
                          Mon Profil
                        </Link>
                        {canSell && (
                          <Link href="/dashboard" className="px-2 py-3 text-lg font-semibold text-primary">
                            Ma Boutique
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="px-2 py-3 text-lg font-semibold text-destructive text-left hover:opacity-80"
                        >
                          Déconnexion
                        </button>
                      </>
                    )}
                  </nav>
                  {!isLoggedIn && (
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
