"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ImagePlus,
  LayoutDashboard,
  Loader2,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  Store,
  TrendingUp,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AuthManager } from "@/lib/auth"
import { apiClient, ShopOrder, ShopStats } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

type Boutique = {
  id: number
  name: string
  description: string
  validation_status?: string
  owner_name?: string
  total_products?: number
}

type Category = {
  id: number
  libelle: string
}

type Product = {
  id: number
  nom: string
  description: string
  prix: number
  stock: number
  statut_produit: string
  categorie_nom: string
  medias: { url: string }[]
}

type CustomerSummary = {
  name: string
  email: string
  orders: number
  totalSpent: number
}

function formatAmount(value: number) {
  return `${value.toLocaleString()} XAF`
}

function formatDate(value: string) {
  if (!value) {
    return "Date inconnue"
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value))
}

function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "delivered":
    case "livree":
    case "livre":
      return <Badge className="bg-secondary/10 text-secondary border-secondary/20">Livree</Badge>
    case "pending":
    case "en attente":
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200">En attente</Badge>
    case "processing":
    case "en cours":
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">En cours</Badge>
    case "cancelled":
    case "annulee":
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Annulee</Badge>
    default:
      return <Badge variant="outline">{status || "Inconnu"}</Badge>
  }
}

export default function ShopDashboard() {
  const router = useRouter()
  const { toast } = useToast()

  const [shop, setShop] = useState<Partial<Boutique>>({})
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<ShopOrder[]>([])
  const [shopStats, setShopStats] = useState<ShopStats | null>(null)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null)
  const [isSavingProduct, setIsSavingProduct] = useState(false)
  const [isDeletingProduct, setIsDeletingProduct] = useState(false)
  const [newProduct, setNewProduct] = useState({
    nom: "",
    description: "",
    prix: "",
    stock: "",
    categorie: "",
  })
  const [editProductForm, setEditProductForm] = useState({
    nom: "",
    prix: "",
    stock: "",
    statut_produit: "actif",
  })

  useEffect(() => {
    const fetchBaseData = async () => {
      if (!AuthManager.isAuthenticated()) {
        router.push("/login")
        return
      }

      try {
        const categoryResponse = await fetch("/api/products/categories")
        if (!categoryResponse.ok) {
          throw new Error(`Impossible de charger les categories (${categoryResponse.statusText})`)
        }

        const categoryData = await categoryResponse.json()
        setCategories(categoryData.results || [])
      } catch (error: any) {
        console.error(error)
        toast({
          title: "Erreur categories",
          description: error.message || "Impossible de charger les categories de produits.",
          variant: "destructive",
        })
      }

      try {
        const shopResponse = await fetch("/api/user/shop", { credentials: "include" })
        if (!shopResponse.ok) {
          throw new Error("Boutique non trouvee.")
        }

        const shopData = await shopResponse.json()

        if (shopData.shop?.id) {
          setShop(shopData.shop)
        } else {
          toast({
            title: "Aucune boutique",
            description: "Vous n'avez pas encore de boutique.",
          })
          router.push("/shop-registration")
        }
      } catch (error) {
        console.error(error)
        router.push("/")
      }
    }

    fetchBaseData()
  }, [router, toast])

  useEffect(() => {
    const fetchProducts = async () => {
      if (!shop?.id) {
        return
      }

      setIsLoadingProducts(true)

      try {
        const response = await fetch(`/api/products/?boutique=${shop.id}`, {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error(`Impossible de charger les produits (${response.statusText})`)
        }

        const data = await response.json()
        setProducts(data || [])
      } catch (error: any) {
        console.error(error)
        toast({
          title: "Erreur produits",
          description: error.message || "Impossible de charger vos produits.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingProducts(false)
      }
    }

    fetchProducts()
  }, [shop?.id, toast])

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!shop?.id) {
        return
      }

      setIsLoadingStats(true)
      setIsLoadingOrders(true)

      try {
        const [statsResponse, ordersResponse] = await Promise.all([
          apiClient.getShopStats(String(shop.id)),
          apiClient.getShopOrders(String(shop.id)),
        ])

        setShopStats(statsResponse)
        setOrders(ordersResponse.orders || [])
      } catch (error: any) {
        console.error(error)
        toast({
          title: "Erreur boutique",
          description: error.message || "Impossible de charger les statistiques de la boutique.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingStats(false)
        setIsLoadingOrders(false)
      }
    }

    fetchAnalytics()
  }, [shop?.id, toast])

  const handleNewProductChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target
    setNewProduct((prev) => ({ ...prev, [id]: value }))
  }

  const handleProductSubmit = async () => {
    if (!newProduct.nom || !newProduct.prix || !newProduct.stock || !newProduct.categorie) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      })
      return
    }

    if (!shop?.id) {
      toast({
        title: "Erreur",
        description: "ID de la boutique introuvable.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        nom: newProduct.nom,
        description: newProduct.description,
        prix: parseFloat(newProduct.prix),
        stock: parseInt(newProduct.stock, 10),
        categorie: parseInt(newProduct.categorie, 10),
        boutique: shop.id,
        statut_produit: "actif",
      }

      const response = await fetch("/api/products/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        const specificError =
          errorData.details?.name?.[0] ||
          errorData.details?.nom?.[0] ||
          errorData.error ||
          "Une erreur est survenue."

        throw new Error(specificError)
      }

      const createdProduct = await response.json()

      toast({
        title: "Produit ajoute",
        description: `'${newProduct.nom}' a ete ajoute avec succes a votre boutique.`,
      })

      setNewProduct({ nom: "", description: "", prix: "", stock: "", categorie: "" })
      setShowAddProduct(false)
      setProducts((prevProducts) => [createdProduct, ...prevProducts])
    } catch (error: any) {
      toast({
        title: "Erreur lors de l'ajout",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditProduct = (product: Product) => {
    setEditingProduct(product)
    setEditProductForm({
      nom: product.nom,
      prix: String(product.prix),
      stock: String(product.stock),
      statut_produit: product.statut_produit || "actif",
    })
  }

  const handleEditProductChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target
    setEditProductForm((prev) => ({ ...prev, [id]: value }))
  }

  const handleSaveProduct = async () => {
    if (!editingProduct?.id) {
      return
    }

    setIsSavingProduct(true)

    try {
      const updatedProduct = await apiClient.updateProduct(String(editingProduct.id), {
        nom: editProductForm.nom,
        prix: Number(editProductForm.prix),
        stock: Number(editProductForm.stock),
        statut_produit: editProductForm.statut_produit,
      })

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === updatedProduct.id ? updatedProduct : product
        )
      )

      toast({
        title: "Produit mis a jour",
        description: `Les informations de '${updatedProduct.nom}' ont ete enregistrees.`,
      })

      setEditingProduct(null)
    } catch (error: any) {
      toast({
        title: "Erreur de mise a jour",
        description: error.message || "Impossible de modifier le produit.",
        variant: "destructive",
      })
    } finally {
      setIsSavingProduct(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!editingProduct?.id) {
      return
    }

    setIsDeletingProduct(true)

    try {
      await apiClient.deleteProduct(String(editingProduct.id))
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== editingProduct.id)
      )

      toast({
        title: "Produit supprime",
        description: "Le produit a ete retire de votre boutique.",
      })

      setEditingProduct(null)
    } catch (error: any) {
      toast({
        title: "Erreur de suppression",
        description: error.message || "Impossible de supprimer le produit.",
        variant: "destructive",
      })
    } finally {
      setIsDeletingProduct(false)
    }
  }

  const customers: CustomerSummary[] = Object.values(
    orders.reduce<Record<string, CustomerSummary>>((accumulator, order) => {
      const key = order.customer_email || order.customer || order.id

      if (!accumulator[key]) {
        accumulator[key] = {
          name: order.customer || "Client",
          email: order.customer_email || "Non renseigne",
          orders: 0,
          totalSpent: 0,
        }
      }

      accumulator[key].orders += 1
      accumulator[key].totalSpent += order.total

      return accumulator
    }, {})
  )

  const overviewStats = [
    {
      label: "Ventes totales",
      value: isLoadingStats ? "..." : formatAmount(shopStats?.sales.total_revenue || 0),
      icon: TrendingUp,
      color: "text-secondary",
    },
    {
      label: "Commandes",
      value: isLoadingStats ? "..." : String(shopStats?.sales.total_orders || 0),
      icon: ShoppingBag,
      color: "text-primary",
    },
    {
      label: "Produits actifs",
      value: isLoadingStats ? "..." : String(shopStats?.products.active || 0),
      icon: Package,
      color: "text-primary",
    },
    {
      label: "Stock total",
      value: isLoadingStats ? "..." : `${shopStats?.products.total_stock || 0} pcs`,
      icon: Users,
      color: "text-destructive",
    },
  ]

  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="hidden w-64 border-r bg-card md:block">
        <div className="flex h-full flex-col gap-2 p-4">
          <Link href="/" className="flex items-center gap-2 px-2 py-6 mb-2">
            <ArrowLeft className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-primary">Retour au site</span>
          </Link>

          <div className="flex items-center gap-3 px-2 py-4 border-y border-primary/10 mb-6 bg-primary/5 rounded-lg">
            <div className="size-10 rounded-full bg-primary flex items-center justify-center border-2 border-white">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-black text-sm truncate uppercase tracking-tighter text-primary">
                {shop.name || ""}
              </p>
              <p className="text-[10px] text-muted-foreground font-bold">
                {shop.validation_status === "validated" ? "BOUTIQUE VALIDEE" : "VALIDATION EN COURS"}
              </p>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: "overview", label: "Tableau de bord", icon: LayoutDashboard },
              { id: "products", label: "Mes Produits", icon: Package },
              { id: "orders", label: "Commandes Client", icon: ShoppingBag },
              { id: "customers", label: "Clients", icon: Users },
            ].map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 ${activeTab === item.id ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
                onClick={() => {
                  setActiveTab(item.id)
                  setShowAddProduct(false)
                }}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>

          <div className="mt-auto">
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
              <Settings className="h-4 w-4" />
              Configuration
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-8 md:hidden">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold">
            <ArrowLeft className="h-4 w-4" />
            Quitter
          </Link>
          <Badge className="bg-primary">Ma Boutique</Badge>
        </div>

        {showAddProduct ? (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setShowAddProduct(false)} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Annuler
              </Button>
              <h2 className="text-xl font-bold">Nouveau Produit</h2>
            </div>

            <Card className="border-primary/10">
              <CardContent className="p-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom du produit</Label>
                    <Input id="nom" value={newProduct.nom} onChange={handleNewProductChange} placeholder="Ex: iPhone 16 Pro" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categorie">Categorie</Label>
                    <select
                      id="categorie"
                      value={newProduct.categorie}
                      onChange={handleNewProductChange}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="" disabled>Selectionner une categorie</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.libelle}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={handleNewProductChange}
                    placeholder="Details du produit..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="prix">Prix (XAF)</Label>
                    <Input id="prix" type="number" value={newProduct.prix} onChange={handleNewProductChange} placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock disponible</Label>
                    <Input id="stock" type="number" value={newProduct.stock} onChange={handleNewProductChange} placeholder="0" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Image du produit</Label>
                  <div className="border-2 border-dashed border-primary/10 rounded-xl p-8 text-center hover:border-primary/30 transition-colors cursor-pointer">
                    <ImagePlus className="h-10 w-10 mx-auto text-primary/20" />
                    <p className="text-sm font-medium mt-2">Cliquez pour ajouter une image</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG jusqu'a 5Mo</p>
                  </div>
                </div>

                <Button className="w-full py-6 font-bold" onClick={handleProductSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Enregistrement..." : "Enregistrer le produit"}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-primary">
                  {shop.name || "Ma Boutique"}
                </h1>
                <p className="text-muted-foreground">
                  {activeTab === "overview" && "Vue d'ensemble de votre activite"}
                  {activeTab === "products" && "Gestion de vos produits"}
                  {activeTab === "orders" && "Suivi de vos commandes client"}
                  {activeTab === "customers" && "Resume des clients depuis les commandes"}
                </p>
              </div>
              <Button
                className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold px-6 shadow-lg shadow-secondary/20"
                onClick={() => setShowAddProduct(true)}
              >
                <Plus className="h-4 w-4" />
                Ajouter un produit
              </Button>
            </div>

            {activeTab === "overview" && (
              <div className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {overviewStats.map((stat) => (
                    <Card key={stat.label} className="border-primary/10 bg-card/50">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          {stat.label}
                        </span>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-black tracking-tighter">{stat.value}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                  <Card className="border-primary/5">
                    <CardHeader>
                      <CardTitle className="text-lg">Commandes recentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingOrders ? (
                        <div className="py-10 text-center">
                          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                        </div>
                      ) : orders.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucune commande disponible pour le moment.</p>
                      ) : (
                        <div className="space-y-4">
                          {orders.slice(0, 3).map((order) => (
                            <div
                              key={order.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-primary/5"
                            >
                              <div>
                                <p className="font-bold text-sm">{order.customer}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  {order.id} • {formatDate(order.date)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-sm text-primary">{formatAmount(order.total)}</p>
                                {getStatusBadge(order.status)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-primary/5">
                    <CardHeader>
                      <CardTitle className="text-lg">Top Produits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingProducts ? (
                        <div className="py-10 text-center">
                          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                        </div>
                      ) : products.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucun produit trouve.</p>
                      ) : (
                        <div className="space-y-4">
                          {products.slice(0, 3).map((product) => (
                            <div key={product.id} className="flex items-center gap-4">
                              <div className="size-10 rounded bg-muted flex items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground/30" />
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-sm">{product.nom}</p>
                                <p className="text-xs text-muted-foreground">{product.categorie_nom}</p>
                              </div>
                              <p className="font-black text-secondary">{formatAmount(product.prix)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "products" && (
              <Card className="border-primary/10 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-bold">Produit</TableHead>
                      <TableHead className="font-bold">Categorie</TableHead>
                      <TableHead className="font-bold text-right">Prix</TableHead>
                      <TableHead className="font-bold text-center">Stock</TableHead>
                      <TableHead className="font-bold">Statut</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingProducts ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                          <p className="mt-2 text-sm text-muted-foreground">Chargement des produits...</p>
                        </TableCell>
                      </TableRow>
                    ) : products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <Package className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                          <h3 className="mt-4 font-bold">Aucun produit trouve</h3>
                          <p className="text-sm text-muted-foreground mt-1">Commencez par ajouter votre premier produit.</p>
                          <Button className="mt-4" onClick={() => setShowAddProduct(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter un produit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.nom}</TableCell>
                          <TableCell className="text-xs">{product.categorie_nom}</TableCell>
                          <TableCell className="text-right font-bold text-primary">
                            {formatAmount(product.prix)}
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                product.stock < 5 ? "bg-destructive/10 text-destructive" : "bg-secondary/10 text-secondary"
                              }`}
                            >
                              {product.stock} pcs
                            </span>
                          </TableCell>
                          <TableCell>{getStatusBadge(product.statut_produit)}</TableCell>
                          <TableCell className="text-right">
                            <Dialog
                              open={editingProduct?.id === product.id}
                              onOpenChange={(open) => !open && setEditingProduct(null)}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-primary"
                                  onClick={() => openEditProduct(product)}
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                  <DialogTitle>Modifier le produit</DialogTitle>
                                  <DialogDescription>
                                    Mettez a jour les informations de {product.nom}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-name">Nom</Label>
                                    <Input
                                      id="nom"
                                      value={editProductForm.nom}
                                      onChange={handleEditProductChange}
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-price">Prix (XAF)</Label>
                                      <Input
                                        id="prix"
                                        type="number"
                                        value={editProductForm.prix}
                                        onChange={handleEditProductChange}
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-stock">Stock</Label>
                                      <Input
                                        id="stock"
                                        type="number"
                                        value={editProductForm.stock}
                                        onChange={handleEditProductChange}
                                      />
                                    </div>
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-status">Statut</Label>
                                    <select
                                      id="statut_produit"
                                      className="w-full h-10 px-3 rounded-md border"
                                      value={editProductForm.statut_produit}
                                      onChange={handleEditProductChange}
                                    >
                                      <option value="actif">actif</option>
                                      <option value="inactif">inactif</option>
                                      <option value="rupture">rupture</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="flex gap-3">
                                  <Button
                                    variant="outline"
                                    className="flex-1 border-destructive text-destructive hover:bg-destructive/5 bg-transparent"
                                    onClick={handleDeleteProduct}
                                    disabled={isDeletingProduct || isSavingProduct}
                                  >
                                    {isDeletingProduct ? "Suppression..." : "Supprimer"}
                                  </Button>
                                  <Button
                                    className="flex-1 bg-secondary text-secondary-foreground"
                                    onClick={handleSaveProduct}
                                    disabled={isSavingProduct || isDeletingProduct}
                                  >
                                    {isSavingProduct ? "Enregistrement..." : "Enregistrer"}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            )}

            {activeTab === "orders" && (
              <div className="space-y-4">
                {isLoadingOrders ? (
                  <Card className="border-primary/10">
                    <CardContent className="py-12 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                      <p className="mt-3 text-sm text-muted-foreground">Chargement des commandes...</p>
                    </CardContent>
                  </Card>
                ) : orders.length === 0 ? (
                  <Card className="border-primary/10">
                    <CardContent className="py-12 text-center">
                      <ShoppingBag className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                      <h3 className="mt-4 font-bold">Aucune commande pour le moment</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Les commandes de votre boutique apparaitront ici.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  orders.map((order) => (
                    <Card
                      key={order.id}
                      className="border-primary/10 hover:border-primary/30 transition-all cursor-pointer group"
                    >
                      <CardContent className="p-0">
                        <div className="p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="flex gap-4 items-center">
                            <div className="size-12 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                              <ShoppingBag className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-sm">{order.id}</span>
                                {getStatusBadge(order.status)}
                              </div>
                              <p className="text-sm text-muted-foreground font-medium">Client: {order.customer}</p>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold mt-0.5">
                                {formatDate(order.date)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:text-right border-t md:border-0 pt-4 md:pt-0">
                            <div className="md:mr-8">
                              <p className="text-[10px] text-muted-foreground font-bold uppercase">Montant Total</p>
                              <p className="font-black text-lg text-primary">{formatAmount(order.total)}</p>
                            </div>

                            <Dialog
                              open={selectedOrder?.id === order.id}
                              onOpenChange={(open) => !open && setSelectedOrder(null)}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-9 px-4 border-primary/20 hover:bg-primary/5 text-primary bg-transparent"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedOrder(order)
                                  }}
                                >
                                  Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center justify-between pr-8">
                                    Commande {order.id}
                                    {getStatusBadge(order.status)}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6 py-4">
                                  <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
                                    <div>
                                      <p className="text-muted-foreground font-bold uppercase text-[10px]">Client</p>
                                      <p className="font-bold">{order.customer}</p>
                                      <p className="text-xs text-muted-foreground">{order.customer_email || "Email non renseigne"}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground font-bold uppercase text-[10px]">Date de commande</p>
                                      <p className="font-bold">{formatDate(order.date)}</p>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <p className="text-muted-foreground font-bold uppercase text-[10px]">
                                      Produits commandes
                                    </p>
                                    <div className="space-y-2">
                                      {order.items.length === 0 ? (
                                        <div className="text-sm text-muted-foreground">
                                          Aucun detail produit n'a ete retourne par l'API.
                                        </div>
                                      ) : (
                                        order.items.map((item) => (
                                          <div key={item.id} className="flex justify-between text-sm items-center p-2 bg-muted/50 rounded">
                                            <div className="flex gap-2 items-center">
                                              <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                                                <Package className="w-5 h-5 opacity-20" />
                                              </div>
                                              <div>
                                                <p className="font-bold">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">Quantite: {item.quantity}</p>
                                              </div>
                                            </div>
                                            <p className="font-black">{formatAmount(item.total)}</p>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex justify-between items-center pt-4 border-t">
                                    <p className="font-black">TOTAL</p>
                                    <p className="font-black text-xl text-primary">{formatAmount(order.total)}</p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {activeTab === "customers" && (
              <Card className="border-primary/10 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-bold">Nom du Client</TableHead>
                      <TableHead className="font-bold">Email</TableHead>
                      <TableHead className="font-bold text-center">Commandes</TableHead>
                      <TableHead className="font-bold text-right">Total depense</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12">
                          <Users className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                          <p className="mt-3 text-sm text-muted-foreground">Aucun client derive des commandes pour le moment.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      customers.map((customer, index) => (
                        <TableRow key={`${customer.email}-${index}`}>
                          <TableCell className="font-bold text-sm">{customer.name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{customer.email}</TableCell>
                          <TableCell className="text-center font-bold">{customer.orders}</TableCell>
                          <TableCell className="text-right font-black text-secondary">
                            {formatAmount(customer.totalSpent)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
