import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ShieldCheck, TrendingUp, Users } from "lucide-react"

export default function ShopRegistrationPage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 md:px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl text-primary">
              Devenez vendeur sur Glodist
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Rejoignez la plus grande communauté de commerçants vérifiés au Cameroun et boostez vos ventes.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Features */}
            <div className="lg:col-span-1 space-y-6">
              <div className="p-6 rounded-2xl bg-white shadow-sm border space-y-3">
                <ShieldCheck className="h-10 w-10 text-secondary" />
                <h3 className="text-xl font-bold">Confiance Garantie</h3>
                <p className="text-muted-foreground">
                  Tous nos vendeurs sont vérifiés par leur CNI pour assurer la sécurité.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white shadow-sm border space-y-3">
                <TrendingUp className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Visibilité Maximale</h3>
                <p className="text-muted-foreground">
                  Touchez des milliers de clients potentiels à Douala, Yaoundé et au-delà.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white shadow-sm border space-y-3">
                <Users className="h-10 w-10 text-secondary" />
                <h3 className="text-xl font-bold">Support Dédié</h3>
                <p className="text-muted-foreground">
                  Une équipe à votre écoute pour vous aider à gérer votre boutique.
                </p>
              </div>
            </div>

            {/* Registration Form */}
            <div className="lg:col-span-2">
              <Card className="border-none shadow-lg">
                <CardHeader className="bg-primary text-primary-foreground rounded-t-xl">
                  <CardTitle className="text-2xl">Ouvrir votre boutique</CardTitle>
                  <CardDescription className="text-primary-foreground/80">
                    Remplissez ce formulaire pour commencer l'aventure.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="shop-name">Nom de la boutique</Label>
                      <Input id="shop-name" placeholder="Ex: Tech Global Cameroun" className="h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Catégorie principale</Label>
                      <Input id="category" placeholder="Ex: Électronique" className="h-12" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description de votre activité</Label>
                    <Textarea id="description" placeholder="Décrivez ce que vous vendez..." className="min-h-[120px]" />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">Ville de base</Label>
                      <Input id="city" placeholder="Ex: Douala" className="h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone (WhatsApp)</Label>
                      <Input id="phone" placeholder="Ex: 6xx xxx xxx" className="h-12" />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-secondary" />
                      Vérification d'identité
                    </h4>
                    <p className="text-sm text-muted-foreground mb-6">
                      Pour garantir la sécurité, nous vous demanderons une photo de votre CNI lors de l'étape suivante.
                    </p>
                    <Button className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90">
                      Envoyer ma demande de création
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
