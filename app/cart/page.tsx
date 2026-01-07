"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { UserProfileBanner } from "@/components/user-profile-banner"
import { PageTransition, FadeTransition } from "@/components/page-transition"
import { BackButton } from "@/components/back-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  shop: string
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "Smartphone Pro Max X1",
      price: 450000,
      image: "/modern-smartphone.png",
      quantity: 1,
      shop: "Tech Global Cameroun"
    },
    {
      id: "2",
      name: "Écouteurs Sans Fil Pro",
      price: 35000,
      image: "/wireless-earbuds-charging-case.png",
      quantity: 2,
      shop: "Accessoires Plus"
    }
  ])
  const router = useRouter()
  const { toast } = useToast()

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id))
    toast({
      title: "Produit retiré",
      description: "Le produit a été retiré de votre panier",
    })
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleCheckout = () => {
    toast({
      title: "Commande en cours",
      description: "Redirection vers le paiement...",
    })
    // Ici vous pouvez rediriger vers la page de paiement
  }

  return (
    <PageTransition className="min-h-screen bg-background">
      <Navbar />
      <UserProfileBanner />
      
      <main className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <BackButton />
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            <h1 className="text-3xl font-bold tracking-tight">Mon Panier</h1>
            <span className="text-muted-foreground">({cartItems.length} article{cartItems.length > 1 ? 's' : ''})</span>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <FadeTransition>
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Votre panier est vide</h2>
              <p className="text-muted-foreground mb-6">Découvrez nos produits et ajoutez-les à votre panier</p>
              <Button 
                onClick={() => router.push('/products')}
                className="transition-all duration-200 hover:scale-105"
              >
                Découvrir les produits
              </Button>
            </div>
          </FadeTransition>
        ) : (
          <FadeTransition>
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="animate-in fade-in-0 slide-in-from-left-4"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    <Card className="hover:shadow-md transition-shadow duration-200">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg bg-muted transition-transform hover:scale-105"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.shop}</p>
                            <p className="font-bold text-primary mt-1">
                              {item.price.toLocaleString()} XAF
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 hover:bg-primary/5 transition-colors"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 hover:bg-primary/5 transition-colors"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/5 transition-colors"
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
                  <Card className="sticky top-4 hover:shadow-md transition-shadow duration-200">
                    <CardHeader>
                      <CardTitle>Résumé de la commande</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.name} x{item.quantity}</span>
                            <span>{(item.price * item.quantity).toLocaleString()} XAF</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between font-bold text-lg">
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