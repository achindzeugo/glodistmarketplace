"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  User, Package, Settings, ShieldCheck, FileText, Download,
  Edit, Save, X, Loader2, CheckCircle, Clock, AlertTriangle, Upload
} from "lucide-react"
import { getClientUser } from "@/lib/auth"
import type { User as UserType, Order } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

const DOC_TYPES = [
  { value: "carte_identite", label: "Carte nationale d'identité" },
  { value: "passeport", label: "Passeport" },
  { value: "permis_conduire", label: "Permis de conduire" },
]

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<UserType | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "" })
  const [docType, setDocType] = useState("")
  const [docFile, setDocFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const u = getClientUser()
    if (!u) { router.push("/login?redirect=/profile"); return }
    setUser(u)
    setForm({ first_name: u.first_name, last_name: u.last_name, phone: u.phone })
    fetchOrders()
  }, [router])

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setOrders(data.results || [])
      }
    } catch {}
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      })
      const updated = await res.json()
      if (!res.ok) throw new Error(updated.error)
      setUser(updated)
      setIsEditing(false)
      toast({ title: "Profil mis à jour" })
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleDocUpload = async () => {
    if (!docFile || !docType) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("document", docFile)
      fd.append("document_type", docType)
      const res = await fetch("/api/identity", { method: "POST", body: fd, credentials: "include" })
      if (!res.ok) throw new Error("Erreur lors de l'envoi")
      toast({ title: "Document envoyé", description: "Vérification sous 24-48h." })
      setDocFile(null)
      setDocType("")
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const initials = `${user.first_name[0] || ""}${user.last_name[0] || ""}`.toUpperCase()
  const isVerified = user.account_status === "active"

  const tabs = [
    { id: "profile", label: "Mon Profil", icon: User },
    { id: "orders", label: "Mes Commandes", icon: Package },
    { id: "identity", label: "Vérification", icon: ShieldCheck },
    { id: "settings", label: "Paramètres", icon: Settings },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Sidebar */}
          <Card className="md:col-span-1 h-fit border-none shadow-sm">
            <CardContent className="p-6 space-y-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant="ghost"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full justify-start gap-3 ${activeTab === tab.id ? "bg-primary/10 text-primary font-bold" : "hover:bg-primary/5"}`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Content */}
          <div className="md:col-span-3 space-y-6">

            {/* Profil */}
            {activeTab === "profile" && (
              <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-black">
                      {initials}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold">{user.first_name} {user.last_name}</h2>
                        {isVerified && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" /> Vérifié
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">{user.email}</p>
                      <Badge variant="outline">{user.role}</Badge>
                    </div>
                  </div>
                  <Button
                    variant={isEditing ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (isEditing) setForm({ first_name: user.first_name, last_name: user.last_name, phone: user.phone })
                      setIsEditing(!isEditing)
                    }}
                  >
                    {isEditing ? <><X className="h-4 w-4 mr-1" />Annuler</> : <><Edit className="h-4 w-4 mr-1" />Modifier</>}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Separator />
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      { id: "first_name", label: "Prénom", field: "first_name" as const },
                      { id: "last_name", label: "Nom", field: "last_name" as const },
                    ].map(({ id, label, field }) => (
                      <div key={id} className="space-y-2">
                        <Label htmlFor={id}>{label}</Label>
                        {isEditing ? (
                          <Input
                            id={id}
                            value={form[field]}
                            onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                          />
                        ) : (
                          <p className="p-2 bg-muted/50 rounded-md text-sm">{user[field]}</p>
                        )}
                      </div>
                    ))}
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <p className="p-2 bg-muted/50 rounded-md text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={form.phone}
                          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                        />
                      ) : (
                        <p className="p-2 bg-muted/50 rounded-md text-sm">{user.phone}</p>
                      )}
                    </div>
                  </div>
                  {isEditing && (
                    <div className="flex justify-end">
                      <Button onClick={handleSave} disabled={saving} className="gap-2">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Sauvegarder
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Commandes */}
            {activeTab === "orders" && (
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Mes Commandes</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-12 space-y-4">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                      <p className="text-muted-foreground">Vous n'avez pas encore passé de commande.</p>
                      <Button variant="outline" onClick={() => router.push("/products")}>
                        Commencer mes achats
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-bold">Commande #{order.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-primary">{parseFloat(order.total_price).toLocaleString()} XAF</p>
                            <Badge variant="outline">{order.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Vérification d'identité */}
            {activeTab === "identity" && (
              <Card className="border-none shadow-sm border-l-4 border-l-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <ShieldCheck className="h-5 w-5" /> Vérification d'identité
                  </CardTitle>
                  <CardDescription>
                    Téléchargez votre pièce d'identité pour vérifier votre compte et accéder à toutes les fonctionnalités.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Statut :</span>
                    {isVerified ? (
                      <Badge className="bg-green-100 text-green-700 border-green-300">
                        <CheckCircle className="h-3 w-3 mr-1" /> Vérifié
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        <AlertTriangle className="h-3 w-3 mr-1" /> Non vérifié
                      </Badge>
                    )}
                  </div>

                  {!isVerified && (
                    <div className="space-y-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <div className="space-y-2">
                        <Label>Type de document</Label>
                        <Select value={docType} onValueChange={setDocType}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionnez le type de document" />
                          </SelectTrigger>
                          <SelectContent>
                            {DOC_TYPES.map((d) => (
                              <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {docType && (
                        <div className="space-y-2">
                          <Label>Document</Label>
                          <div
                            className="border-2 border-dashed border-primary/20 rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                            onClick={() => document.getElementById("doc-input")?.click()}
                          >
                            <Upload className="h-8 w-8 mx-auto text-primary/40 mb-2" />
                            <p className="text-sm font-medium">
                              {docFile ? docFile.name : "Cliquez ou glissez votre fichier ici"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">JPG, PNG ou PDF — max 5MB</p>
                          </div>
                          <input
                            id="doc-input"
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                          />
                        </div>
                      )}

                      {docFile && docType && (
                        <Button onClick={handleDocUpload} disabled={uploading} className="w-full">
                          {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                          Envoyer le document
                        </Button>
                      )}
                    </div>
                  )}

                  {isVerified && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        Votre identité a été vérifiée. Vous avez accès à toutes les fonctionnalités de la plateforme.
                      </p>
                    </div>
                  )}

                  <Separator />
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Documents officiels</p>
                    {[
                      { label: "Termes & Conditions", file: "/termes-conditions-glodist.pdf" },
                      { label: "Guide d'usage Glodist", file: "/guide-usage-glodist.pdf" },
                    ].map((doc) => (
                      <Button
                        key={doc.label}
                        variant="outline"
                        className="w-full justify-between h-auto py-3 px-4 border-primary/20 hover:bg-primary/5 bg-transparent"
                        asChild
                      >
                        <a href={doc.file} download>
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">{doc.label}</span>
                          </div>
                          <Download className="h-4 w-4 opacity-50" />
                        </a>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Paramètres */}
            {activeTab === "settings" && (
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Paramètres du compte</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="font-bold">Changer le mot de passe</h4>
                    <p className="text-sm text-muted-foreground">
                      Modifiez votre mot de passe pour sécuriser votre compte.
                    </p>
                    <Button variant="outline" onClick={() => router.push("/change-password")}>
                      Modifier le mot de passe
                    </Button>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-bold">Informations du compte</h4>
                    <p className="text-sm text-muted-foreground">
                      Membre depuis le {new Date(user.created_at).toLocaleDateString("fr-FR")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Statut : <span className="font-medium">{user.account_status}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
