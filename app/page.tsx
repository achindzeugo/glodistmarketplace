"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Home as HomeIcon,
  MessageCircle,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  TrendingUp,
  Truck,
  Users,
  Zap,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { UserProfileBanner } from "@/components/user-profile-banner"
import { ProductCard } from "@/components/product-card"
import { ProductGridSkeleton } from "@/components/product-skeleton"
import { PageTransition, FadeTransition } from "@/components/page-transition"
import { Button } from "@/components/ui/button"
import { AppLogo } from "@/components/app-logo"
import { apiClient, Category, Product } from "@/lib/api"
import { AuthManager, User } from "@/lib/auth"

type CategoryTheme = {
  icon: typeof Zap
  from: string
  to: string
  border: string
  text: string
}

const categoryThemes: CategoryTheme[] = [
  { icon: Zap, from: "from-blue-500/20", to: "to-blue-500/5", border: "border-blue-500/20", text: "text-blue-500" },
  { icon: ShoppingBag, from: "from-violet-500/20", to: "to-violet-500/5", border: "border-violet-500/20", text: "text-violet-500" },
  { icon: HomeIcon, from: "from-emerald-500/20", to: "to-emerald-500/5", border: "border-emerald-500/20", text: "text-emerald-500" },
  { icon: Sparkles, from: "from-pink-500/20", to: "to-pink-500/5", border: "border-pink-500/20", text: "text-pink-500" },
]

