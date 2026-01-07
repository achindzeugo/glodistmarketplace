"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { UserProfileBanner } from "@/components/user-profile-banner"
import { ProductCard } from "@/components/product-card"
import { ProductGridSkeleton } from "@/components/product-skeleton"
import { PageTransition, FadeTransition } from "@/components/page-transition"
import { BackButton } from "@/components/back-button"
import { apiClient, Product } from "@/lib/api"
import { AuthManager } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const productsData = await apiClient.getProducts()
      
      // Filtrer les produits pour exclure ceux de la boutique de l'utilisateur connecté
      const currentUser = AuthManager.getUser()
      let filteredProducts = productsData
      
      if (currentUser && currentUser.role === 'Vendeur') {
        try {
          // Récupérer les informations de la boutique de l'utilisateur
          const userShopData = await apiClient.getUserShop()
          
          if (userShopData.shop) {
            // Exclure les produits de la boutique du vendeur connecté
            filteredProducts = productsData.filter(product => 
              product.boutique !== userShopData.shop.id.toString()
            )
          }
        } catch (error) {
          console.warn('Impossible de récupérer la boutique de l\'utilisateur:', error)
          // En cas d'erreur, on garde tous les produits
        }
      }
      
      setProducts(filteredProducts)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <PageTransition className="min-h-screen bg-background">
      <Navbar />
      <UserProfileBanner />
      
      <main className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton href="/" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Tous les produits</h1>
                <p className="text-muted-foreground">
                  Découvrez notre sélection de produits de qualité
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher des produits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Button variant="outline" size="icon" className="hover:bg-primary/5 transition-colors">
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
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
                </p>
              </div>
              
              {filteredProducts.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {filteredProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="animate-in fade-in-0 slide-in-from-bottom-4"
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animationFillMode: 'both'
                      }}
                    >
                      <ProductCard
                        id={product.id.toString()}
                        name={product.nom}
                        price={product.prix}
                        image={product.medias?.[0]?.url || "/placeholder.svg"}
                        shop={product.boutique_nom}
                        verified={true}
                        rating={4.5}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 animate-in fade-in-0 slide-in-from-bottom-4">
                  <p className="text-muted-foreground">Aucun produit trouvé</p>
                </div>
              )}
            </FadeTransition>
          )}
        </div>
      </main>
    </PageTransition>
  )
}