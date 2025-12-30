"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, Minus, Store, ShieldCheck, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"

const cartItems = [
  {
    shopId: "shop-1",
    shopName: "Douala Tech Hub",
    isVerified: true,
    items: [
      { id: 1, name: "iPhone 15 Pro", price: 850000, quantity: 1, image: "/modern-smartphone.png" },
      { id: 2, name: "AirPods Pro", price: 150000, quantity: 2, image: "/wireless-earbuds-charging-case.png" },
    ],
  },
  {
    shopId: "shop-2",
    shopName: "Yaoundé Fashion",
    isVerified: false,
    items: [{ id: 3, name: "Chaussures Sport", price: 45000, quantity: 1, image: "/assorted-shoes.png" }],
  },
]

export default function CartPage() {
  const total = cartItems.reduce(
    (acc, shop) => acc + shop.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    0,
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10 md:px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-primary">Votre Panier</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((shop) => (
              <div key={shop.shopId} className="rounded-2xl border border-primary/10 bg-card overflow-hidden shadow-sm">
                <div className="bg-primary/5 px-4 py-4 flex items-center justify-between border-b border-primary/10">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`shop-${shop.shopId}`}
                      className="border-primary/30 data-[state=checked]:bg-primary"
                    />
                    <div className="flex items-center space-x-2">
                      <Store className="h-5 w-5 text-primary" />
                      <span className="font-black text-sm uppercase tracking-tighter text-primary">
                        {shop.shopName}
                      </span>
                      {shop.isVerified && <ShieldCheck className="h-4 w-4 text-secondary fill-secondary" />}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[10px] h-7 bg-white/50 border border-primary/10 text-primary font-bold hover:bg-primary/10 uppercase tracking-widest"
                  >
                    Commander cette boutique uniquement
                  </Button>
                </div>

                <div className="divide-y divide-primary/5">
                  {shop.items.map((item) => (
                    <div key={item.id} className="p-5 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                      <Checkbox className="border-primary/30 data-[state=checked]:bg-primary" />
                      <div className="relative h-24 w-24 flex-shrink-0 rounded-xl overflow-hidden bg-muted border border-primary/5">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base sm:text-lg text-primary">{item.name}</h3>
                        <p className="text-secondary font-black mt-1 text-lg">{item.price.toLocaleString()} XAF</p>
                      </div>
                      <div className="flex flex-col items-end justify-between self-stretch">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center border border-primary/20 rounded-lg bg-background overflow-hidden">
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none hover:bg-primary/5">
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-10 text-center text-sm font-bold text-primary">{item.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none hover:bg-primary/5">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border-2 border-primary/10 bg-card/80 backdrop-blur-xl p-8 shadow-xl shadow-primary/5">
              <h2 className="text-2xl font-black mb-6 text-primary tracking-tight">Résumé</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-muted-foreground">Articles (4)</span>
                  <span className="text-primary">{total.toLocaleString()} XAF</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-muted-foreground">Livraison estimée</span>
                  <span className="text-secondary font-black">À calculer</span>
                </div>
                <div className="border-t-2 border-dashed border-primary/10 pt-6 flex justify-between items-end">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total</span>
                  <span className="text-3xl font-black text-primary tracking-tighter">
                    {total.toLocaleString()} XAF
                  </span>
                </div>
                <Button className="w-full bg-primary text-primary-foreground py-8 text-xl font-black uppercase tracking-tighter shadow-2xl shadow-primary/30 hover:bg-primary/90 mt-4 rounded-xl">
                  Valider le paiement
                </Button>

                <div className="mt-8 space-y-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center mb-4">
                    Paiements acceptés
                  </p>
                  <div className="flex items-center justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                    <div className="h-8 w-12 bg-muted rounded flex items-center justify-center font-bold text-[10px]">
                      MTN
                    </div>
                    <div className="h-8 w-12 bg-muted rounded flex items-center justify-center font-bold text-[10px]">
                      ORANGE
                    </div>
                    <div className="h-8 w-12 bg-muted rounded flex items-center justify-center font-bold text-[10px]">
                      VISA
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
