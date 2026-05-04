import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('access_token')?.value
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer le fichier et le type de document depuis FormData
    const formData = await request.formData()
    const file = formData.get('document') as File
    const documentType = formData.get('document_type') as string
    
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    if (!documentType) {
      return NextResponse.json(
        { error: 'Type de document requis' },
        { status: 400 }
      )
    }

    // Valider le type de document
    const validDocumentTypes = ['carte_identite', 'passeport', 'permis_conduire']
    if (!validDocumentTypes.includes(documentType)) {
      return NextResponse.json(
        { error: 'Type de document invalide' },
        { status: 400 }
      )
    }

    // Vérifier le type et la taille du fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    const maxSize = 5 * 1024 * 1024 // 5MB
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non supporté. Utilisez JPG, PNG ou PDF.' },
        { status: 400 }
      )
    }
    
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Le fichier ne doit pas dépasser 5MB' },
        { status: 400 }
      )
    }

    // Créer un FormData pour l'API externe
    const apiFormData = new FormData()
    apiFormData.append('document', file)
    apiFormData.append('document_type', documentType)

    // Appeler l'API Glodist pour télécharger le document
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/identity/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: apiFormData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Erreur API Glodist:', errorData)
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Token expiré' },
          { status: 401 }
        )
      }
      
      return NextResponse.json(
        { error: errorData.error || 'Erreur lors du téléchargement du document' },
        { status: response.status }
      )
    }

    const result = await response.json()
    
    return NextResponse.json({
      message: 'Document téléchargé avec succès',
      data: result
    })

  } catch (error) {
    console.error('Erreur lors du téléchargement du document:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('access_token')?.value
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer le statut de vérification depuis l'API Glodist
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/identity/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Token expiré' },
          { status: 401 }
        )
      }
      
      return NextResponse.json(
        { error: 'Erreur lors de la récupération du statut de vérification' },
        { status: response.status }
      )
    }

    const verificationData = await response.json()
    
    return NextResponse.json(verificationData)

  } catch (error) {
    console.error('Erreur lors de la récupération du statut de vérification:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}