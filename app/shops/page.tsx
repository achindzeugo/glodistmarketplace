"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MapPin, Package, Search, ShieldCheck, Star, Store } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { UserProfileBanner } from "@/components/user-profile-banner"
import { PageTransition } from "@/components/page-transition"
import { BackButton } from "@/components/back-button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { getCachedPublicShops } from "@/lib/client-shop-cache"
import { getUserFriendlyErrorMessage } from "@/lib/error-utils"

interface Shop {
  id: string
  name: string
  description: string
  owner_name?: string
  total_products?: number
  verified?: boolean
}

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    let isActive = true

    const fetchShops = async () => {
      try {
        const list = await getCachedPublicShops()

        if (!isActive) {
          return
        }

        setShops(list)
      } catch (error) {
        if (!isActive) {
          return
        }

        setShops([])
        toast({
          title: "Connexion indisponible",
          description: getUserFriendlyErrorMessage(
            error,
            "Impossible de charger les boutiques pour le moment."
          ),
          variant: "destructive",
        })
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    void fetchShops()

    return () => {
      isActive = false
    }
  }, [toast])

  const filtered = shops.filter((shop) => {
    const q = search.toLowerCase()
    const name = (shop.name || "").toLowerCase()
    const owner = (shop.owner_name || "").toLowerCase()
    const description = (shop.description || "").toLowerCase()

    return name.includes(q) || owner.includes(q) || description.includes(q)
  })

  return (
    <PageTransition className="min-h-screen bg-background">
      <Navbar />
      <UserProfileBanner />

      <section className="relative overflow-hidden bg-primary py-14 text-primary-foreground">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 size-80 rounded-full bg-secondary/15 blur-3xl" />
        </div>
        <div className="container relative mx-auto px-4 md:px-6">
          <div className="mb-6">
            <BackButton href="/" />
          </div>
          <div className="mx-auto max-w-2xl space-y-4 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary">Partenaires</p>
            <h1 className="text-4xl font-black md:text-5xl">Nos boutiques verifiees</h1>
            <p className="text-primary-foreground/70">
              Decouvrez les meilleurs vendeurs certifies Glodist partout au Cameroun.
            </p>
            <div className="relative mt-4">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-12 rounded-2xl border-0 bg-white pl-12 text-foreground shadow-lg placeholder:text-muted-foreground"
                placeholder="Rechercher une boutique par nom ou vendeur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12 md:px-6">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border">
                <Skeleton className="h-32 w-full" />
                <div className="space-y-3 p-6">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Store className="mx-auto mb-4 h-14 w-14 text-muted-foreground/30" />
            <p className="font-medium text-muted-foreground">
              {search
                ? `Aucune boutique trouvee pour "${search}"`
                : "Aucune boutique publique disponible pour le moment."}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Seules les boutiques validees apparaissent sur cette page.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((shop, index) => {
              const initials = (shop.name || "Bo").slice(0, 2).toUpperCase()

              return (
                <Link
                  key={shop.id}
                  href={`/shops/${shop.id}`}
                  className="group block animate-in fade-in-0 slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
                >
                  <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg">
                    <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/15">
                        <span className="text-xl font-black text-primary">{initials}</span>
                      </div>
                      {shop.verified && (
                        <Badge className="absolute right-3 top-3 border-secondary/30 bg-secondary/20 text-[10px] font-semibold text-secondary">
                          <ShieldCheck className="mr-1 h-3 w-3" /> Verifie
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-3 p-5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-black leading-tight transition-colors group-hover:text-primary">
                          {shop.name}
                        </h3>
                        <div className="flex shrink-0 items-center gap-0.5">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-bold">4.5</span>
                        </div>
                      </div>

                      {shop.owner_name ? (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {shop.owner_name}
                        </div>
                      ) : null}

                      {shop.description ? (
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {shop.description}
                        </p>
                      ) : null}

                      <div className="mt-2 flex items-center justify-between border-t pt-3">
                        {typeof shop.total_products === "number" ? (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Package className="h-3.5 w-3.5" />
                            <span>{shop.total_products} produits</span>
                          </div>
                        ) : (
                          <span />
                        )}
                        <span className="text-xs font-bold text-primary group-hover:underline">
                          Voir la boutique →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </PageTransition>
  )
}
