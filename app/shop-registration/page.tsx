"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShieldCheck, TrendingUp, Users } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { AuthManager } from "@/lib/auth"
import { extractApiErrorMessage, getUserFriendlyErrorMessage } from "@/lib/error-utils"

export default function ShopRegistrationPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    description: "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.description.trim()) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      if (!AuthManager.isAuthenticated()) {
        toast({
          title: "Authentification requise",
          description: "Vous devez etre connecte pour creer une boutique",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      const res = await fetch("/api/boutiques", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          description: form.description,
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(
          data?.error ||
          data?.detail ||
          (await extractApiErrorMessage(res, "Impossible de creer la boutique"))
        )
      }

      toast({
        title: "Boutique creee",
        description: "Votre demande est en cours de validation.",
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Erreur",
        description: getUserFriendlyErrorMessage(error, "Impossible de creer la boutique"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar />

      <main className="container mx-auto flex-1 px-4 py-12 md:px-6">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
              Devenez vendeur sur Glodist
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
              Rejoignez la communaute de commercants verifies et boostez vos ventes.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-1">
              <div className="space-y-3 rounded-2xl border bg-white p-6 shadow-sm">
                <ShieldCheck className="h-10 w-10 text-secondary" />
                <h3 className="text-xl font-bold">Confiance garantie</h3>
                <p className="text-muted-foreground">
                  Tous nos vendeurs sont verifies par leur CNI.
                </p>
              </div>

              <div className="space-y-3 rounded-2xl border bg-white p-6 shadow-sm">
                <TrendingUp className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Visibilite maximale</h3>
                <p className="text-muted-foreground">
                  Touchez des milliers de clients.
                </p>
              </div>

              <div className="space-y-3 rounded-2xl border bg-white p-6 shadow-sm">
                <Users className="h-10 w-10 text-secondary" />
                <h3 className="text-xl font-bold">Support dedie</h3>
                <p className="text-muted-foreground">
                  Une equipe pour vous accompagner.
                </p>
              </div>
            </div>

            <div className="lg:col-span-2">
              <Card className="border-none shadow-lg">
                <CardHeader className="rounded-t-xl bg-primary text-primary-foreground">
                  <CardTitle className="text-2xl">Ouvrir votre boutique</CardTitle>
                  <CardDescription className="text-primary-foreground/80">
                    Remplissez ce formulaire pour commencer.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 p-8">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de la boutique</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Ex: KG Shop"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Decrivez votre activite et les produits que vous proposez."
                      className="min-h-[140px]"
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="h-12 w-full"
                  >
                    {loading ? "Creation en cours..." : "Envoyer ma demande de creation"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
