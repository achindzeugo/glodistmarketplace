import { Navbar } from "@/components/navbar"
import { ProductCard } from "@/components/product-card"
import { ShieldCheck, Truck, Users, ArrowRight, Zap, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  const featuredProducts = [
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
  ]

  const categories = [
    { name: "Électronique", icon: <Zap className="h-5 w-5" /> },
    { name: "Mode", icon: <ShoppingBag className="h-5 w-5" /> },
    { name: "Maison", icon: <Users className="h-5 w-5" /> },
    { name: "Beauté", icon: <ArrowRight className="h-5 w-5" /> },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold">
                  <ShieldCheck className="h-4 w-4 text-secondary" />
                  Marketplace N°1 de confiance au Cameroun
                </div>
                <h1 className="text-4xl font-black tracking-tight md:text-6xl leading-tight">
                  Tout ce dont vous avez besoin, <span className="text-secondary">en un clic.</span>
                </h1>
                <p className="text-lg text-primary-foreground/80 max-w-lg">
                  Rejoignez Glodist pour une expérience d'achat sécurisée avec des vendeurs locaux vérifiés. Livraison
                  rapide sur Douala et Yaoundé.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link href="/products">
                    <Button
                      size="lg"
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold"
                    >
                      Découvrir les produits
                    </Button>
                  </Link>
                  <Link href="/shop-registration">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white text-white hover:bg-white/10 bg-transparent"
                    >
                      Devenir vendeur
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block relative">
                <div className="aspect-[4/3] rounded-3xl bg-white/10 backdrop-blur-sm overflow-hidden border border-white/20">
                  <img
                    src="/modern-smartphone.png"
                    alt="Hero Image"
                    className="w-full h-full object-contain p-12 drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Catégories populaires</h2>
              <Button variant="ghost" className="text-primary font-bold">
                Tout voir <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:border-primary hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {cat.icon}
                  </div>
                  <span className="font-bold">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight">Produits à la une</h2>
                <p className="text-muted-foreground">Sélectionnés par nos experts pour leur qualité et fiabilité.</p>
              </div>
              <Link href="/products">
                <Button variant="outline" className="hidden md:flex border-primary text-primary bg-transparent">
                  Voir tous les produits
                </Button>
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-12 md:grid-cols-3">
              <div className="space-y-4 text-center md:text-left">
                <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto md:mx-0">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Vendeurs Vérifiés</h3>
                <p className="text-muted-foreground">
                  Chaque boutique sur Glodist est vérifiée par identité pour garantir des transactions 100% sécurisées.
                </p>
              </div>
              <div className="space-y-4 text-center md:text-left">
                <div className="size-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mx-auto md:mx-0">
                  <Truck className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Livraison Locale</h3>
                <p className="text-muted-foreground">
                  Nous comprenons le terrain. Bénéficiez d'une livraison rapide à domicile partout au Cameroun.
                </p>
              </div>
              <div className="space-y-4 text-center md:text-left">
                <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto md:mx-0">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Support 24/7</h3>
                <p className="text-muted-foreground">
                  Une question ? Notre équipe locale est disponible via WhatsApp pour vous assister à tout moment.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="size-8 rounded bg-primary flex items-center justify-center">
                  <span className="font-bold text-primary-foreground">G</span>
                </div>
                <span className="text-xl font-bold tracking-tight text-primary">GLODIST</span>
              </div>
              <p className="text-sm text-muted-foreground">
                La centrale d'achat intelligente qui transforme le e-commerce au Cameroun.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Acheter</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Catégories</li>
                <li>Promotions</li>
                <li>Vendeurs vérifiés</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Vendre</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <Link href="/shop-registration" className="hover:text-primary transition-colors">
                  <li>Ouvrir une boutique</li>
                </Link>
                <li>Guide du vendeur</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Aide</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Service client</li>
                <li>Conditions d'utilisation</li>
                <li>Confidentialité</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2025 Glodist Marketplace. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
