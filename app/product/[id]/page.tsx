"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ChevronRight,
  CreditCard,
  Package,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { UserProfileBanner } from "@/components/user-profile-banner"
import { PageTransition } from "@/components/page-transition"
import { BackButton } from "@/components/back-button"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient, Product } from "@/lib/api"
import { AuthManager } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { addCartItem } from "@/lib/cart"

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [ownerShopId, setOwnerShopId] = useState<string | null>(null)
  const [shopResolved, setShopResolved] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await apiClient.getProduct(params.id)
        setProduct(data)
      } catch {
        toast({
          title: "Produit introuvable",
          description: "Ce produit n'existe pas ou n'est plus disponible.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    void fetchProduct()
  }, [params.id, toast])

  const resolveOwnerShopId = async () => {
    if (!AuthManager.isAuthenticated()) {
      setOwnerShopId(null)
      setShopResolved(true)
      return null
    }

    if (shopResolved) {
      return ownerShopId
    }

    try {
      const userShopData = await apiClient.getUserShop()
      const nextShopId = userShopData.shop?.id ? String(userShopData.shop.id) : null
      setOwnerShopId(nextShopId)
      setShopResolved(true)
      return nextShopId
    } catch {
      setOwnerShopId(null)
      setShopResolved(true)
      return null
    }
  }

  useEffect(() => {
    if (!AuthManager.isAuthenticated()) {
      setShopResolved(true)
      return
    }

    void resolveOwnerShopId()
  }, [])

  const addCurrentProductToCart = async () => {
    if (!AuthManager.isAuthenticated()) {
      toast({
        title: "Connexion requise",
        description: "Connectez-vous pour ajouter au panier.",
        variant: "destructive",
      })
      router.push(`/login?returnUrl=/product/${params.id}`)
      return false
    }

    if (!product) {
      return false
    }

    const currentOwnerShopId = await resolveOwnerShopId()

    if (currentOwnerShopId && currentOwnerShopId === product.boutique) {
      toast({
        title: "Action impossible",
        description: "Vous ne pouvez pas ajouter votre propre produit a votre panier.",
        variant: "destructive",
      })
      return false
    }

    addCartItem({
      id: String(product.id),
      name: product.nom,
      price: product.prix,
      image: product.medias?.[0]?.url || "/placeholder.svg",
      shop: product.boutique_nom,
      shopId: product.boutique,
    })

    toast({
      title: "Produit ajoute",
      description: `${product.nom} est dans votre panier.`,
    })

    return true
  }

  const handleAddToCart = async () => {
    await addCurrentProductToCart()
  }

  const handleBuyNow = async () => {
    const added = await addCurrentProductToCart()

    if (added) {
      router.push("/cart")
    }
  }

  return (
    <PageTransition className="min-h-screen bg-background">
      <Navbar />
      <UserProfileBanner />

      <main className="container mx-auto px-4 py-8 md:px-6">
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
          <BackButton href="/products" />
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/products" className="transition-colors hover:text-primary">
            Produits
          </Link>
          {!loading && product ? (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="max-w-[200px] line-clamp-1 font-medium text-foreground">{product.nom}</span>
            </>
          ) : null}
        </nav>

        {loading ? (
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <div className="grid grid-cols-4 gap-3">
                {[...Array(4)].map((_, index) => (
                  <Skeleton key={index} className="aspect-square rounded-xl" />
                ))}
              </div>
            </div>
            <div className="space-y-5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-28 w-full" />
              <div className="flex flex-col gap-4 sm:flex-row">
                <Skeleton className="h-14 flex-1 rounded-xl" />
                <Skeleton className="h-14 flex-1 rounded-xl" />
              </div>
            </div>
          </div>
        ) : !product ? (
          <div className="py-24 text-center">
            <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
            <h2 className="mb-2 text-2xl font-bold">Produit introuvable</h2>
            <p className="mb-8 text-muted-foreground">Ce produit n'est plus disponible ou n'existe pas.</p>
            <Button onClick={() => router.push("/products")}>Voir les produits</Button>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="aspect-square overflow-hidden rounded-2xl border bg-muted">
                <img
                  src={product.medias?.[selectedImage]?.url || "/placeholder.svg"}
                  alt={product.nom}
                  className="h-full w-full object-contain p-4 sm:p-6"
                />
              </div>

              {product.medias && product.medias.length > 1 ? (
                <div className="grid grid-cols-4 gap-3">
                  {product.medias.slice(0, 4).map((media, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square overflow-hidden rounded-xl border bg-muted transition-all ${
                        selectedImage === index
                          ? "border-primary ring-2 ring-primary opacity-100"
                          : "opacity-50 hover:opacity-80"
                      }`}
                    >
                      <img src={media.url || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Link
                  href={`/shops/${product.boutique}`}
                  className="flex items-center gap-1 font-semibold text-primary hover:underline"
                >
                  {product.boutique_nom}
                  <ShieldCheck className="h-3.5 w-3.5 fill-secondary text-secondary" />
                </Link>
                <span>•</span>
                <Badge variant="secondary" className="text-xs">{product.categorie_nom}</Badge>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">4.5</span>
                </div>
              </div>

              <h1 className="text-3xl font-black leading-tight tracking-tight md:text-4xl">{product.nom}</h1>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-3xl font-black text-primary">{product.prix.toLocaleString()} XAF</span>
                <Badge
                  variant="outline"
                  className={
                    product.stock > 0
                      ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                      : "border-red-200 bg-red-50 text-red-600"
                  }
                >
                  {product.stock > 0 ? `En stock (${product.stock} dispo)` : "Rupture de stock"}
                </Badge>
              </div>

              <p className="leading-relaxed text-muted-foreground">{product.description}</p>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button
                  size="lg"
                  className="flex-1 font-bold"
                  disabled={product.stock === 0}
                  onClick={handleBuyNow}
                >
                  Acheter maintenant
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 border-primary/30 bg-transparent text-primary hover:bg-primary/5"
                  disabled={product.stock === 0}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Panier
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 border-t pt-4 sm:grid-cols-3">
                {[
                  { icon: <Truck className="h-5 w-5" />, title: "Livraison rapide", sub: "Douala / Yaounde 24h" },
                  { icon: <CreditCard className="h-5 w-5" />, title: "Paiement securise", sub: "Mobile Money et Cash" },
                  { icon: <RefreshCw className="h-5 w-5" />, title: "Retours faciles", sub: "Satisfait ou rembourse" },
                ].map((valueProp) => (
                  <div key={valueProp.title} className="flex flex-col items-center gap-2 rounded-xl border bg-card p-3 text-center">
                    <span className="text-primary">{valueProp.icon}</span>
                    <div>
                      <p className="text-xs font-bold">{valueProp.title}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">{valueProp.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </PageTransition>
  )
}
