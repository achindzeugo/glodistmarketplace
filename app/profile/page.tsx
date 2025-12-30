"use client"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Package, Heart, Settings, ShieldCheck, MapPin, FileText, Download, CheckCircle } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile")

  const user = {
    name: "Jean Dupont",
    email: "jean.dupont@email.cm",
    verified: true,
    orders: 12,
    location: "Akwa, Douala",
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Sidebar Menu */}
          <Card className="md:col-span-1 h-fit border-none shadow-sm">
            <CardContent className="p-6 space-y-2">
              <Button
                variant="ghost"
                onClick={() => setActiveTab("profile")}
                className={`w-full justify-start gap-3 ${activeTab === "profile" ? "bg-primary/10 text-primary font-bold" : "hover:bg-primary/5"}`}
              >
                <User className="h-5 w-5" /> Mon Profil
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab("orders")}
                className={`w-full justify-start gap-3 ${activeTab === "orders" ? "bg-primary/10 text-primary font-bold" : "hover:bg-primary/5"}`}
              >
                <Package className="h-5 w-5" /> Mes Commandes
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab("wishlist")}
                className={`w-full justify-start gap-3 ${activeTab === "wishlist" ? "bg-primary/10 text-primary font-bold" : "hover:bg-primary/5"}`}
              >
                <Heart className="h-5 w-5" /> Liste de souhaits
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab("settings")}
                className={`w-full justify-start gap-3 ${activeTab === "settings" ? "bg-primary/10 text-primary font-bold" : "hover:bg-primary/5"}`}
              >
                <Settings className="h-5 w-5" /> Paramètres
              </Button>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="md:col-span-3 space-y-8">
            {activeTab === "profile" && (
              <>
                <Card className="border-none shadow-sm">
                  <CardHeader className="flex flex-row items-center gap-6 p-8">
                    <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-4xl font-black">
                      {user.name[0]}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-3xl font-bold">{user.name}</h2>
                        {user.verified && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" /> Vérifié
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground pt-2">
                        <MapPin className="h-4 w-4" /> {user.location}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" /> Commandes récentes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm italic">
                        Vous n'avez pas encore de commandes actives.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm border-l-4 border-l-primary">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-primary">
                        <ShieldCheck className="h-5 w-5" /> Vérification & Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-1" />
                          <div className="space-y-1">
                            <p className="font-bold text-sm">Vérification de compte</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Pour garantir la sécurité et la crédibilité de tous les échanges sur Glodist, chaque
                              compte doit être vérifié par une pièce d'identité officielle.
                            </p>
                          </div>
                        </div>
                        <Button
                          asChild
                          className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
                          size="sm"
                        >
                          <Link href="/verify-identity">
                            <ShieldCheck className="h-4 w-4 mr-2" /> Vérifier mon identité
                          </Link>
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Documents officiels
                        </p>
                        <div className="grid gap-2">
                          <Button
                            variant="outline"
                            className="w-full justify-between h-auto py-3 px-4 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors group bg-transparent"
                            asChild
                          >
                            <a href="/termes-conditions-glodist.pdf" download="Termes_et_Conditions_Glodist.pdf">
                              <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">Termes & Conditions</span>
                              </div>
                              <Download className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-between h-auto py-3 px-4 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors group bg-transparent"
                            asChild
                          >
                            <a href="/guide-usage-glodist.pdf" download="Guide_Usage_Glodist.pdf">
                              <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">Guide d'usage Glodist</span>
                              </div>
                              <Download className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {activeTab === "orders" && (
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Mes Commandes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 space-y-4">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                    <p className="text-muted-foreground">Vous n'avez pas encore passé de commande.</p>
                    <Button variant="outline">Commencer mes achats</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "wishlist" && (
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Ma Liste de Souhaits</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">Votre liste de souhaits est vide.</p>
                </CardContent>
              </Card>
            )}

            {activeTab === "settings" && (
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Paramètres du compte</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-bold">Notifications</h4>
                      <p className="text-sm text-muted-foreground">Gérez vos alertes par email et SMS.</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold">Sécurité</h4>
                      <p className="text-sm text-muted-foreground">
                        Modifier votre mot de passe et vos informations de connexion.
                      </p>
                    </div>
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
