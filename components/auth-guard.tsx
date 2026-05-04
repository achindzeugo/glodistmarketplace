"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthManager } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
  message?: string
}

export function AuthGuard({ 
  children, 
  redirectTo = "/login", 
  message = "Vous devez vous connecter pour accéder à cette page" 
}: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = AuthManager.isAuthenticated()
      setIsAuthenticated(authenticated)
      
      if (!authenticated) {
        toast({
          title: "Connexion requise",
          description: message,
          variant: "destructive",
        })
        
        const currentPath = window.location.pathname
        const returnUrl = encodeURIComponent(currentPath)
        router.push(`${redirectTo}?returnUrl=${returnUrl}`)
      }
    }

    checkAuth()
  }, [router, toast, redirectTo, message])

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}