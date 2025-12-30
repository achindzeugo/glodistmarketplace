import { Navbar } from "@/components/navbar"
import { ProductCard } from "@/components/product-card"
import { Badge } from "@/components/ui/badge"
import { Store, ShieldCheck, MapPin, Star } from "lucide-react"

export default function ShopProfilePage({ params }: { params: { id: string } }) {
  const shop = {
    id: params.id,
    name: "Tech Global Cameroun",
    description:
      "Spécialiste de l'électronique de pointe au Cameroun. Retrouvez les dernières nouveautés tech avec la garantie Glodist.",
    location: "Akwa, Douala",
    rating: 4.8,
    verified: true,
    joined: "2023",
  }

  const products = [
    {
      id: "1",
      name: "Smartphone Pro Max X1",
      price: 450000,
      image: "/modern-smartphone.png",
      shop: "Tech Global Cameroun",
      verified: true,
      rating: 4.8,
    },
    {
      id: "2",
      name: "Écouteurs Sans Fil v2",
      price: 25000,
      image: "/wireless-earbuds-charging-case.png",
      shop: "Tech Global Cameroun",
      verified: true,
      rating: 4.5,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="h-32 w-32 rounded-3xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                <Store className="h-16 w-16" />
              </div>
              <div className="space-y-4 text-center md:text-left flex-1">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <h1 className="text-4xl font-black">{shop.name}</h1>
                  {shop.verified && <ShieldCheck className="h-6 w-6 text-secondary fill-secondary" />}
                </div>
                <p className="max-w-2xl text-primary-foreground/80 leading-relaxed text-lg">{shop.description}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" /> {shop.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-secondary fill-secondary" /> {shop.rating}/5
                  </div>
                  <Badge variant="secondary" className="bg-secondary text-primary font-bold">
                    Membre depuis {shop.joined}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Tous les produits ({products.length})</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
