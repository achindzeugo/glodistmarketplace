"use client"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ShieldCheck, Upload, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function VerifyIdentityPage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 md:px-6">
        <Link
          href="/profile"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Retour au profil
        </Link>

        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary mb-4">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Vérification d'Identité</h1>
            <p className="text-muted-foreground">
              Confirmez votre identité pour débloquer toutes les fonctionnalités et renforcer la confiance sur Glodist.
            </p>
          </div>

          <Card className="border-none shadow-sm overflow-hidden">
            <div className="h-2 bg-primary" />
            <CardHeader>
              <CardTitle>Documents Requis</CardTitle>
              <CardDescription>Veuillez fournir une copie lisible de votre CNI ou de votre passeport.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id-type">Type de document</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option>Carte Nationale d'Identité (CNI)</option>
                    <option>Passeport</option>
                    <option>Permis de conduire</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Photo du document (Recto)</Label>
                  <div className="border-2 border-dashed border-muted rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer group">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground group-hover:text-primary mb-2" />
                    <p className="text-sm font-medium">Cliquez ou glissez votre fichier ici</p>
                    <p className="text-xs text-muted-foreground pt-1">Format JPG, PNG ou PDF (Max 5MB)</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Photo du document (Verso)</Label>
                  <div className="border-2 border-dashed border-muted rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer group">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground group-hover:text-primary mb-2" />
                    <p className="text-sm font-medium">Cliquez ou glissez votre fichier ici</p>
                    <p className="text-xs text-muted-foreground pt-1">Format JPG, PNG ou PDF (Max 5MB)</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 flex gap-3 text-yellow-800">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-xs leading-relaxed">
                  Assurez-vous que toutes les informations sont clairement lisibles. Le processus de vérification peut
                  prendre jusqu'à 24h.
                </p>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12">
                Soumettre pour vérification
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
