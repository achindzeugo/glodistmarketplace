# Glodist Marketplace

Plateforme e-commerce camerounaise mettant en relation acheteurs et vendeurs vérifiés. Construite avec Next.js 16 et connectée à l'API Glodist.

---

## Stack technique

- **Framework** : Next.js 16 (App Router)
- **Langage** : TypeScript 5 (strict)
- **Style** : Tailwind CSS 4 + shadcn/ui (New York)
- **État panier** : Zustand (persisté en localStorage)
- **Auth** : JWT via cookies HTTP-only (proxy Next.js)
- **Analytics** : Vercel Analytics

---

## Prérequis

- Node.js 18+
- npm ou pnpm
- API Glodist accessible (voir configuration)

---

## Installation

```bash
npm install
```

Créer le fichier `.env.local` à la racine :

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Lancer le serveur de développement :

```bash
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

---

## Structure du projet

```
├── app/
│   ├── api/                    # Routes API Next.js (proxy vers Glodist)
│   │   ├── auth/
│   │   │   ├── login/          # POST — connexion + pose des cookies
│   │   │   ├── logout/         # POST — déconnexion + suppression cookies
│   │   │   ├── register/       # POST — inscription
│   │   │   └── refresh/        # POST — renouvellement du token
│   │   ├── products/           # GET liste + GET [id]
│   │   ├── shops/              # GET liste + GET [id]
│   │   ├── orders/             # GET + POST (protégé)
│   │   ├── profile/            # GET + PUT (protégé)
│   │   ├── my-shops/           # GET + POST boutiques du vendeur (protégé)
│   │   └── identity/           # POST upload document d'identité (protégé)
│   ├── (pages)/
│   │   ├── page.tsx            # Accueil — produits en vedette
│   │   ├── products/           # Catalogue avec recherche
│   │   ├── product/[id]/       # Fiche produit dynamique
│   │   ├── shops/              # Liste des boutiques
│   │   ├── shops/[id]/         # Profil d'une boutique
│   │   ├── cart/               # Panier (Zustand)
│   │   ├── login/              # Connexion
│   │   ├── signup/             # Inscription
│   │   ├── profile/            # Profil utilisateur + commandes + vérification
│   │   ├── dashboard/          # Tableau de bord vendeur
│   │   └── shop-registration/  # Demande d'ouverture de boutique
│   ├── layout.tsx              # Layout racine (lang="fr", font Geist)
│   └── globals.css
├── components/
│   ├── navbar.tsx              # Navigation avec état d'auth réel
│   ├── product-card.tsx        # Carte produit avec ajout au panier
│   ├── add-to-cart-button.tsx  # Bouton client pour pages Server Component
│   └── ui/                     # Composants shadcn/ui
├── lib/
│   ├── api.ts                  # Client API centralisé (apiFetch)
│   ├── auth.ts                 # Lecture cookie client + logout
│   └── cart-store.ts           # Store Zustand du panier
├── middleware.ts               # Protection des routes + redirections
└── .env.local                  # Variables d'environnement (à créer)
```

---

## Authentification

L'auth repose sur un système de proxy Next.js pour ne jamais exposer les tokens au navigateur.

**Flux de connexion :**
1. Le client envoie `email` + `password` à `/api/auth/login`
2. La route Next.js appelle l'API Glodist et reçoit `access` + `refresh` + `user`
3. `access_token` et `refresh_token` sont stockés en cookies **HTTP-only** (inaccessibles au JS)
4. `user_data` est stocké en cookie lisible côté client (données non sensibles uniquement)

**Protection des routes** via `middleware.ts` :

| Route | Comportement |
|-------|-------------|
| `/profile`, `/cart`, `/dashboard`, `/shop-registration` | Redirige vers `/login` si non connecté |
| `/login`, `/signup` | Redirige vers `/` si déjà connecté |

---

## Panier

Le panier est géré par Zustand et persisté en `localStorage` sous la clé `glodist-cart`. Il est indépendant de l'API et fonctionne sans connexion. Les articles sont groupés par boutique à l'affichage.

---

## Routes API disponibles

Toutes les routes sont des proxies vers `NEXT_PUBLIC_API_URL`. Les routes protégées lisent le cookie `access_token` côté serveur.

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/api/auth/login` | — | Connexion |
| POST | `/api/auth/logout` | — | Déconnexion |
| POST | `/api/auth/register` | — | Inscription |
| POST | `/api/auth/refresh` | — | Renouvellement token |
| GET | `/api/products` | — | Liste produits (filtrables) |
| GET | `/api/products/[id]` | — | Détail produit |
| GET | `/api/shops` | — | Liste boutiques |
| GET | `/api/shops/[id]` | — | Détail boutique |
| GET/POST | `/api/orders` | ✓ | Commandes |
| GET/PUT | `/api/profile` | ✓ | Profil utilisateur |
| GET/POST | `/api/my-shops` | ✓ | Boutiques du vendeur |
| POST | `/api/identity` | ✓ | Upload pièce d'identité |

---

## Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL de base de l'API Glodist | `http://localhost:8000/api/v1` |

---

## Scripts

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run start    # Serveur de production
npm run lint     # Vérification ESLint
```

---

## Rôles utilisateurs

| Rôle | Accès |
|------|-------|
| `client` | Navigation, panier, commandes, profil |
| Vendeur (`can_sell: true`) | Tout ce qui précède + tableau de bord boutique |

---

## Licence

Projet privé — © 2026 Glodist. Tous droits réservés.
