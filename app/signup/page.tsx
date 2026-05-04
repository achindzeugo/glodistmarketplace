"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PageTransition } from "@/components/page-transition"
import { BackButton } from "@/components/back-button"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import { AppLogo } from "@/components/app-logo"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    phone_number: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const baseUsername = (formData.first_name + formData.last_name)
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9]/g, "")
        .substring(0, 12)
      const username = baseUsername + Math.floor(1000 + Math.random() * 9000)

      await apiClient.register({
        role: "client",
        account_status: "active",
        can_sell: false,
        username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone_number
      })
      
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
      })
      
      router.push('/login')
    } catch (error) {
      toast({
        title: "Erreur d'inscription",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageTransition className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
      <div className="absolute top-4 left-4">
        <BackButton href="/" />
      </div>
      
      <Card className="w-full max-w-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <AppLogo className="max-h-24 w-auto" priority />
          </div>
          <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
          <CardDescription>
            Rejoignez la marketplace et découvrez des milliers de produits
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Prénom</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  placeholder="Jean"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nom</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  placeholder="Dupont"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number">Téléphone</Label>
              <Input
                id="phone_number"
                name="phone_number"
                type="tel"
                placeholder="+237 6XX XXX XXX"
                value={formData.phone_number}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 6 caractères"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Répétez votre mot de passe"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full transition-all duration-200 hover:scale-105" 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer mon compte
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Déjà un compte ?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium transition-colors">
                Se connecter
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </PageTransition>
  )
}
