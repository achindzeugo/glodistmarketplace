"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  Plus,
  LayoutDashboard,
  Settings,
  Store,
  ArrowLeft,
  ImagePlus,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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

import { useToast } from "@/hooks/use-toast"

// Définir les types
type Boutique = {
  id: number;
  name: string;
  nom: string;
  description: string;
  user_id: number;
};

type Category = {
  id: number;
  libelle: string;
};

export default function ShopDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  
  // --- COMPONENT STATE ---
  const [shop, setShop] = useState<Partial<Boutique>>({})
  const [activeTab, setActiveTab] = useState("overview")
  const [showAddProduct, setShowAddProduct] = useState(false)

  // Add Product Form State
  const [categories, setCategories] = useState<Category[]>([])
  const [newProduct, setNewProduct] = useState({
    nom: "",
    description: "",
    prix: "",
    stock: "",
    categorie: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock data state (for existing UI parts)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  useEffect(() => {
    if (!AuthManager.isAuthenticated()) {
      router.push("/login")
      return
    }

    const fetchShopData = async () => {
      try {
        const res = await fetch("/api/user/shop", { credentials: "include" })
        if (!res.ok) throw new Error("Boutique non trouvée.")
        const data = await res.json()
        if (data.shop && data.shop.results && data.shop.results.length > 0) {
          setShop(data.shop.results[0])
        } else {
          router.push("/")
        }
      } catch (err) {
        console.error(err)
        router.push("/")
      }
    }

    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/products/categories")
        if (!res.ok) {
            throw new Error(`Impossible de charger les catégories (${res.statusText})`);
        }
        const data = await res.json()
        setCategories(data.results || [])
      } catch (error: any) {
        console.error(error)
        toast({
          title: "Erreur Catégories",
          description: error.message || "Impossible de charger les catégories de produits.",
          variant: "destructive",
        })
      }
    }

    fetchShopData()
    fetchCategories()
  }, [router, toast])

  // --- EVENT HANDLERS ---
  const handleNewProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setNewProduct(prev => ({ ...prev, [id]: value }))
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
       toast({ title: "Erreur", description: "ID de la boutique introuvable.", variant: "destructive" })
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
        statut_produit: "actif", // Statut par défaut
      }

      const response = await fetch('/api/products/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        // Tente de trouver un message d'erreur spécifique
        const specificError = errorData.details?.nom?.[0] || errorData.error || 'Une erreur est survenue.'
        throw new Error(specificError)
      }

      toast({
        title: "Produit ajouté ! 🎉",
        description: `'${newProduct.nom}' a été ajouté avec succès à votre boutique.`,
      })

      // Réinitialiser le formulaire et fermer le panneau
      setNewProduct({ nom: "", description: "", prix: "", stock: "", categorie: "" })
      setShowAddProduct(false)
      // Idéalement, ici, on rafraîchirait la liste des produits
      
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

  // Données fictives selon MCD
  const orders = [
    { id: "CMD-2025-001", customer: "Jean Dupont", date: "29/12/2025", total: 450000, status: "En attente" },
    { id: "CMD-2025-002", customer: "Marie Ngo", date: "28/12/2025", total: 70000, status: "Livrée" },
    { id: "CMD-2025-003", customer: "Samuel Eto'o", date: "27/12/2025", total: 125000, status: "En cours" },
  ]

  const products = [
    { id: "P1", name: "Smartphone Pro Max X1", price: 450000, stock: 12, category: "Électronique", status: "Actif" },
    { id: "P2", name: "Écouteurs Sans Fil Pro", price: 35000, stock: 45, category: "Électronique", status: "Actif" },
    { id: "P3", name: "Chaussures Elite", price: 42000, stock: 0, category: "Mode", status: "Inactif" },
  ]

  const customers = [
    { name: "Jean Dupont", email: "jean@example.cm", orders: 5, totalSpent: 1250000 },
    { name: "Marie Ngo", email: "marie@example.cm", orders: 2, totalSpent: 140000 },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Livrée":
        return <Badge className="bg-secondary/10 text-secondary border-secondary/20">Livrée</Badge>
      case "En attente":
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">En attente</Badge>
      case "En cours":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">En cours</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // --- Affichage du tableau de bord
  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar - Desktop */}
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
              <p className="font-black text-sm truncate uppercase tracking-tighter text-primary">{shop.name || shop.nom || ''}</p>
              <p className="text-[10px] text-muted-foreground font-bold">VENDEUR VÉRIFIÉ</p>
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {/* Mobile Header */}
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
                    <Label htmlFor="nom">Nom du produit (Libelle)</Label>
                    <Input id="nom" value={newProduct.nom} onChange={handleNewProductChange} placeholder="Ex: iPhone 16 Pro" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categorie">Catégorie</Label>
                    <select
                      id="categorie"
                      value={newProduct.categorie}
                      onChange={handleNewProductChange}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="" disabled>Sélectionner une catégorie</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.libelle}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={newProduct.description} onChange={handleNewProductChange} placeholder="Détails du produit..." className="min-h-[100px]" />
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
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG jusqu'à 5Mo</p>
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
                  {shop.name || shop.nom || 'Ma Boutique'}
                </h1>
                <p className="text-muted-foreground">
                  {activeTab === "overview" && "Vue d'ensemble de votre activité"}
                  {activeTab === "products" && "Gestion de vos produits"}
                  {activeTab === "orders" && "Suivi de vos commandes client"}
                  {activeTab === "customers" && "Historique de vos clients"}
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
                  {[
                    { label: "Ventes totales", value: "2,450,000 XAF", icon: TrendingUp, color: "text-secondary" },
                    { label: "Commandes", value: "125", icon: ShoppingBag, color: "text-primary" },
                    { label: "Clients", value: "84", icon: Users, color: "text-primary" },
                    { label: "Stock faible", value: "3 articles", icon: Package, color: "text-destructive" },
                  ].map((stat, i) => (
                    <Card key={i} className="border-primary/10 bg-card/50">
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
                      <CardTitle className="text-lg">Commandes Récentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {orders.slice(0, 3).map((o) => (
                          <div
                            key={o.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-primary/5"
                          >
                            <div>
                              <p className="font-bold text-sm">{o.customer}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {o.id} • {o.date}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm text-primary">{o.total.toLocaleString()} XAF</p>
                              {getStatusBadge(o.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/5">
                    <CardHeader>
                      <CardTitle className="text-lg">Top Produits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {products.slice(0, 3).map((p) => (
                          <div key={p.id} className="flex items-center gap-4">
                            <div className="size-10 rounded bg-muted flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground/30" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-sm">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.category}</p>
                            </div>
                            <p className="font-black text-secondary">{p.price.toLocaleString()} XAF</p>
                          </div>
                        ))}
                      </div>
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
                      <TableHead className="font-bold">Catégorie</TableHead>
                      <TableHead className="font-bold text-right">Prix</TableHead>
                      <TableHead className="font-bold text-center">Stock</TableHead>
                      <TableHead className="font-bold">Statut</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="text-xs">{p.category}</TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          {p.price.toLocaleString()} XAF
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.stock < 5 ? "bg-destructive/10 text-destructive" : "bg-secondary/10 text-secondary"}`}
                          >
                            {p.stock} pcs
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={p.status === "Actif" ? "default" : "outline"}
                            className={p.status === "Actif" ? "bg-secondary" : ""}
                          >
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog
                            open={editingProduct?.id === p.id}
                            onOpenChange={(open) => !open && setEditingProduct(null)}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary"
                                onClick={() => setEditingProduct(p)}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle>Modifier le produit</DialogTitle>
                                <DialogDescription>Mettez à jour les informations de {p.name}</DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-name">Nom (Libelle)</Label>
                                  <Input id="edit-name" defaultValue={p.name} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-price">Prix (XAF)</Label>
                                    <Input id="edit-price" type="number" defaultValue={p.price} />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-stock">Stock</Label>
                                    <Input id="edit-stock" type="number" defaultValue={p.stock} />
                                  </div>
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-status">Statut</Label>
                                  <select className="w-full h-10 px-3 rounded-md border" defaultValue={p.status}>
                                    <option>Actif</option>
                                    <option>Inactif</option>
                                  </select>
                                </div>
                              </div>
                              <Button
                                className="w-full bg-secondary text-secondary-foreground"
                                onClick={() => setEditingProduct(null)}
                              >
                                Enregistrer les modifications
                              </Button>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}

            {activeTab === "orders" && (
              <div className="space-y-4">
                {orders.map((o) => (
                  <Card
                    key={o.id}
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
                              <span className="font-black text-sm">{o.id}</span>
                              {getStatusBadge(o.status)}
                            </div>
                            <p className="text-sm text-muted-foreground font-medium">Client: {o.customer}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold mt-0.5">{o.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:text-right border-t md:border-0 pt-4 md:pt-0">
                          <div className="md:mr-8">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase">Montant Total</p>
                            <p className="font-black text-lg text-primary">{o.total.toLocaleString()} XAF</p>
                          </div>
                          <div className="flex gap-2">
                            <Dialog
                              open={selectedOrder?.id === o.id}
                              onOpenChange={(open) => !open && setSelectedOrder(null)}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-9 px-4 border-primary/20 hover:bg-primary/5 text-primary bg-transparent"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedOrder(o)
                                  }}
                                >
                                  Détails
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center justify-between pr-8">
                                    Détails de la commande {o.id}
                                    {getStatusBadge(o.status)}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6 py-4">
                                  <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
                                    <div>
                                      <p className="text-muted-foreground font-bold uppercase text-[10px]">Client</p>
                                      <p className="font-bold">{o.customer}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground font-bold uppercase text-[10px]">
                                        Date de commande
                                      </p>
                                      <p className="font-bold">{o.date}</p>
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <p className="text-muted-foreground font-bold uppercase text-[10px]">
                                      Produits commandés
                                    </p>
                                    <div className="space-y-2">
                                      <div className="flex justify-between text-sm items-center p-2 bg-muted/50 rounded">
                                        <div className="flex gap-2 items-center">
                                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                                            <Package className="w-5 h-5 opacity-20" />
                                          </div>
                                          <div>
                                            <p className="font-bold">Smartphone Pro Max X1</p>
                                            <p className="text-xs text-muted-foreground">Quantité: 1</p>
                                          </div>
                                        </div>
                                        <p className="font-black">450,000 XAF</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center pt-4 border-t">
                                    <p className="font-black">TOTAL</p>
                                    <p className="font-black text-xl text-primary">{o.total.toLocaleString()} XAF</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button className="flex-1 bg-secondary text-secondary-foreground">
                                      Valider la commande
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="flex-1 border-destructive text-destructive hover:bg-destructive/5 bg-transparent"
                                    >
                                      Annuler
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <select className="h-9 text-xs font-bold border rounded-md px-2 bg-background border-primary/20 focus:ring-primary">
                              <option>Changer statut</option>
                              <option>En cours</option>
                              <option>Livrée</option>
                              <option>Annulée</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                      <TableHead className="font-bold text-right">Total Dépensé</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((c, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-bold text-sm">{c.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{c.email}</TableCell>
                        <TableCell className="text-center font-bold">{c.orders}</TableCell>
                        <TableCell className="text-right font-black text-secondary">
                          {c.totalSpent.toLocaleString()} XAF
                        </TableCell>
                      </TableRow>
                    ))}
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
