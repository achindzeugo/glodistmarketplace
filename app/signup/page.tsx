import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function SignupPage() {
  return (
    <div className="container flex items-center justify-center py-12">
      <Card className="w-full max-w-lg border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-primary">Créer un compte</CardTitle>
          <CardDescription>Rejoignez la première centrale d'achat du Cameroun</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first-name">Prénom</Label>
              <Input id="first-name" placeholder="Jean" className="bg-muted/50" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last-name">Nom</Label>
              <Input id="last-name" placeholder="Mbi" className="bg-muted/50" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="nom@exemple.com" className="bg-muted/50" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" type="tel" placeholder="+237 6xx xxx xxx" className="bg-muted/50" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" type="password" className="bg-muted/50" />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            En cliquant sur s'inscrire, vous acceptez nos{" "}
            <Link href="#" className="underline hover:text-primary">
              conditions d'utilisation
            </Link>{" "}
            et notre{" "}
            <Link href="#" className="underline hover:text-primary">
              politique de confidentialité
            </Link>
            .
          </p>
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">S'inscrire</Button>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-center gap-1 text-sm text-muted-foreground">
          Vous avez déjà un compte ?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Se connecter
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