function normalizeLabel(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function getCategoryTheme(label: string, index: number): CategoryTheme {
  const normalized = normalizeLabel(label)

  if (normalized.includes("elect")) {
    return categoryThemes[0]
  }

  if (normalized.includes("mode") || normalized.includes("vet")) {
    return categoryThemes[1]
  }

  if (normalized.includes("maison") || normalized.includes("meuble")) {
    return categoryThemes[2]
  }

  if (normalized.includes("beaute") || normalized.includes("cosmet")) {
    return categoryThemes[3]
  }

  return categoryThemes[index % categoryThemes.length]
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [hasShop, setHasShop] = useState(false)

  useEffect(() => {
    let isMounted = true

    const syncUserState = async () => {
      const userData = AuthManager.getUser()

      if (!isMounted) {
        return null
      }

      setUser(userData)

      if (!userData) {
        setHasShop(false)
        return null
      }

      try {
        const userShopData = await apiClient.getUserShop()
        const nextShopId = userShopData.shop?.id ? String(userShopData.shop.id) : null

        if (isMounted) {
          setHasShop(!!nextShopId)
        }

        return nextShopId
      } catch {
        if (isMounted) {
          setHasShop(false)
        }

        return null
      }
    }

    const loadFeaturedProducts = async (shopId: string | null) => {
      try {
        const products = await apiClient.getProducts()
        const filteredProducts = shopId
          ? products.filter((product) => product.boutique !== shopId)
          : products

        if (isMounted) {
          setFeaturedProducts(filteredProducts.slice(0, 4))
        }
      } catch {
        if (isMounted) {
          setFeaturedProducts([])
        }
      } finally {
        if (isMounted) {
          setLoadingProducts(false)
        }
      }
    }

    const loadCategories = async () => {
      try {
        const categoryResponse = await apiClient.getCategories()

        if (isMounted) {
          setCategories(categoryResponse.results)
        }
      } catch {
        if (isMounted) {
          setCategories([])
        }
      } finally {
        if (isMounted) {
          setLoadingCategories(false)
        }
      }
    }

    const bootstrap = async () => {
      const shopId = await syncUserState()
      await Promise.all([loadFeaturedProducts(shopId), loadCategories()])
    }

    void bootstrap()

    const interval = setInterval(() => {
      void syncUserState()
    }, 3000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  return (
    <PageTransition className="min-h-screen bg-background">
      <Navbar />
      <UserProfileBanner />

      <main>
        <section className="relative overflow-hidden bg-primary text-primary-foreground">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-48 -top-48 size-[500px] rounded-full bg-secondary/15 blur-3xl" />
            <div className="absolute -left-24 bottom-0 size-80 rounded-full bg-white/5 blur-3xl" />
          </div>

          <div className="container relative mx-auto px-4 py-16 md:px-6 md:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm">
                  <BadgeCheck className="h-3.5 w-3.5 text-secondary" />
                  Marketplace de confiance au Cameroun
                </div>

                <div className="space-y-4">
                  <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                    Achetez local,
                    <br />
                    <span className="text-secondary">vivez mieux.</span>
                  </h1>

                  <p className="mx-auto max-w-xl text-base leading-relaxed text-primary-foreground/75 sm:text-lg lg:mx-0">
                    Des vendeurs verifies, des produits authentiques et une livraison rapide
                    a Douala et Yaounde. Glodist aide le Cameroun a acheter mieux.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
                  <Link href="/products">
                    <Button
                      size="lg"
                      className="h-12 w-full gap-2 bg-secondary px-6 font-bold text-secondary-foreground shadow-lg shadow-secondary/30 hover:bg-secondary/90 sm:w-auto"
                    >
                      Explorer les produits
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>

                  {hasShop ? (
                    <Link href="/dashboard">
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-12 w-full border-white/25 bg-transparent px-6 text-white hover:bg-white/10 sm:w-auto"
                      >
                        Ma Boutique
                      </Button>
                    </Link>
                  ) : user?.role === "Client" ? (
                    <Link href="/shop-registration">
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-12 w-full border-white/25 bg-transparent px-6 text-white hover:bg-white/10 sm:w-auto"
                      >
                        Devenir vendeur
                      </Button>
                    </Link>
                  ) : null}
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6 text-left">
                  {[
                    { value: "500+", label: "Boutiques" },
                    { value: "10K+", label: "Produits" },
                    {
                      value: "4.9",
                      label: "Note moyenne",
                      suffix: <Star className="ml-0.5 inline h-3 w-3 fill-secondary text-secondary" />,
                    },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="text-xl font-black text-secondary sm:text-2xl">
                        {stat.value}
                        {stat.suffix}
                      </p>
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-primary-foreground/50">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative flex min-h-[320px] items-center justify-center lg:min-h-[460px]">
                <div className="absolute hidden size-[470px] rounded-full border border-white/[0.06] lg:block" />
                <div className="absolute hidden size-[360px] rounded-full border border-white/[0.09] lg:block" />
                <div className="absolute size-[220px] rounded-full border border-white/10 bg-white/[0.04] sm:size-[250px]" />

                <div className="relative z-10 size-56 overflow-hidden rounded-full border-2 border-white/30 bg-gradient-to-br from-white/25 to-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:size-64 lg:size-80">
                  <img
                    src="/modern-smartphone.png"
                    alt="Produits Glodist"
                    className="h-full w-full scale-110 object-cover object-center"
                  />
                </div>

                <div className="absolute left-2 top-6 z-20 rounded-2xl bg-white px-3 py-2 shadow-2xl sm:left-0 sm:top-12">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary/15">
                      <ShieldCheck className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Boutique verifiee
                      </p>
                      <p className="text-xs font-black text-foreground">Tech Global</p>
                    </div>
                  </div>
                </div>

                <div className="absolute right-2 top-8 z-20 rounded-xl bg-secondary px-3 py-2 shadow-xl sm:right-0 sm:top-16">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-secondary-foreground" />
                    <div>
                      <p className="text-[10px] font-medium text-secondary-foreground/80">Livraison</p>
                      <p className="text-xs font-black text-secondary-foreground">Express 24h</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-10 left-3 z-20 rounded-2xl bg-white px-3.5 py-2.5 text-center shadow-xl sm:left-8">
                  <p className="text-xl font-black leading-none text-primary">10K+</p>
                  <p className="text-[10px] font-semibold text-muted-foreground">Produits</p>
                </div>

                <div className="absolute bottom-14 right-0 z-20 rounded-2xl bg-white p-3 shadow-2xl">
                  <div className="mb-1.5 flex items-center gap-0.5">
                    {[...Array(5)].map((_, index) => (
                      <Star key={index} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm font-black text-foreground">Produits de qualite</p>
                  <p className="text-[10px] text-muted-foreground">Selection premium</p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-10 bg-background [clip-path:ellipse(60%_100%_at_50%_100%)]" />
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-10 text-center">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-secondary">Parcourir</p>
              <h2 className="text-3xl font-black">Toutes les categories</h2>
            </div>

            {loadingCategories ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="min-h-[150px] animate-pulse rounded-2xl border bg-muted/60 p-6"
                  />
                ))}
              </div>
            ) : categories.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {categories.map((category, index) => {
                  const theme = getCategoryTheme(category.libelle, index)
                  const Icon = theme.icon

                  return (
                    <Link
                      key={category.id}
                      href={`/products?search=${encodeURIComponent(category.libelle)}`}
                      className="h-full"
                    >
                      <div
                        className={`group relative flex h-full min-h-[180px] flex-col overflow-hidden rounded-2xl border ${theme.border} bg-gradient-to-br ${theme.from} ${theme.to} p-6 transition-all hover:-translate-y-1 hover:shadow-md`}
                      >
                        <div className={`mb-4 ${theme.text}`}>
                          <Icon className="h-7 w-7" />
                        </div>
                        <p className="min-h-[3.5rem] pr-8 text-lg font-black line-clamp-2">
                          {category.libelle}
                        </p>
                        {category.description ? (
                          <p className="mt-2 min-h-[2.5rem] line-clamp-2 text-sm text-muted-foreground">
                            {category.description}
                          </p>
                        ) : (
                          <div className="mt-2 min-h-[2.5rem]" />
                        )}
                        <ChevronRight
                          className={`absolute bottom-4 right-4 h-4 w-4 ${theme.text} opacity-0 transition-opacity group-hover:opacity-100`}
                        />
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
                Les categories seront affichees ici des qu elles seront disponibles.
              </div>
            )}
          </div>
        </section>

        <section className="bg-muted/40 py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-secondary" />
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary">Tendances</span>
                </div>
                <h2 className="text-3xl font-black">Produits a la une</h2>
                <p className="mt-1 text-muted-foreground">Selectionnes pour leur qualite et leur popularite</p>
              </div>
              <Link href="/products" className="hidden md:block">
                <Button variant="outline" className="gap-2 border-primary/25 bg-transparent text-primary hover:bg-primary/5">
                  Tout voir <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {loadingProducts ? (
              <FadeTransition>
                <ProductGridSkeleton count={4} />
              </FadeTransition>
            ) : featuredProducts.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {featuredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="animate-in fade-in-0 slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
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
              <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
                Aucun produit en vitrine pour le moment.
              </div>
            )}

            <div className="mt-10 text-center md:hidden">
              <Link href="/products">
                <Button variant="outline" className="border-primary/25 bg-transparent text-primary">
                  Voir tous les produits <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute right-0 top-[-10rem] size-[500px] rounded-full bg-secondary/10 blur-3xl" />
            <div className="absolute -bottom-20 left-0 size-96 rounded-full bg-white/5 blur-3xl" />
          </div>

          <div className="container relative mx-auto px-4 md:px-6">
            <div className="mb-14 text-center">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-secondary">Pourquoi Glodist</p>
              <h2 className="text-3xl font-black md:text-4xl">
                Commerce de confiance,
                <br />
                <span className="text-secondary">made in Cameroun.</span>
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  icon: <ShieldCheck className="h-7 w-7" />,
                  title: "Vendeurs verifies",
                  desc: "Chaque boutique est controlee pour rassurer les acheteurs et limiter les fraudes.",
                  color: "bg-secondary/20 text-secondary",
                },
                {
                  icon: <Truck className="h-7 w-7" />,
                  title: "Livraison rapide",
                  desc: "Livraison express a Douala et Yaounde pour les commandes les plus urgentes.",
                  color: "bg-blue-400/20 text-blue-300",
                },
                {
                  icon: <MessageCircle className="h-7 w-7" />,
                  title: "Support local",
                  desc: "Une equipe de support proche du terrain pour accompagner acheteurs et vendeurs.",
                  color: "bg-emerald-400/20 text-emerald-300",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-white/10 md:p-8"
                >
                  <div className={`mb-6 flex size-14 items-center justify-center rounded-2xl ${item.color}`}>
                    {item.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-bold">{item.title}</h3>
                  <p className="leading-relaxed text-primary-foreground/65">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {(hasShop || user?.role === "Client") ? (
          <section className="py-20">
            <div className="container mx-auto px-4 md:px-6">
              <div className="flex flex-col items-center justify-between gap-10 rounded-3xl border border-secondary/20 bg-secondary/10 p-8 md:flex-row md:p-16">
                <div className="max-w-lg space-y-5 text-center md:text-left">
                  <p className="text-xs font-bold uppercase tracking-widest text-secondary">Rejoignez-nous</p>
                  <h2 className="text-3xl font-black md:text-4xl">
                    Vendez vos produits
                    <br />
                    sur Glodist
                  </h2>
                  <p className="text-muted-foreground">
                    Creez votre boutique en quelques minutes et touchez des milliers de
                    clients a travers le Cameroun.
                  </p>
                  <div className="flex flex-wrap justify-center gap-6 pt-1 md:justify-start">
                    {[
                      { icon: <Package className="h-4 w-4" />, text: "Inscription gratuite" },
                      { icon: <Users className="h-4 w-4" />, text: "Des milliers de clients" },
                      { icon: <TrendingUp className="h-4 w-4" />, text: "Dashboard complet" },
                    ].map(({ icon, text }) => (
                      <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="text-secondary">{icon}</span>
                        {text}
                      </div>
                    ))}
                  </div>
                </div>

                <Link href={hasShop ? "/dashboard" : "/shop-registration"} className="w-full md:w-auto">
                  <Button
                    size="lg"
                    className="h-14 w-full gap-2 bg-secondary px-8 text-lg font-bold text-secondary-foreground shadow-lg shadow-secondary/25 hover:bg-secondary/90 md:w-auto"
                  >
                    {hasShop ? "Ma Boutique" : "Ouvrir ma boutique"}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <footer className="bg-primary pb-8 pt-16 text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-10 border-b border-white/10 pb-12 md:grid-cols-4">
            <div className="space-y-4">
              <AppLogo className="max-h-14 w-auto" />
              <p className="text-sm leading-relaxed text-primary-foreground/55">
                La centrale d achat intelligente du Cameroun.
              </p>
            </div>

            <div>
              <h4 className="mb-4 font-bold text-primary-foreground/85">Acheter</h4>
              <ul className="space-y-3 text-sm text-primary-foreground/55">
                <li><Link href="/products" className="transition-colors hover:text-secondary">Tous les produits</Link></li>
                <li><Link href="/shops" className="transition-colors hover:text-secondary">Boutiques verifiees</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-bold text-primary-foreground/85">Vendre</h4>
              <ul className="space-y-3 text-sm text-primary-foreground/55">
                {hasShop ? (
                  <li><Link href="/dashboard" className="transition-colors hover:text-secondary">Ma boutique</Link></li>
                ) : user?.role === "Client" ? (
                  <li><Link href="/shop-registration" className="transition-colors hover:text-secondary">Ouvrir une boutique</Link></li>
                ) : null}
                <li><span>Guide du vendeur</span></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-bold text-primary-foreground/85">Aide</h4>
              <ul className="space-y-3 text-sm text-primary-foreground/55">
                <li><span>Service client</span></li>
                <li><span>Conditions d utilisation</span></li>
                <li><span>Confidentialite</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 text-center text-sm text-primary-foreground/35">
            <p>© 2025 Glodist Marketplace. Tous droits reserves.</p>
          </div>
        </div>
      </footer>
    </PageTransition>
  )
}
