"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { UserProfileBanner } from "@/components/user-profile-banner"
import { PageTransition, FadeTransition } from "@/components/page-transition"
import { BackButton } from "@/components/back-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  CART_UPDATED_EVENT,
  CartItem,
  getCartItems,
  removeCartItem,
  updateCartItemQuantity,
} from "@/lib/cart"

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const syncCart = () => {
      setCartItems(getCartItems())
    }

    syncCart()
    window.addEventListener(CART_UPDATED_EVENT, syncCart)

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, syncCart)
    }
  }, [])

  const updateQuantity = (id: string, newQuantity: number) => {
    const updatedItems = updateCartItemQuantity(id, newQuantity)
    setCartItems(updatedItems)
  }

  const removeItem = (id: string) => {
    const updatedItems = removeCartItem(id)
    setCartItems(updatedItems)
    toast({
      title: "Produit retire",
      description: "Le produit a ete retire de votre panier",
    })
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleCheckout = () => {
    toast({
      title: "Commande en cours",
      description: "Le paiement sera connecte dans la prochaine etape.",
    })
  }

  return (
    <PageTransition className="min-h-screen bg-background">
      <Navbar />
      <UserProfileBanner />

      <main className="container mx-auto px-4 py-8 md:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <BackButton />
          <div className="flex flex-wrap items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            <h1 className="text-3xl font-bold tracking-tight">Mon Panier</h1>
            <span className="text-muted-foreground">
              ({cartItems.length} article{cartItems.length > 1 ? "s" : ""})
            </span>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <FadeTransition>
            <div className="py-12 text-center">
              <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h2 className="mb-2 text-xl font-semibold">Votre panier est vide</h2>
              <p className="mb-6 text-muted-foreground">
                Decouvrez nos produits et ajoutez-les a votre panier.
              </p>
              <Button
                onClick={() => router.push("/products")}
                className="transition-all duration-200 hover:scale-105"
              >
                Decouvrir les produits
              </Button>
            </div>
          </FadeTransition>
        ) : (
          <FadeTransition>
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                {cartItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="animate-in fade-in-0 slide-in-from-left-4"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
                  >
                    <Card className="transition-shadow duration-200 hover:shadow-md">
                      <CardContent className="p-6">
                        <div className="flex flex-col gap-4 sm:flex-row">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-24 w-full rounded-xl bg-muted object-cover transition-transform hover:scale-105 sm:h-20 sm:w-20"
                          />

                          <div className="flex-1 space-y-1">
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.shop}</p>
                            <p className="mt-1 font-bold text-primary">{item.price.toLocaleString()} XAF</p>
                          </div>

                          <div className="flex items-center justify-between gap-3 sm:justify-end">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 transition-colors hover:bg-primary/5"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 transition-colors hover:bg-primary/5"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive transition-colors hover:bg-destructive/5 hover:text-destructive"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-1">
                <div className="animate-in fade-in-0 slide-in-from-right-4 animation-delay-200">
                  <Card className="transition-shadow duration-200 hover:shadow-md lg:sticky lg:top-4">
                    <CardHeader>
                      <CardTitle>Resume de la commande</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex justify-between gap-4 text-sm">
                            <span className="line-clamp-2">{item.name} x{item.quantity}</span>
                            <span>{(item.price * item.quantity).toLocaleString()} XAF</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span className="text-primary">{getTotalPrice().toLocaleString()} XAF</span>
                        </div>
                      </div>

                      <Button
                        className="w-full transition-all duration-200 hover:scale-105"
                        size="lg"
                        onClick={handleCheckout}
                      >
                        Valider la commande
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </FadeTransition>
        )}
      </main>
    </PageTransition>
  )
}
