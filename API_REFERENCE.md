# Référence API — Glodist

Base URL : `http://localhost:8000/api/v1`

Toutes les requêtes vers des endpoints protégés nécessitent le header :
```
Authorization: Bearer <access_token>
```

Les réponses sont toujours en JSON. Les dates sont au format ISO 8601.

---

## Sommaire

- [Authentification](#authentification)
- [Profil & mot de passe](#profil--mot-de-passe)
- [Adresses](#adresses)
- [Boutiques (privé)](#boutiques-privé)
- [Boutiques (public)](#boutiques-public)
- [Produits](#produits)
- [Catégories](#catégories)
- [Médias](#médias)
- [Paniers](#paniers)
- [Commandes](#commandes)
- [Abonnements](#abonnements)
- [Paiements](#paiements)
- [Conversions monétaires](#conversions-monétaires)

---

## Authentification

### Inscription
```
POST /auth/register/
```
Corps :
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "0600000000",
  "password": "StrongPass123!"
}
```
Réponse `201` :
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "0600000000",
  "role": "client",
  "account_status": "active",
  "can_sell": false,
  "created_at": "2026-04-26T10:00:00Z"
}
```

---

### Connexion
```
POST /auth/login/
```
Corps :
```json
{
  "email": "john@example.com",
  "password": "StrongPass123!"
}
```
Réponse `200` :
```json
{
  "access": "<access_token>",
  "refresh": "<refresh_token>",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "0600000000",
    "role": "client",
    "account_status": "active",
    "can_sell": false,
    "created_at": "2026-04-26T10:00:00Z"
  }
}
```

---

### Déconnexion
```
POST /auth/logout/
🔒 Authentifié
```
Corps :
```json
{
  "refresh": "<refresh_token>"
}
```
Réponse `200` :
```json
{ "message": "Logged out successfully." }
```

---

### Rafraîchir le token
```
POST /auth/token/refresh/
```
Corps :
```json
{
  "refresh": "<refresh_token>"
}
```
Réponse `200` :
```json
{
  "access": "<nouveau_access_token>"
}
```

---

## Profil & mot de passe

### Voir / modifier le profil
```
GET  /auth/profile/
PUT  /auth/profile/
🔒 Authentifié
```
Corps (PUT, tous les champs optionnels) :
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "0600000000"
}
```
Réponse `200` : même structure que l'objet `user` de la connexion.

---

### Changer le mot de passe
```
PUT /auth/password/change/
🔒 Authentifié
```
Corps :
```json
{
  "old_password": "AncienPass123!",
  "new_password": "NouveauPass456!"
}
```
Réponse `200` :
```json
{ "message": "Password changed successfully." }
```

---

### Mot de passe oublié
```
POST /auth/password/forgot/
```
Corps :
```json
{
  "email": "john@example.com"
}
```
Réponse `200` :
```json
{ "message": "Password reset email sent." }
```

---

### Réinitialiser le mot de passe
```
POST /auth/password/reset/
```
Corps :
```json
{
  "uid": "<uid_depuis_email>",
  "token": "<token_depuis_email>",
  "new_password": "NouveauPass456!"
}
```
Réponse `200` :
```json
{ "message": "Password reset successfully." }
```

---

### Vérifier l'email
```
POST /auth/email/verify/
```
Corps :
```json
{
  "uid": "<uid_depuis_email>",
  "token": "<token_depuis_email>"
}
```
Réponse `200` :
```json
{ "message": "Email verified successfully." }
```

---

### Renvoyer l'email de vérification
```
POST /auth/email/resend/
🔒 Authentifié
```
Pas de corps requis.

Réponse `200` :
```json
{ "message": "Verification email sent." }
```

---

## Adresses

### Lister / créer
```
GET  /auth/addresses/
POST /auth/addresses/
🔒 Authentifié
```
Corps (POST) :
```json
{
  "city": "Paris",
  "district": "Montmartre",
  "description": "Bâtiment B, 3ème étage",
  "address_type": "home"
}
```
> `address_type` : `home` | `work` | `other`

Réponse `201` :
```json
{
  "id": 1,
  "city": "Paris",
  "district": "Montmartre",
  "description": "Bâtiment B, 3ème étage",
  "address_type": "home"
}
```

---

### Détail / modifier / supprimer
```
GET    /auth/addresses/<id>/
PUT    /auth/addresses/<id>/
DELETE /auth/addresses/<id>/
🔒 Authentifié
```

---

## Boutiques (privé)

### Lister / créer ses boutiques
```
GET  /auth/shops/
POST /auth/shops/
🔒 Authentifié
```
Corps (POST) :
```json
{
  "name": "Ma Boutique",
  "description": "Description de ma boutique"
}
```
Réponse `201` :
```json
{
  "id": 1,
  "name": "Ma Boutique",
  "description": "Description de ma boutique",
  "validation_status": "pending",
  "created_at": "2026-04-26T10:00:00Z",
  "validated_at": null,
  "owner": 1,
  "owner_name": "John Doe"
}
```
> `validation_status` : `pending` | `validated` | `rejected`

---

### Détail / modifier / supprimer
```
GET    /auth/shops/<id>/
PUT    /auth/shops/<id>/
DELETE /auth/shops/<id>/
🔒 Authentifié
```

---

## Boutiques (public)

### Liste des boutiques validées
```
GET /shops/
```
Réponse `200` :
```json
{
  "count": 10,
  "next": "http://localhost:8000/api/v1/shops/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Ma Boutique",
      "description": "Description",
      "created_at": "2026-04-26T10:00:00Z",
      "owner_name": "John Doe",
      "total_products": 5
    }
  ]
}
```

---

### Détail public d'une boutique
```
GET /shops/<id>/
```
Réponse `200` : même structure qu'un élément de la liste ci-dessus.

---

### Produits d'une boutique
```
GET /shops/<id>/products/
```
Réponse `200` :
```json
{
  "shop": { "id": 1, "name": "Ma Boutique", "..." : "..." },
  "products": [ { "...": "..." } ],
  "total_products": 5
}
```

---

### Commandes d'une boutique
```
GET /shops/<id>/orders/
🔒 Propriétaire ou admin
```
Réponse `200` :
```json
{
  "shop": { "...": "..." },
  "orders": [ { "...": "..." } ],
  "total_orders": 3
}
```

---

### Statistiques d'une boutique
```
GET /shops/<id>/stats/
🔒 Propriétaire ou admin
```
Réponse `200` :
```json
{
  "shop": { "id": 1, "name": "Ma Boutique", "...": "..." },
  "products": {
    "total": 10,
    "active": 8,
    "total_stock": 150,
    "avg_price": "24.99"
  },
  "sales": {
    "total_quantity": 42,
    "total_revenue": "1049.58",
    "total_orders": 15
  }
}
```

---

## Produits

### Lister les produits
```
GET /products/
```
Paramètres de filtre (query string) :

| Paramètre | Type | Exemple | Description |
|-----------|------|---------|-------------|
| `category` | integer | `?category=2` | Filtrer par catégorie |
| `shop` | integer | `?shop=1` | Filtrer par boutique |
| `status` | string | `?status=active` | `active` \| `inactive` \| `out_of_stock` |
| `search` | string | `?search=chaussure` | Recherche dans nom et description |
| `ordering` | string | `?ordering=-price` | `price`, `-price`, `created_at`, `-created_at`, `name` |
| `page` | integer | `?page=2` | Pagination |

Réponse `200` :
```json
{
  "count": 50,
  "next": "http://localhost:8000/api/v1/products/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Sneakers Classic",
      "description": "Une belle paire de sneakers",
      "price": "49.99",
      "stock": 20,
      "created_at": "2026-04-26T10:00:00Z",
      "updated_at": "2026-04-26T10:00:00Z",
      "status": "active",
      "category": 2,
      "category_label": "Chaussures",
      "shop": 1,
      "shop_name": "Ma Boutique",
      "medias": [
        { "id": 1, "media_type": "image", "url": "https://..." }
      ]
    }
  ]
}
```

---

### Créer un produit
```
POST /products/
🔒 Authentifié (doit avoir une boutique)
```
Corps :
```json
{
  "name": "Sneakers Classic",
  "description": "Une belle paire de sneakers",
  "price": "49.99",
  "stock": 20,
  "status": "active",
  "category": 2
}
```
> `status` : `active` | `inactive` | `out_of_stock`

---

### Détail / modifier / supprimer
```
GET    /products/<id>/
PUT    /products/<id>/
DELETE /products/<id>/
```

---

## Catégories

### Lister / créer
```
GET  /products/categories/
POST /products/categories/
```
Corps (POST) :
```json
{
  "label": "Chaussures",
  "description": "Toutes les chaussures"
}
```
Réponse `201` :
```json
{
  "id": 1,
  "label": "Chaussures",
  "description": "Toutes les chaussures"
}
```

---

### Détail / modifier / supprimer
```
GET    /products/categories/<id>/
PUT    /products/categories/<id>/
DELETE /products/categories/<id>/
```

---

## Médias

### Lister / ajouter un média à un produit
```
GET  /products/<product_id>/medias/
POST /products/<product_id>/medias/
🔒 Authentifié
```
Corps (POST) :
```json
{
  "media_type": "image",
  "url": "https://example.com/image.jpg"
}
```
> `media_type` : `image` | `video`

Réponse `201` :
```json
{
  "id": 1,
  "media_type": "image",
  "url": "https://example.com/image.jpg"
}
```

---

## Paniers

### Lister / créer un panier
```
GET  /products/carts/
POST /products/carts/
🔒 Authentifié
```
Corps (POST) :
```json
{
  "code": "CART-ABC123"
}
```
Réponse `200` (GET détail) :
```json
{
  "id": 1,
  "code": "CART-ABC123",
  "created_at": "2026-04-26T10:00:00Z",
  "items": [
    {
      "id": 1,
      "product": 3,
      "product_name": "Sneakers Classic",
      "product_price": "49.99",
      "quantity": 2
    }
  ],
  "total": "99.98"
}
```

---

### Détail / modifier / supprimer
```
GET    /products/carts/<id>/
PUT    /products/carts/<id>/
DELETE /products/carts/<id>/
🔒 Authentifié
```

---

### Articles d'un panier
```
GET  /products/carts/<cart_id>/items/
POST /products/carts/<cart_id>/items/
🔒 Authentifié
```
Corps (POST) :
```json
{
  "product": 3,
  "quantity": 2
}
```
Réponse `201` :
```json
{
  "id": 1,
  "product": 3,
  "product_name": "Sneakers Classic",
  "product_price": "49.99",
  "quantity": 2
}
```

---

## Commandes

### Lister / créer
```
GET  /orders/
POST /orders/
🔒 Authentifié
```
Paramètre de filtre : `?status=pending`

> `status` : `pending` | `confirmed` | `processing` | `shipped` | `delivered` | `cancelled`

Corps (POST) :
```json
{
  "total_price": "99.98",
  "note": "Livraison rapide svp"
}
```
Réponse `201` :
```json
{
  "id": 1,
  "created_at": "2026-04-26T10:00:00Z",
  "updated_at": "2026-04-26T10:00:00Z",
  "status": "pending",
  "total_price": "99.98",
  "note": "Livraison rapide svp",
  "user": 1,
  "user_name": "John Doe",
  "items": []
}
```

---

### Détail / modifier / supprimer
```
GET    /orders/<id>/
PUT    /orders/<id>/
DELETE /orders/<id>/
🔒 Authentifié
```

---

## Abonnements

### Lister / créer
```
GET  /orders/subscriptions/
POST /orders/subscriptions/
🔒 Authentifié
```
Corps (POST) :
```json
{
  "shop": 1
}
```
Réponse `201` :
```json
{
  "id": 1,
  "created_at": "2026-04-26T10:00:00Z",
  "user": 1,
  "user_name": "John Doe",
  "shop": 1,
  "shop_name": "Ma Boutique"
}
```

---

### Détail / supprimer
```
GET    /orders/subscriptions/<id>/
DELETE /orders/subscriptions/<id>/
🔒 Authentifié
```

---

## Paiements

### Lister / créer
```
GET  /payments/
POST /payments/
🔒 Authentifié
```
Paramètre de filtre : `?status=pending`

Corps (POST) :
```json
{
  "order": 1,
  "amount": "99.98",
  "method": "card",
  "payment_info": "Informations complémentaires"
}
```
> `method` : `card` | `paypal` | `transfer` | `cash` | `mobile`

Réponse `201` :
```json
{
  "id": 1,
  "amount": "99.98",
  "payment_info": "Informations complémentaires",
  "status": "pending",
  "method": "card",
  "provider_reference": "",
  "created_at": "2026-04-26T10:00:00Z",
  "updated_at": "2026-04-26T10:00:00Z",
  "order": 1,
  "order_id": 1
}
```

---

### Détail / modifier
```
GET /payments/<id>/
PUT /payments/<id>/
🔒 Authentifié
```

---

### Traiter un paiement
```
POST /payments/<id>/process/
🔒 Authentifié
```
Pas de corps requis.

Réponse `200` :
```json
{
  "message": "Payment processed successfully.",
  "payment": {
    "id": 1,
    "status": "success",
    "...": "..."
  }
}
```

---

## Conversions monétaires

### Lister les taux de change
```
GET /payments/conversions/
```
Réponse `200` :
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "from_currency": "EUR",
      "to_currency": "USD",
      "rate": "1.082500",
      "updated_at": "2026-04-26T10:00:00Z"
    }
  ]
}
```

---

## Codes de réponse

| Code | Signification |
|------|---------------|
| `200` | Succès |
| `201` | Ressource créée |
| `400` | Données invalides |
| `401` | Non authentifié |
| `403` | Accès refusé |
| `404` | Ressource introuvable |
| `429` | Trop de requêtes (rate limit) |

## Limites de débit

| Type | Limite |
|------|--------|
| Anonyme | 30 requêtes / minute |
| Authentifié | 100 requêtes / minute |
