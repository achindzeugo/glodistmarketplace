"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { UserProfileBanner } from "@/components/user-profile-banner"
import { PageTransition, FadeTransition } from "@/components/page-transition"
import { BackButton } from "@/components/back-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AuthManager } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { 
  Package, 
  Calendar, 
  MapPin, 
  CreditCard,
  Eye,
  ShoppingBag
} from "lucide-react"

interface Order {
  id: string
  date: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
    image: string
  }>
  shippingAddress: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = AuthManager.isAuthenticated()
      
      if (!authenticated) {
        toast({
          title: "Accès refusé",
          description: "Vous devez être connecté pour voir vos commandes",
          variant: "destructive",
        })
        router.push('/login')
        return
      }
      
      // Simuler des commandes pour la démo
      setOrders([
        {
          id: "CMD-001",
          date: "2025-01-05T10:30:00Z",
          status: "delivered",
          total: 485000,
          items: [
            {
              id: "1",
              name: "Smartphone Pro Max X1",
              quantity: 1,
              price: 450000,
              image: "/modern-smartphone.png"
            },
            {
              id: "2",
              name: "Écouteurs Sans Fil Pro",
              quantity: 1,
              price: 35000,
              image: "/wireless-earbuds-charging-case.png"
            }
          ],
          shippingAddress: "123 Rue de la Paix, Douala, Cameroun"
        },
        {
          id: "CMD-002",
          date: "2025-01-03T14:15:00Z",
          status: "shipped",
          total: 75000,
          items: [
            {
              id: "3",
              name: "Montre Connectée Sport",
              quantity: 1,
              price: 75000,
              image: "/modern-smartwatch.png"
            }
          ],
          shippingAddress: "456 Avenue du Commerce, Yaoundé, Cameroun"
        }
      ])
      setLoading(false)
    }

    checkAuth()
  }, [router, toast])

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const },
      confirmed: { label: 'Confirmée', variant: 'default' as const },
      shipped: { label: 'Expédiée', variant: 'default' as const },
      delivered: { label: 'Livrée', variant: 'default' as const },
      cancelled: { label: 'Annulée', variant: 'destructive' as const }
    }
    
    const config = statusConfig[status]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <PageTransition className="min-h-screen bg-background">
        <Navbar />
        <UserProfileBanner />
        <main className="container mx-auto px-4 md:px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-48"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </main>
      </PageTransition>
    )
  }

  return (
    <PageTransition className="min-h-screen bg-background">
      <Navbar />
      <UserProfileBanner />
      
      <main className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <BackButton href="/profile" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mes Commandes</h1>
            <p className="text-muted-foreground">
              Suivez l'état de vos commandes et consultez votre historique
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <FadeTransition>
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Aucune commande</h2>
              <p className="text-muted-foreground mb-6">
                Vous n'avez pas encore passé de commande
              </p>
              <Button onClick={() => router.push('/products')}>
                Découvrir les produits
              </Button>
            </div>
          </FadeTransition>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <div
                key={order.id}
                className="animate-in fade-in-0 slide-in-from-bottom-4"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both'
                }}
              >
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Commande {order.id}
                      </CardTitle>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(order.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4" />
                        {order.total.toLocaleString()} XAF
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg bg-muted"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantité: {item.quantity} × {item.price.toLocaleString()} XAF
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{order.shippingAddress}</span>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="text-lg font-bold">
                        Total: {order.total.toLocaleString()} XAF
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Voir détails
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </main>
    </PageTransition>
  )
}