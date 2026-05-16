"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShieldCheck, Star, ShoppingCart, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthManager } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { getCachedUserShopState } from "@/lib/client-shop-cache"
import { addCartItem } from "@/lib/cart"

interface ProductCardProps {
  id: string
  name: string
  price: number
  image: string
  shop: string
  shopId?: string
  verified: boolean
  rating: number
}

export function ProductCard({ id, name, price, image, shop, shopId, verified, rating }: ProductCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [ownerShopId, setOwnerShopId] = useState<string | null>(null)
  const [shopResolved, setShopResolved] = useState(false)
  const isOwnProduct = !!(shopResolved && ownerShopId && shopId && ownerShopId === shopId)

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
      const userData = AuthManager.getUser()
      const shopState = await getCachedUserShopState(userData)
      const nextShopId = shopState.shopId
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

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()

    if (!AuthManager.isAuthenticated()) {
      toast({
        title: "Connexion requise",
        description: "Connectez-vous pour ajouter au panier",
        variant: "destructive",
      })
      router.push(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    const currentOwnerShopId = await resolveOwnerShopId()

    if (currentOwnerShopId && shopId && currentOwnerShopId === shopId) {
      toast({
        title: "Action impossible",
        description: "Vous ne pouvez pas ajouter votre propre produit a votre panier.",
        variant: "destructive",
      })
      return
    }

    await addCartItem({
      id,
      name,
      price,
      image,
      shop,
      shopId,
    })

    toast({
      title: "Produit ajoute",
      description: `${name} est dans votre panier.`,
    })
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg">
      <Link href={`/product/${id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={image || "/placeholder.svg"}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <button
            onClick={(e) => e.preventDefault()}
            className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-white/90 text-muted-foreground opacity-0 shadow-sm transition-all duration-200 hover:scale-110 hover:text-rose-500 group-hover:opacity-100"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link
          href={shopId ? `/shops/${shopId}` : "/shops"}
          className="flex w-fit items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="max-w-[140px] truncate font-medium">{shop}</span>
          {verified ? <ShieldCheck className="h-3 w-3 shrink-0 fill-secondary text-secondary" /> : null}
        </Link>

        <Link href={`/product/${id}`}>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug transition-colors group-hover:text-primary">
            {name}
          </h3>
        </Link>

        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-base font-black text-primary">
            {price.toLocaleString()}&nbsp;<span className="text-xs font-semibold text-muted-foreground">XAF</span>
          </span>
          <div className="flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-semibold">{rating}</span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <Button
          className="w-full gap-2 bg-primary font-semibold transition-all hover:bg-primary/90"
          onClick={handleAddToCart}
          disabled={isOwnProduct}
        >
          <ShoppingCart className="h-4 w-4" />
          {isOwnProduct ? "Votre produit" : "Ajouter au panier"}
        </Button>
      </div>
    </div>
  )
}
