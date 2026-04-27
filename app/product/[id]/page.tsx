import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Truck, CreditCard, RefreshCw } from "lucide-react"
import { apiFetch, Product } from "@/lib/api"
import { notFound } from "next/navigation"
import { AddToCartButton } from "@/components/add-to-cart-button"

async function getProduct(id: string): Promise<Product> {
  return apiFetch<Product>(`/products/${id}/`, { next: { revalidate: 60 } })
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  let product: Product
  try {
    product = await getProduct(params.id)
  } catch {
    notFound()
  }

  const mainImage = product.medias?.[0]?.url || "/placeholder.svg"

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 md:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-2xl bg-muted border">
              <img src={mainImage} alt={product.name} className="h-full w-full object-contain" />
            </div>
            {product.medias.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.medias.slice(0, 4).map((m) => (
                  <div key={m.id} className="aspect-square rounded-lg bg-muted border overflow-hidden opacity-60 hover:opacity-100 cursor-pointer transition-opacity">
                    <img src={m.url} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-semibold text-primary">{product.shop_name}</span>
                {product.status === "active" && <ShieldCheck className="h-4 w-4 text-secondary fill-secondary" />}
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{product.name}</h1>
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-black text-primary">
                  {parseFloat(product.price).toLocaleString()} XAF
                </span>
                <Badge
                  variant="outline"
                  className={product.stock > 0 ? "text-green-600 border-green-200 bg-green-50" : "text-red-600 border-red-200 bg-red-50"}
                >
                  {product.stock > 0 ? `En stock (${product.stock})` : "Rupture de stock"}
                </Badge>
              </div>
              {product.category_label && (
                <Badge variant="secondary">{product.category_label}</Badge>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed text-lg">{product.description}</p>

            <AddToCartButton product={product} />

            <div className="grid grid-cols-1 gap-4 pt-8 md:grid-cols-3">
              {[
                { icon: Truck, title: "Livraison Rapide", desc: "Douala / Yaoundé en 24h" },
                { icon: CreditCard, title: "Paiement Sécurisé", desc: "Mobile Money & Cash" },
                { icon: RefreshCw, title: "Retours Faciles", desc: "Satisfait ou remboursé" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3 p-4 rounded-xl border bg-card">
                  <Icon className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-bold text-sm">{title}</h4>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
