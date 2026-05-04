"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { UserProfileBanner } from "@/components/user-profile-banner"
import { PageTransition } from "@/components/page-transition"
import { BackButton } from "@/components/back-button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Store, ShieldCheck, MapPin, Star, Package } from "lucide-react"
import Link from "next/link"

interface Shop {
  id: string
  name?: string
  nom?: string
  location?: string
  rating?: number
  verified?: boolean
  products?: number
  description?: string
}

const fallbackShops: Shop[] = [
  { id: "1", nom: "Tech Global Cameroun", location: "Akwa, Douala", rating: 4.8, verified: true, products: 124 },
  { id: "2", nom: "Glodist Fashion Hub", location: "Bastos, Yaoundé", rating: 4.5, verified: true, products: 86 },
  { id: "3", nom: "Electroménager Direct", location: "Bafoussam", rating: 4.2, verified: false, products: 45 },
]

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await fetch("/api/boutiques", { credentials: "include" })
        if (!res.ok) throw new Error()
        const data = await res.json()
        const list: Shop[] = Array.isArray(data) ? data : data.results ?? []
        setShops(list.length > 0 ? list : fallbackShops)
      } catch {
        setShops(fallbackShops)
      } finally {
        setLoading(false)
      }
    }
    fetchShops()
  }, [])

  const filtered = shops.filter((s) => {
    const name = (s.nom || s.name || "").toLowerCase()
    const loc = (s.location || "").toLowerCase()
    const q = search.toLowerCase()
    return name.includes(q) || loc.includes(q)
  })

  return (
    <PageTransition className="min-h-screen bg-background">
      <Navbar />
      <UserProfileBanner />

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary py-14 text-primary-foreground">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 size-80 rounded-full bg-secondary/15 blur-3xl" />
        </div>
        <div className="container relative mx-auto px-4 md:px-6">
          <div className="mb-6">
            <BackButton href="/" />
          </div>
          <div className="mx-auto max-w-2xl text-center space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary">Partenaires</p>
            <h1 className="text-4xl font-black md:text-5xl">Nos boutiques vérifiées</h1>
            <p className="text-primary-foreground/70">
              Découvrez les meilleurs vendeurs certifiés Glodist partout au Cameroun.
            </p>
            <div className="relative mt-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                className="pl-12 h-12 rounded-2xl border-0 shadow-lg bg-white text-foreground placeholder:text-muted-foreground"
                placeholder="Rechercher une boutique par nom ou ville..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <main className="container mx-auto px-4 py-12 md:px-6">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border">
                <Skeleton className="h-32 w-full" />
                <div className="p-6 space-y-3">
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
            <p className="text-muted-foreground font-medium">Aucune boutique trouvée pour "{search}"</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((shop, i) => {
              const name = shop.nom || shop.name || "Boutique"
              const initials = name.slice(0, 2).toUpperCase()
              return (
                <Link
                  key={shop.id}
                  href={`/shops/${shop.id}`}
                  className="group block animate-in fade-in-0 slide-in-from-bottom-4"
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
                >
                  <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20">
                    {/* Cover */}
                    <div className="relative h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <div className="size-14 rounded-2xl bg-primary/15 flex items-center justify-center">
                        <span className="text-xl font-black text-primary">{initials}</span>
                      </div>
                      {shop.verified && (
                        <Badge className="absolute top-3 right-3 bg-secondary/20 text-secondary border-secondary/30 text-[10px] font-semibold">
                          <ShieldCheck className="h-3 w-3 mr-1" /> Vérifié
                        </Badge>
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-5 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-black text-base leading-tight group-hover:text-primary transition-colors">
                          {name}
                        </h3>
                        {shop.rating && (
                          <div className="flex items-center gap-0.5 shrink-0">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-bold">{shop.rating}</span>
                          </div>
                        )}
                      </div>

                      {shop.location && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {shop.location}
                        </div>
                      )}

                      <div className="flex items-center justify-between border-t pt-3 mt-2">
                        {shop.products ? (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Package className="h-3.5 w-3.5" />
                            <span>{shop.products} produits</span>
                          </div>
                        ) : <span />}
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
