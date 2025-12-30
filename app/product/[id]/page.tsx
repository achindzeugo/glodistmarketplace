import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Star, ShoppingCart, Truck, CreditCard, RefreshCw } from "lucide-react"

export default function ProductPage({ params }: { params: { id: string } }) {
  // Simuler des données de produit basées sur l'ID
  const product = {
    id: params.id,
    name: "Smartphone Pro Max X1",
    price: 450000,
    description:
      "Le dernier smartphone haut de gamme avec une caméra exceptionnelle et une batterie longue durée. Idéal pour les professionnels et les créatifs au Cameroun.",
    images: ["/modern-smartphone.png"],
    shop: "Tech Global Cameroun",
    verified: true,
    rating: 4.8,
    reviews: 124,
    stock: 12,
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 md:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-2xl bg-muted border">
              <img
                src={product.images[0] || "/placeholder.svg"}
                alt={product.name}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-muted border overflow-hidden opacity-50 hover:opacity-100 cursor-pointer transition-opacity"
                >
                  <img
                    src={product.images[0] || "/placeholder.svg"}
                    alt="thumbnail"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-semibold text-primary">{product.shop}</span>
                {product.verified && <ShieldCheck className="h-4 w-4 text-secondary fill-secondary" />}
                <span className="mx-2">•</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-foreground">{product.rating}</span>
                  <span>({product.reviews} avis)</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{product.name}</h1>
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-black text-primary">{product.price.toLocaleString()} XAF</span>
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                  En stock
                </Badge>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed text-lg">{product.description}</p>

            <div className="space-y-4 pt-4">
              <div className="flex gap-4">
                <Button size="lg" className="flex-1 h-14 text-lg font-bold">
                  Acheter maintenant
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 h-14 text-lg border-primary text-primary bg-transparent"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Ajouter au panier
                </Button>
              </div>
            </div>

            {/* Value Props */}
            <div className="grid grid-cols-1 gap-4 pt-8 md:grid-cols-3">
              <div className="flex items-start gap-3 p-4 rounded-xl border bg-card">
                <Truck className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-bold text-sm">Livraison Rapide</h4>
                  <p className="text-xs text-muted-foreground">Douala / Yaoundé en 24h</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl border bg-card">
                <CreditCard className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-bold text-sm">Paiement Sécurisé</h4>
                  <p className="text-xs text-muted-foreground">Mobile Money & Cash</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl border bg-card">
                <RefreshCw className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-bold text-sm">Retours Faciles</h4>
                  <p className="text-xs text-muted-foreground">Satisfait ou remboursé</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
