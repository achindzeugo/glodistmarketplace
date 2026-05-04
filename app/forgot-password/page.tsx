"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PageTransition } from "@/components/page-transition"
import { BackButton } from "@/components/back-button"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import { AppLogo } from "@/components/app-logo"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await apiClient.forgotPassword({ email })

      toast({
        title: "Demande envoyée",
        description: result.message,
      })

      router.push("/login")
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'envoyer la demande",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageTransition className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="absolute top-4 left-4">
        <BackButton href="/login" />
      </div>

      <Card className="w-full max-w-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <AppLogo className="max-h-24 w-auto" priority />
          </div>
          <CardTitle className="text-2xl font-bold">Mot de passe oublié</CardTitle>
          <CardDescription>
            Entrez votre email pour recevoir les instructions de réinitialisation
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer le lien
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline font-medium transition-colors">
                Retour à la connexion
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </PageTransition>
  )
}
