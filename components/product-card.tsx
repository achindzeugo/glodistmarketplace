import Link from "next/link"
import { ShieldCheck, Star, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProductCardProps {
  id: string
  name: string
  price: number
  image: string
  shop: string
  verified: boolean
  rating: number
}

export function ProductCard({ id, name, price, image, shop, verified, rating }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all">
      <CardHeader className="p-0">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={image || "/placeholder.svg"}
            alt={name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          <Badge className="absolute left-3 top-3 bg-white/90 text-primary font-bold hover:bg-white">-10%</Badge>
          <Button
            size="icon"
            variant="secondary"
            className="absolute right-3 top-3 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Star className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link
            href={`/shops/${shop.toLowerCase().replace(/\s+/g, "-")}`}
            className="font-medium hover:text-primary transition-colors flex items-center gap-1"
          >
            {shop}
            {verified && <ShieldCheck className="h-3 w-3 text-secondary fill-secondary" />}
          </Link>
        </div>
        <Link href={`/product/${id}`} className="block group-hover:text-primary transition-colors">
          <h3 className="font-bold leading-tight line-clamp-2">{name}</h3>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary">{price.toLocaleString()} XAF</span>
          <div className="flex items-center gap-0.5 ml-auto">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-semibold">{rating}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full bg-primary hover:bg-primary/90">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Ajouter au panier
        </Button>
      </CardFooter>
    </Card>
  )
}
