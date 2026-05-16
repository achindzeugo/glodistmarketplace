"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { UserProfileBanner } from "@/components/user-profile-banner"
import { PageTransition, FadeTransition } from "@/components/page-transition"
import { BackButton } from "@/components/back-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileUpload } from "@/components/file-upload"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AuthManager, User } from "@/lib/auth"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Edit, 
  Save,
  X,
  ShoppingBag,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  LockKeyhole
} from "lucide-react"
export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [hasShop, setHasShop] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    prenom: "",
    nom: "",
    telephone: ""
  })
  const [identityFile, setIdentityFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<string>("")
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [verificationStatus, setVerificationStatus] = useState<'none' | 'pending' | 'verified' | 'rejected'>('none')
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = AuthManager.isAuthenticated()
      const userData = AuthManager.getUser()
      
      if (!authenticated || !userData) {
        toast({
          title: "Accès refusé",
          description: "Vous devez être connecté pour accéder à votre profil",
          variant: "destructive",
        })
        router.push('/login')
        return
      }
      
      try {
        // Essayer de récupérer le profil depuis l'API pour avoir les données les plus récentes
        const freshProfile = await apiClient.getUserProfile()
        let effectiveUser = freshProfile

        try {
          const userShopData = await apiClient.getUserShop()
          const nextHasShop = !!userShopData.shop?.id
          setHasShop(nextHasShop)

          if (nextHasShop) {
            effectiveUser = {
              ...freshProfile,
              role: 'Vendeur',
              vente: true
            }
          }
        } catch (shopError) {
          setHasShop(false)
        }

        setUser(effectiveUser)
        AuthManager.setUser(effectiveUser)
        setEditForm({
          prenom: effectiveUser.prenom,
          nom: effectiveUser.nom,
          telephone: effectiveUser.telephone
        })
        
        // Récupérer le statut de vérification réel depuis l'API
        try {
          const verificationData = await apiClient.getVerificationStatus()
          // Mapper le statut de l'API vers notre état local
          if (verificationData.status === 'verified') {
            setVerificationStatus('verified')
          } else if (verificationData.status === 'pending') {
            setVerificationStatus('pending')
          } else if (verificationData.status === 'rejected') {
            setVerificationStatus('rejected')
          } else {
            setVerificationStatus('none')
          }
        } catch (verificationError) {
          // En cas d'erreur, utiliser le statut basé sur le compte
          setVerificationStatus(effectiveUser.statut_compte === 'Actif' ? 'verified' : 'none')
        }
      } catch (error) {
        // En cas d'erreur, utiliser les données du cookie
        console.warn('Impossible de récupérer le profil depuis l\'API, utilisation des données locales')
        let effectiveUser = userData

        try {
          const userShopData = await apiClient.getUserShop()
          const nextHasShop = !!userShopData.shop?.id
          setHasShop(nextHasShop)

          if (nextHasShop) {
            effectiveUser = {
              ...userData,
              role: 'Vendeur',
              vente: true
            }
          }
        } catch (shopError) {
          setHasShop(false)
        }

        setUser(effectiveUser)
        AuthManager.setUser(effectiveUser)
        setEditForm({
          prenom: effectiveUser.prenom,
          nom: effectiveUser.nom,
          telephone: effectiveUser.telephone
        })
        setVerificationStatus(effectiveUser.statut_compte === 'Actif' ? 'verified' : 'none')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, toast])

  const getInitials = (prenom: string, nom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleEditToggle = () => {
    if (isEditing) {
      // Annuler les modifications
      setEditForm({
        prenom: user?.prenom || "",
        nom: user?.nom || "",
        telephone: user?.telephone || ""
      })
    }
    setIsEditing(!isEditing)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const resetPasswordForm = () => {
    setPasswordForm({
      oldPassword: "",
      newPassword: "",
      confirmPassword: ""
    })
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      
      // Appel API pour mettre à jour le profil
      const updatedProfile = await apiClient.updateUserProfile({
        prenom: editForm.prenom,
        nom: editForm.nom,
        telephone: editForm.telephone
      })
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès",
      })
      setIsEditing(false)
      
      // Mettre à jour l'utilisateur local avec les données de l'API
      const effectiveUpdatedProfile = hasShop
        ? { ...updatedProfile, role: 'Vendeur', vente: true }
        : updatedProfile

      setUser(effectiveUpdatedProfile)
      AuthManager.setUser(effectiveUpdatedProfile)
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de mettre à jour le profil",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleIdentityUpload = async () => {
    if (!identityFile || !documentType) return

    try {
      setUploadStatus('uploading')
      
      const formData = new FormData()
      formData.append('document', identityFile)
      formData.append('document_type', documentType)
      
      const response = await fetch('/api/user/identity', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement du document')
      }

      setUploadStatus('success')
      setVerificationStatus('pending')
      setIdentityFile(null)
      setDocumentType("")
      
      toast({
        title: "Document téléchargé",
        description: "Votre document a été téléchargé avec succès. Il sera vérifié sous 24-48h.",
      })
      
    } catch (error) {
      setUploadStatus('error')
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de télécharger le document",
        variant: "destructive",
      })
    }
  }

  const handlePasswordChange = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs du mot de passe",
        variant: "destructive",
      })
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Confirmation invalide",
        description: "Les nouveaux mots de passe ne correspondent pas",
        variant: "destructive",
      })
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Mot de passe trop court",
        description: "Le nouveau mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      })
      return
    }

    try {
      setIsChangingPassword(true)
      await apiClient.changePassword({
        old_password: passwordForm.oldPassword,
        new_password: passwordForm.newPassword,
      })

      resetPasswordForm()
      setIsPasswordDialogOpen(false)

      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de changer le mot de passe",
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <PageTransition className="min-h-screen bg-background">
        <Navbar />
        <UserProfileBanner />
        <main className="container mx-auto px-4 md:px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </main>
      </PageTransition>
    )
  }

  if (!user) {
    return null
  }

  return (
    <PageTransition className="min-h-screen bg-background">
      <Navbar />
      <UserProfileBanner />
      
      <main className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
            <p className="text-muted-foreground">
              Gérez vos informations personnelles et vos préférences
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Carte de profil principal */}
          <FadeTransition>
            <Card className="lg:col-span-2 hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    Informations personnelles
                  </CardTitle>
                  <CardDescription>
                    Vos informations de base et de contact
                  </CardDescription>
                </div>
                <Button
                  variant={isEditing ? "destructive" : "outline"}
                  size="sm"
                  onClick={handleEditToggle}
                  className="gap-2"
                >
                  {isEditing ? (
                    <>
                      <X className="h-4 w-4" />
                      Annuler
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4" />
                      Modifier
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20 border-4 border-primary/20">
                    <AvatarImage src="" alt={`${user.prenom} ${user.nom}`} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                      {getInitials(user.prenom, user.nom)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold">{user.prenom} {user.nom}</h2>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={(user.role === 'Vendeur' || hasShop) ? 'default' : 'secondary'}>
                        {hasShop ? 'Vendeur' : user.role}
                      </Badge>
                      {user.statut_compte === 'Actif' && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <Shield className="h-3 w-3 mr-1" />
                          Compte vérifié
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="prenom">Prénom</Label>
                    {isEditing ? (
                      <Input
                        id="prenom"
                        name="prenom"
                        value={editForm.prenom}
                        onChange={handleInputChange}
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{user.prenom}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom</Label>
                    {isEditing ? (
                      <Input
                        id="nom"
                        name="nom"
                        value={editForm.nom}
                        onChange={handleInputChange}
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{user.nom}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      L'email ne peut pas être modifié
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telephone">Téléphone</Label>
                    {isEditing ? (
                      <Input
                        id="telephone"
                        name="telephone"
                        value={editForm.telephone}
                        onChange={handleInputChange}
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{user.telephone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end">
                    <Button onClick={handleSave} className="gap-2">
                      <Save className="h-4 w-4" />
                      Sauvegarder
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeTransition>

          {/* Carte d'informations supplémentaires */}
          <div className="lg:col-span-1 space-y-6">
            <FadeTransition className="animation-delay-200">
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Informations du compte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Date de création</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(user.date_creation)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Nom d'utilisateur</Label>
                    <p className="text-sm text-muted-foreground">
                      {user.username}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Statut du compte</Label>
                    <Badge variant={user.statut_compte === 'Actif' ? 'default' : 'secondary'}>
                      {user.statut_compte}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </FadeTransition>

            {(user.role === 'Vendeur' || hasShop) && (
              <FadeTransition className="animation-delay-300">
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5" />
                      Informations vendeur
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Autorisation de vente</Label>
                      <Badge variant={user.vente ? 'default' : 'secondary'}>
                        {user.vente ? 'Autorisé' : 'Non autorisé'}
                      </Badge>
                    </div>
                    {user.vente && (
                      <Button 
                        className="w-full" 
                        onClick={() => router.push('/dashboard')}
                      >
                        Accéder à ma boutique
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </FadeTransition>
            )}

            <FadeTransition className="animation-delay-400">
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LockKeyhole className="h-5 w-5" />
                    Sécurité du compte
                  </CardTitle>
                  <CardDescription>
                    Changez votre mot de passe en fournissant votre mot de passe actuel
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Pour des raisons de sécurité, la modification du mot de passe s'effectue dans une fenêtre dédiée.
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => setIsPasswordDialogOpen(true)}
                  >
                    Changer mon mot de passe
                  </Button>
                </CardContent>
              </Card>
            </FadeTransition>

            <FadeTransition className="animation-delay-400">
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Vérification d'identité
                  </CardTitle>
                  <CardDescription>
                    Téléchargez votre pièce d'identité pour vérifier votre compte
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Statut:</span>
                    {verificationStatus === 'verified' && (
                      <Badge variant="default" className="text-green-600 bg-green-100 border-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Vérifié
                      </Badge>
                    )}
                    {verificationStatus === 'pending' && (
                      <Badge variant="secondary" className="text-orange-600 bg-orange-100 border-orange-600">
                        <Clock className="h-3 w-3 mr-1" />
                        En attente
                      </Badge>
                    )}
                    {verificationStatus === 'rejected' && (
                      <Badge variant="destructive" className="text-red-600 bg-red-100 border-red-600">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Rejeté
                      </Badge>
                    )}
                    {verificationStatus === 'none' && (
                      <Badge variant="outline" className="text-gray-600">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Non vérifié
                      </Badge>
                    )}
                  </div>

                  {verificationStatus !== 'verified' && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {verificationStatus === 'rejected' 
                          ? 'Votre document a été rejeté. Veuillez télécharger un nouveau document.'
                          : documentType === 'carte_identite'
                          ? 'Téléchargez une photo claire du recto et verso de votre carte nationale d\'identité.'
                          : documentType === 'passeport'
                          ? 'Téléchargez une photo claire de la page d\'identité de votre passeport.'
                          : documentType === 'permis_conduire'
                          ? 'Téléchargez une photo claire du recto et verso de votre permis de conduire.'
                          : 'Sélectionnez le type de document et téléchargez une copie claire pour vérifier votre compte.'
                        }
                      </p>
                      
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="document-type">Type de document</Label>
                          <Select 
                            value={documentType} 
                            onValueChange={(value) => {
                              setDocumentType(value)
                              // Réinitialiser le fichier et le statut si l'utilisateur change de type
                              if (identityFile) {
                                setIdentityFile(null)
                                setUploadStatus('idle')
                              }
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Sélectionnez le type de document" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="carte_identite">Carte nationale d'identité</SelectItem>
                              <SelectItem value="passeport">Passeport</SelectItem>
                              <SelectItem value="permis_conduire">Permis de conduire</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Document</Label>
                          <FileUpload
                            onFileSelect={(file) => {
                              setIdentityFile(file)
                              if (file) {
                                setUploadStatus('idle')
                              }
                            }}
                            acceptedTypes="image/*,.pdf"
                            maxSize={5}
                            uploadStatus={uploadStatus}
                            disabled={uploadStatus === 'uploading'}
                          />
                        </div>
                      </div>

                      {identityFile && documentType && uploadStatus === 'idle' && (
                        <Button 
                          onClick={handleIdentityUpload}
                          className="w-full"
                          disabled={!identityFile || !documentType}
                        >
                          Télécharger le document
                        </Button>
                      )}
                    </div>
                  )}

                  {verificationStatus === 'verified' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        Votre identité a été vérifiée avec succès. Vous avez maintenant accès à toutes les fonctionnalités de la plateforme.
                      </p>
                    </div>
                  )}

                  {verificationStatus === 'pending' && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-800">
                        Votre document est en cours de vérification. Nous vous contacterons sous 24-48h avec le résultat.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeTransition>

            <FadeTransition className="animation-delay-500">
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Mes achats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Consultez l'historique de vos commandes et suivez vos livraisons
                  </p>
                  <Button 
                    variant="outline"
                    className="w-full" 
                    onClick={() => router.push('/profile/orders')}
                  >
                    Voir mes commandes
                  </Button>
                </CardContent>
              </Card>
            </FadeTransition>
          </div>
        </div>
      </main>

      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={(open) => {
          if (!open && !isChangingPassword) {
            resetPasswordForm()
          }
          setIsPasswordDialogOpen(open)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Changer le mot de passe</DialogTitle>
            <DialogDescription>
              Saisissez votre mot de passe actuel, puis choisissez un nouveau mot de passe.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Mot de passe actuel</Label>
              <Input
                id="oldPassword"
                name="oldPassword"
                type="password"
                value={passwordForm.oldPassword}
                onChange={handlePasswordInputChange}
                placeholder="Ancien mot de passe"
                disabled={isChangingPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={handlePasswordInputChange}
                placeholder="Nouveau mot de passe"
                disabled={isChangingPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirmer le nouveau mot de passe</Label>
              <Input
                id="confirmNewPassword"
                name="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordInputChange}
                placeholder="Répétez le nouveau mot de passe"
                disabled={isChangingPassword}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetPasswordForm()
                setIsPasswordDialogOpen(false)
              }}
              disabled={isChangingPassword}
            >
              Annuler
            </Button>
            <Button
              onClick={handlePasswordChange}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? "Mise à jour..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  )
}
