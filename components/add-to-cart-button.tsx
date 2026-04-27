"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCartStore } from "@/lib/cart-store"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/api"

export function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)
  const { toast } = useToast()

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.medias?.[0]?.url || "/placeholder.svg",
      shopId: product.shop,
      shopName: product.shop_name,
    })
    toast({ title: "Ajouté au panier", description: product.name })
  }

  return (
    <div className="flex gap-4">
      <Button
        size="lg"
        className="flex-1 h-14 text-lg font-bold"
        disabled={product.stock === 0}
        onClick={handleAdd}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        {product.stock === 0 ? "Rupture de stock" : "Ajouter au panier"}
      </Button>
    </div>
  )
}
