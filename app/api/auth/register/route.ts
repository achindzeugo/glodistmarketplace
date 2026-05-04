import { NextRequest, NextResponse } from 'next/server'
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

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()

    const payload = {
      username: userData.username,
      email: userData.email,
      first_name: userData.first_name || userData.prenom || '',
      last_name: userData.last_name || userData.nom || '',
      phone: userData.phone || userData.telephone || '',
      password: userData.password,
      role: mapRoleToApi(userData.role),
      account_status: mapStatusToApi(userData.account_status || userData.statut_compte),
      can_sell: typeof userData.can_sell === 'boolean'
        ? userData.can_sell
        : mapRoleToApi(userData.role) === 'seller',
    }

    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const error = await response.json().catch(() => null)
      return NextResponse.json(
        { error: extractApiErrorMessage(error, 'Erreur lors de l\'inscription') },
        { status: response.status }
      )
    }

    const createdUser = await response.json()

    return NextResponse.json({
      user: normalizeUser(createdUser),
      message: 'Inscription réussie'
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
