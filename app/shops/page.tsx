import { Navbar } from "@/components/navbar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Store, ShieldCheck, MapPin, Star } from "lucide-react"
import Link from "next/link"

export default async function ShopsPage() {
  const shops = [
    { id: "1", name: "Tech Global Cameroun", location: "Akwa, Douala", rating: 4.8, verified: true, products: 124 },
    { id: "2", name: "Glodist Fashion Hub", location: "Bastos, Yaoundé", rating: 4.5, verified: true, products: 86 },
    { id: "3", name: "Electroménager Direct", location: "Bafoussam", rating: 4.2, verified: false, products: 45 },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar />
      <main className="container mx-auto px-4 py-12 md:px-6">
        <div className="max-w-2xl mx-auto text-center space-y-4 mb-12">
          <h1 className="text-4xl font-black text-primary">Découvrez nos Boutiques</h1>
          <p className="text-muted-foreground text-lg">Trouvez les meilleurs vendeurs certifiés Glodist au Cameroun.</p>
          <div className="relative mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              className="pl-12 h-14 text-lg rounded-2xl bg-white border-none shadow-lg"
              placeholder="Rechercher une boutique par nom ou ville..."
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop) => (
            <Link key={shop.id} href={`/shops/${shop.id}`}>
              <Card className="group hover:shadow-xl transition-all border-none overflow-hidden cursor-pointer">
                <CardContent className="p-0">
                  <div className="h-32 bg-primary/5 flex items-center justify-center">
                    <Store className="h-12 w-12 text-primary opacity-20" />
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{shop.name}</h3>
                        {shop.verified && <ShieldCheck className="h-5 w-5 text-secondary fill-secondary" />}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">{shop.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <MapPin className="h-4 w-4" /> {shop.location}
                    </div>
                    <div className="pt-4 border-t flex items-center justify-between text-sm">
                      <span className="text-primary font-semibold">{shop.products} produits</span>
                      <Button variant="ghost" className="text-primary p-0 h-auto font-bold hover:bg-transparent">
                        Voir la boutique →
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
