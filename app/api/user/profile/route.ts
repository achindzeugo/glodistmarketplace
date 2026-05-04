import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { extractApiErrorMessage, normalizeUser } from '@/lib/user-normalizer'

const API_BASE_URL = 'https://glodistapi.onrender.com/api/v1'

function mapRoleToApi(role: string | undefined) {
  switch ((role || '').toLowerCase()) {
    case 'vendeur':
    case 'seller':
      return 'seller'
    case 'admin':
      return 'admin'
    case 'client':
    default:
      return 'client'
  }
}

function mapStatusToApi(status: string | undefined) {
  switch ((status || '').toLowerCase()) {
    case 'actif':
    case 'active':
      return 'active'
    case 'pending':
    case 'en attente':
      return 'pending'
    case 'inactive':
    case 'inactif':
      return 'inactive'
    case 'suspended':
    case 'suspendu':
      return 'suspended'
    default:
      return 'active'
  }
}

async function fetchRemoteProfile(authToken: string) {
  const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(extractApiErrorMessage(error, 'Erreur lors de la récupération du profil'))
  }

  return response.json()
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth_token')?.value

    if (!authToken) {
      return NextResponse.json(
        { error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const profileData = await fetchRemoteProfile(authToken)
    return NextResponse.json(normalizeUser(profileData))

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth_token')?.value

    if (!authToken) {
      return NextResponse.json(
        { error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const updateData = await request.json()
    const currentProfile = await fetchRemoteProfile(authToken)

    const payload = {
      username: updateData.username || currentProfile.username,
      email: updateData.email || currentProfile.email,
      first_name: updateData.first_name || updateData.prenom || currentProfile.first_name || '',
      last_name: updateData.last_name || updateData.nom || currentProfile.last_name || '',
      phone: updateData.phone || updateData.telephone || currentProfile.phone || '',
      role: mapRoleToApi(updateData.role || currentProfile.role),
      account_status: mapStatusToApi(updateData.account_status || updateData.statut_compte || currentProfile.account_status),
      can_sell: typeof updateData.can_sell === 'boolean'
        ? updateData.can_sell
        : typeof updateData.vente === 'boolean'
        ? updateData.vente
        : !!currentProfile.can_sell,
      ...(updateData.password ? { password: updateData.password } : {}),
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const error = await response.json().catch(() => null)
      return NextResponse.json(
        { error: extractApiErrorMessage(error, 'Erreur lors de la mise à jour du profil') },
        { status: response.status }
      )
    }

    const updatedProfile = await response.json()
    const normalizedUser = normalizeUser(updatedProfile)

    const nextResponse = NextResponse.json(normalizedUser)
    nextResponse.cookies.set('user_data', JSON.stringify(normalizedUser), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })

    return nextResponse

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
