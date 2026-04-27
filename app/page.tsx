import { Navbar } from "@/components/navbar"
import { ProductCard } from "@/components/product-card"
import { ShieldCheck, Truck, Users, ArrowRight, Zap, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { apiFetch, PaginatedResponse, Product } from "@/lib/api"

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const data = await apiFetch<PaginatedResponse<Product>>(
      "/products/?status=active&ordering=-created_at",
      { next: { revalidate: 120 } }
    )
    return data.results.slice(0, 4)
  } catch {
    return []
  }
}

const CATEGORIES = [
  { name: "Électronique", icon: Zap },
  { name: "Mode", icon: ShoppingBag },
  { name: "Maison", icon: Users },
  { name: "Beauté", icon: ArrowRight },
]

export default async function Home() {
  const products = await getFeaturedProducts()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-primary text-primary-foreground py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold">
                  <ShieldCheck className="h-4 w-4 text-secondary" />
                  Marketplace N°1 de confiance au Cameroun
                </div>
                <h1 className="text-4xl font-black tracking-tight md:text-6xl leading-tight">
                  Tout ce dont vous avez besoin,{" "}
                  <span className="text-secondary">en un clic.</span>
                </h1>
                <p className="text-lg text-primary-foreground/80 max-w-lg">
                  Rejoignez Glodist pour une expérience d'achat sécurisée avec des vendeurs locaux vérifiés.
                  Livraison rapide sur Douala et Yaoundé.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link href="/products">
                    <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold">
                      Découvrir les produits
                    </Button>
                  </Link>
                  <Link href="/shop-registration">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
                      Devenir vendeur
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block relative">
                <div className="aspect-[4/3] rounded-3xl bg-white/10 backdrop-blur-sm overflow-hidden border border-white/20">
                  <img src="/modern-smartphone.png" alt="Hero" className="w-full h-full object-contain p-12 drop-shadow-2xl" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Catégories populaires</h2>
              <Link href="/products">
                <Button variant="ghost" className="text-primary font-bold">
                  Tout voir <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CATEGORIES.map((cat) => (
                <Link key={cat.name} href={`/products?search=${cat.name}`}>
                  <div className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:border-primary hover:shadow-sm transition-all cursor-pointer">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <cat.icon className="h-5 w-5" />
                    </div>
                    <span className="font-bold">{cat.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight">Produits à la une</h2>
                <p className="text-muted-foreground">Sélectionnés pour leur qualité et fiabilité.</p>
              </div>
              <Link href="/products">
                <Button variant="outline" className="hidden md:flex border-primary text-primary bg-transparent">
                  Voir tous les produits
                </Button>
              </Link>
            </div>
            {products.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    id={String(p.id)}
                    name={p.name}
                    price={parseFloat(p.price)}
                    image={p.medias?.[0]?.url || "/placeholder.svg"}
                    shop={p.shop_name}
                    shopId={p.shop}
                    verified={p.status === "active"}
                    rating={0}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Aucun produit disponible pour le moment.</p>
              </div>
            )}
          </div>
        </section>

        {/* Trust */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-12 md:grid-cols-3">
              {[
                { icon: ShieldCheck, color: "primary", title: "Vendeurs Vérifiés", desc: "Chaque boutique est vérifiée par identité pour garantir des transactions 100% sécurisées." },
                { icon: Truck, color: "secondary", title: "Livraison Locale", desc: "Bénéficiez d'une livraison rapide à domicile partout au Cameroun." },
                { icon: Users, color: "primary", title: "Support 24/7", desc: "Notre équipe locale est disponible via WhatsApp pour vous assister à tout moment." },
              ].map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className="space-y-4 text-center md:text-left">
                  <div className={`size-16 rounded-2xl bg-${color}/10 flex items-center justify-center text-${color} mx-auto md:mx-0`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-1">
                <span className="text-xl font-black tracking-tighter text-secondary">Glo</span>
                <span className="text-xl font-black tracking-tighter text-primary">Dist</span>
              </div>
              <p className="text-sm text-muted-foreground">
                La centrale d'achat intelligente qui transforme le e-commerce au Cameroun.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Acheter</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/products" className="hover:text-primary transition-colors">Tous les produits</Link></li>
                <li><Link href="/shops" className="hover:text-primary transition-colors">Boutiques</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Vendre</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/shop-registration" className="hover:text-primary transition-colors">Ouvrir une boutique</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary transition-colors">Mon tableau de bord</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Aide</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/profile" className="hover:text-primary transition-colors">Mon compte</Link></li>
                <li><span>Conditions d'utilisation</span></li>
                <li><span>Confidentialité</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2026 Glodist Marketplace. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
