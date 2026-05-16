"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { UserProfileBanner } from "@/components/user-profile-banner"
import { PageTransition, FadeTransition } from "@/components/page-transition"
import { BackButton } from "@/components/back-button"
import { ProductCard } from "@/components/product-card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Store, ShieldCheck, Package, CalendarDays, UserRound } from "lucide-react"
import { apiClient, Product, Shop } from "@/lib/api"

function formatDate(value?: string) {
  if (!value) return "Date inconnue"

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value))
}

export default function ShopProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [shop, setShop] = useState<Shop | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shopData, shopProductsResponse] = await Promise.all([
          apiClient.getShop(id),
          apiClient.getShopProducts(id),
        ])

        setShop(shopData)
        setProducts(shopProductsResponse.products)
      } catch {
        router.push("/shops")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, router])

  return (
    <PageTransition className="min-h-screen bg-background">
      <Navbar />
      <UserProfileBanner />

      {loading ? (
        <>
          <div className="bg-primary py-16">
            <div className="container mx-auto px-4 md:px-6">
              <div className="flex gap-8 items-center">
                <Skeleton className="h-32 w-32 rounded-3xl bg-white/20" />
                <div className="space-y-3 flex-1">
                  <Skeleton className="h-8 w-64 bg-white/20" />
                  <Skeleton className="h-4 w-96 bg-white/20" />
                  <Skeleton className="h-4 w-48 bg-white/20" />
                </div>
              </div>
            </div>
          </div>
          <div className="container mx-auto px-4 py-12 md:px-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />)}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="bg-primary text-primary-foreground py-16">
            <div className="container mx-auto px-4 md:px-6">
              <div className="mb-6">
                <BackButton href="/shops" />
              </div>
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="h-28 w-28 rounded-3xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shrink-0">
                  <Store className="h-14 w-14" />
                </div>
                <div className="space-y-4 text-center md:text-left flex-1">
                  <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                    <h1 className="text-3xl font-black md:text-4xl">{shop?.name}</h1>
                    {shop?.verified ? (
                      <ShieldCheck className="h-6 w-6 text-secondary fill-secondary" />
                    ) : null}
                  </div>
                  <p className="max-w-2xl text-primary-foreground/80 leading-relaxed">
                    {shop?.description || "Decouvrez les produits de cette boutique publique Glodist."}
                  </p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-1">
                    <div className="flex items-center gap-2 text-sm">
                      <UserRound className="h-4 w-4" />
                      {shop?.owner_name || "Vendeur Glodist"}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarDays className="h-4 w-4" />
                      <span>Creation {formatDate(shop?.created_at)}</span>
                    </div>
                    <Badge className="bg-secondary text-secondary-foreground font-bold">
                      {shop?.total_products ?? products.length} produit{(shop?.total_products ?? products.length) > 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-12 md:px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">
                Tous les produits ({products.length})
              </h2>
            </div>

            {products.length === 0 ? (
              <FadeTransition>
                <div className="text-center py-16">
                  <Package className="h-14 w-14 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground font-medium">
                    Cette boutique n'a pas encore de produits.
                  </p>
                </div>
              </FadeTransition>
            ) : (
              <FadeTransition>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {products.map((product, index) => (
                    <div
                      key={product.id}
                      className="animate-in fade-in-0 slide-in-from-bottom-4"
                      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
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
              </FadeTransition>
            )}
          </div>
        </>
      )}
    </PageTransition>
  )
}
