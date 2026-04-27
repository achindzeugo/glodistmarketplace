import { Navbar } from "@/components/navbar"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"
import { apiFetch, PaginatedResponse, Product } from "@/lib/api"

async function getProducts(search?: string): Promise<Product[]> {
  try {
    const qs = search ? `?search=${encodeURIComponent(search)}&status=active` : "?status=active"
    const data = await apiFetch<PaginatedResponse<Product>>(`/products/${qs}`, {
      next: { revalidate: 60 },
    })
    return data.results
  } catch {
    return []
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { search?: string }
}) {
  const products = await getProducts(searchParams.search)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 md:px-6">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-black">Tous nos produits</h1>
            <form method="GET" className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  name="search"
                  placeholder="Rechercher un produit..."
                  className="pl-10"
                  defaultValue={searchParams.search}
                />
              </div>
              <Button type="submit" variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <p className="text-lg">Aucun produit trouvé.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={String(product.id)}
                  name={product.name}
                  price={parseFloat(product.price)}
                  image={product.medias?.[0]?.url || "/placeholder.svg"}
                  shop={product.shop_name}
                  shopId={product.shop}
                  verified={product.status === "active"}
                  rating={0}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
