"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Filter, Search, SlidersHorizontal, Store } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { UserProfileBanner } from "@/components/user-profile-banner"
import { ProductCard } from "@/components/product-card"
import { ProductGridSkeleton } from "@/components/product-skeleton"
import { PageTransition, FadeTransition } from "@/components/page-transition"
import { BackButton } from "@/components/back-button"
import { apiClient, Product, Shop } from "@/lib/api"
import { getCachedPublicShops } from "@/lib/client-shop-cache"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type FilterState = {
  search: string
  status: string
  ordering: string
  shop: string
}

const defaultFilters: FilterState = {
  search: "",
  status: "",
  ordering: "",
  shop: "",
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingShops, setLoadingShops] = useState(true)
  const [categoryLabel, setCategoryLabel] = useState("")
  const [filters, setFilters] = useState<FilterState>(defaultFilters)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const categoryId = searchParams.get("category") ?? ""

  useEffect(() => {
    const nextFilters = {
      search: searchParams.get("search") ?? "",
      status: searchParams.get("status") ?? "",
      ordering: searchParams.get("ordering") ?? "",
      shop: searchParams.get("shop") ?? "",
    }

    setFilters(nextFilters)
    setCategoryLabel(searchParams.get("categoryLabel") ?? "")
    void loadProducts(nextFilters)
  }, [searchParams])

  useEffect(() => {
    const loadShops = async () => {
      try {
        setLoadingShops(true)
        const list = await getCachedPublicShops()
        setShops(list)
      } catch {
        setShops([])
      } finally {
        setLoadingShops(false)
      }
    }

    void loadShops()
  }, [])

  const loadProducts = async (nextFilters: FilterState) => {
    try {
      setLoading(true)
      const productsData = await apiClient.getProducts({
        ...(nextFilters.search ? { search: nextFilters.search } : {}),
        ...(nextFilters.status ? { status: nextFilters.status } : {}),
        ...(nextFilters.ordering ? { ordering: nextFilters.ordering } : {}),
        ...(nextFilters.shop ? { shop: nextFilters.shop } : {}),
        ...(categoryId ? { category: categoryId } : {}),
      })
      setProducts(productsData)
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

  const updateQuery = (nextFilters: FilterState) => {
    const params = new URLSearchParams(searchParams.toString())

    if (categoryId) {
      params.set("category", categoryId)
    } else {
      params.delete("category")
    }

    if (categoryLabel) {
      params.set("categoryLabel", categoryLabel)
    } else {
      params.delete("categoryLabel")
    }

    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  const handleApplyFilters = () => {
    updateQuery(filters)
  }

  const handleResetFilters = () => {
    const resetFilters = { ...defaultFilters }
    setFilters(resetFilters)
    const params = new URLSearchParams()

    if (categoryId) {
      params.set("category", categoryId)
    }

    if (categoryLabel) {
      params.set("categoryLabel", categoryLabel)
    }

    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(Boolean).length + (categoryId ? 1 : 0)
  }, [filters, categoryId])

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
                  {categoryLabel
                    ? `Produits de la categorie ${categoryLabel}`
                    : "Decouvrez notre selection de produits de qualite"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              {activeFilterCount} filtre{activeFilterCount > 1 ? "s" : ""} actif{activeFilterCount > 1 ? "s" : ""}
            </div>
          </div>

          <div className="rounded-2xl border border-primary/10 bg-card p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Filtres produits</h2>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div className="relative xl:col-span-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou description..."
                  value={filters.search}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, search: event.target.value }))
                  }
                  className="pl-9"
                />
              </div>

              <select
                value={filters.status}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, status: event.target.value }))
                }
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
                <option value="out_of_stock">Rupture de stock</option>
              </select>

              <select
                value={filters.ordering}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, ordering: event.target.value }))
                }
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Tri par defaut</option>
                <option value="-created_at">Plus recents</option>
                <option value="created_at">Plus anciens</option>
                <option value="price">Prix croissant</option>
                <option value="-price">Prix decroissant</option>
                <option value="name">Nom A-Z</option>
              </select>

              <select
                value={filters.shop}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, shop: event.target.value }))
                }
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                disabled={loadingShops}
              >
                <option value="">Toutes les boutiques</option>
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={handleResetFilters}>
                Reinitialiser
              </Button>
              <Button onClick={handleApplyFilters}>Appliquer les filtres</Button>
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
                  {products.length} produit{products.length > 1 ? "s" : ""} trouve{products.length > 1 ? "s" : ""}
                </p>
              </div>

              {products.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {products.map((product, index) => (
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
                <div className="animate-in fade-in-0 slide-in-from-bottom-4 rounded-2xl border border-dashed py-12 text-center">
                  <Store className="mx-auto mb-4 h-10 w-10 text-muted-foreground/30" />
                  <p className="text-muted-foreground">Aucun produit ne correspond a ces filtres.</p>
                </div>
              )}
            </FadeTransition>
          )}
        </div>
      </main>
    </PageTransition>
  )
}
