"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Filter, Search } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { UserProfileBanner } from "@/components/user-profile-banner"
import { ProductCard } from "@/components/product-card"
import { ProductGridSkeleton } from "@/components/product-skeleton"
import { PageTransition, FadeTransition } from "@/components/page-transition"
import { BackButton } from "@/components/back-button"
import { apiClient, Product } from "@/lib/api"
import { AuthManager } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    void loadProducts()
  }, [])

  useEffect(() => {
    setSearchTerm(searchParams.get("search") ?? "")
  }, [searchParams])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const productsData = await apiClient.getProducts()
      const currentUser = AuthManager.getUser()
      let filteredProducts = productsData

      if (currentUser) {
        try {
          const userShopData = await apiClient.getUserShop()

          if (userShopData.shop?.id) {
            filteredProducts = productsData.filter(
              (product) => product.boutique !== userShopData.shop.id.toString()
            )
          }
        } catch (error) {
          console.warn("Impossible de recuperer la boutique de l utilisateur:", error)
        }
      }

      setProducts(filteredProducts)
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <PageTransition className="min-h-screen bg-background">
      <Navbar />
      <UserProfileBanner />

      <main className="container mx-auto px-4 py-8 md:px-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <BackButton href="/" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Tous les produits</h1>
                <p className="text-muted-foreground">
                  Decouvrez notre selection de produits de qualite
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher des produits..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-9 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Button variant="outline" size="icon" className="transition-colors hover:bg-primary/5">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {loading ? (
            <FadeTransition>
              <ProductGridSkeleton count={12} />
            </FadeTransition>
          ) : (
            <FadeTransition>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""} trouve{filteredProducts.length > 1 ? "s" : ""}
                </p>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {filteredProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="animate-in fade-in-0 slide-in-from-bottom-4"
                      style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
                    >
                      <ProductCard
                        id={product.id.toString()}
                        name={product.nom}
                        price={product.prix}
                        image={product.medias?.[0]?.url || "/placeholder.svg"}
                        shop={product.boutique_nom}
                        shopId={product.boutique}
                        verified={true}
                        rating={4.5}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="animate-in fade-in-0 slide-in-from-bottom-4 py-12 text-center">
                  <p className="text-muted-foreground">Aucun produit trouve</p>
                </div>
              )}
            </FadeTransition>
          )}
        </div>
      </main>
    </PageTransition>
  )
}
