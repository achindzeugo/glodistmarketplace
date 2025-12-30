import { Navbar } from "@/components/navbar"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"

export default function ProductsPage() {
  const allProducts = [
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
      name: "Écouteurs Sans Fil Pro",
      price: 35000,
      image: "/wireless-earbuds-charging-case.png",
      shop: "Accessoires Plus",
      verified: true,
      rating: 4.5,
    },
    {
      id: "3",
      name: "Montre Connectée Sport",
      price: 75000,
      image: "/modern-smartwatch.png",
      shop: "Sport Shop Douala",
      verified: false,
      rating: 4.2,
    },
    {
      id: "4",
      name: "Chaussures de Sport Elite",
      price: 42000,
      image: "/assorted-shoes.png",
      shop: "Mode & Style",
      verified: true,
      rating: 4.7,
    },
    {
      id: "5",
      name: "Ordinateur Portable Ultra 15",
      price: 850000,
      image: "/modern-smartphone.png",
      shop: "Tech Global Cameroun",
      verified: true,
      rating: 4.9,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 md:px-6">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-black">Tous nos produits</h1>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher un produit..." className="pl-10" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {allProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
