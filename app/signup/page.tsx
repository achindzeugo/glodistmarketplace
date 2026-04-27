"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'inscription")
        return
      }

      // Rediriger vers login après inscription
      router.push("/login?registered=1")
    } catch {
      setError("Erreur de connexion. Vérifiez votre réseau.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center py-12 min-h-screen">
      <Card className="w-full max-w-lg border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <span className="text-3xl font-black tracking-tighter text-secondary">Glo</span>
            <span className="text-3xl font-black tracking-tighter text-primary">Dist</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-primary">Créer un compte</CardTitle>
          <CardDescription>Rejoignez la première centrale d'achat du Cameroun</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                placeholder="johndoe"
                className="bg-muted/50"
                value={form.username}
                onChange={set("username")}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first_name">Prénom</Label>
                <Input
                  id="first_name"
                  placeholder="Jean"
                  className="bg-muted/50"
                  value={form.first_name}
                  onChange={set("first_name")}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last_name">Nom</Label>
                <Input
                  id="last_name"
                  placeholder="Mbi"
                  className="bg-muted/50"
                  value={form.last_name}
                  onChange={set("last_name")}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nom@exemple.com"
                className="bg-muted/50"
                value={form.email}
                onChange={set("email")}
                required
                autoComplete="email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+237 6xx xxx xxx"
                className="bg-muted/50"
                value={form.phone}
                onChange={set("phone")}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                className="bg-muted/50"
                value={form.password}
                onChange={set("password")}
                required
                autoComplete="new-password"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              En vous inscrivant, vous acceptez nos{" "}
              <Link href="#" className="underline hover:text-primary">conditions d'utilisation</Link>{" "}
              et notre{" "}
              <Link href="#" className="underline hover:text-primary">politique de confidentialité</Link>.
            </p>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              S'inscrire
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex flex-wrap items-center justify-center gap-1 text-sm text-muted-foreground">
          Vous avez déjà un compte ?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">Se connecter</Link>
        </CardFooter>
      </Card>
    </div>
  )
}
