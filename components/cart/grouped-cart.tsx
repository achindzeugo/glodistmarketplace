"use client"

import { useState } from "react"
import Image from "next/image"
import { Trash2, Plus, Minus, CheckCircle2, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

// Mock data based on the requirement to group by shop
const CART_DATA = [
  {
    shopId: "1",
    shopName: "Boutique Électro Douala",
    isVerified: true,
    items: [
      { id: "p1", name: "Smartphone Galaxy S23", price: 450000, qty: 1, image: "/modern-smartphone.png" },
      { id: "p2", name: "Écouteurs Sans Fil Pro", price: 25000, qty: 2, image: "/wireless-earbuds-charging-case.png" },
    ],
  },
  {
    shopId: "2",
    shopName: "Mode & Style Yaoundé",
    isVerified: true,
    items: [{ id: "p3", name: "Chaussures en cuir", price: 35000, qty: 1, image: "/assorted-shoes.png" }],
  },
]

export function GroupedCart() {
  const [selectedShops, setSelectedShops] = useState<string[]>([])

  const toggleShopSelection = (shopId: string) => {
    setSelectedShops((prev) => (prev.includes(shopId) ? prev.filter((id) => id !== shopId) : [...prev, shopId]))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-CM", { style: "currency", currency: "XAF" }).format(price)
  }

  const calculateShopTotal = (items: any[]) => {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0)
  }

  const totalSelected = CART_DATA.filter((shop) => selectedShops.includes(shop.shopId)).reduce(
    (sum, shop) => sum + calculateShopTotal(shop.items),
    0,
  )

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        {CART_DATA.map((shop) => (
          <Card key={shop.shopId} className="overflow-hidden border-none shadow-sm ring-1 ring-border">
            <CardHeader className="bg-muted/30 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={`shop-${shop.shopId}`}
                    checked={selectedShops.includes(shop.shopId)}
                    onCheckedChange={() => toggleShopSelection(shop.shopId)}
                  />
                  <div className="flex items-center gap-1.5">
                    <Store className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base font-semibold">{shop.shopName}</CardTitle>
                    {shop.isVerified && <CheckCircle2 className="h-4 w-4 fill-primary text-primary-foreground" />}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-xs text-primary">
                  Voir boutique
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {shop.items.map((item, idx) => (
                <div key={item.id}>
                  <div className="flex items-center gap-4 p-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-md border bg-muted">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <h4 className="text-sm font-medium leading-none">{item.name}</h4>
                      <p className="text-sm font-bold text-primary">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-lg border bg-background">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none">
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.qty}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none">
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {idx < shop.items.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-muted/10 p-4">
              <p className="text-xs text-muted-foreground">Sous-total boutique</p>
              <p className="text-sm font-bold">{formatPrice(calculateShopTotal(shop.items))}</p>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="lg:col-span-1">
        <Card className="sticky top-24 border-none shadow-md ring-1 ring-border">
          <CardHeader>
            <CardTitle>Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Articles sélectionnés</span>
              <span>{selectedShops.length} boutique(s)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Livraison estimée</span>
              <span className="text-green-600 font-medium">Calculée à l'étape suivante</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="font-bold">Total à payer</span>
              <span className="text-xl font-bold text-primary">{formatPrice(totalSelected)}</span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              className="w-full bg-primary py-6 text-base font-bold text-primary-foreground hover:bg-primary/90"
              disabled={selectedShops.length === 0}
            >
              Passer la commande
            </Button>
            <p className="text-center text-[10px] text-muted-foreground">
              En validant, vous acceptez les conditions de vente de Glodist.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
