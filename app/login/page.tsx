import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  return (
    <div className="container flex h-[calc(100vh-64px)] items-center justify-center py-12">
      <Card className="w-full max-w-md border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-primary">Connexion</CardTitle>
          <CardDescription>Entrez vos identifiants pour accéder à votre compte Glodist</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="nom@exemple.com" className="bg-muted/50" />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mot de passe</Label>
              <Link href="#" className="text-xs text-primary hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
            <Input id="password" type="password" className="bg-muted/50" />
          </div>
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Se connecter</Button>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-center gap-1 text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            S'inscrire
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
