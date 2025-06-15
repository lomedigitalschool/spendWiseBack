# Documentation API Complète – SpendWiseBack

---

## Introduction

Cette documentation décrit tous les endpoints de l’API REST du backend **SpendWiseBack**.  
Toutes les routes protégées nécessitent un token JWT dans l’en-tête :  
`Authorization: Bearer <votre_token>`

---

## Authentification & Utilisateur

### 1. Inscription

**POST** `/api/users/register`  
**Body :**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

---

### 2. Connexion

**POST** `/api/users/login`  
**Body :**
```json
{
  "email": "john@example.com",
  "password": "123456"
}
```

---

### 3. Profil utilisateur

**GET** `/api/users/profile`  
**Headers :** `Authorization: Bearer <token>`

---

### 4. dashboard

**GET** `/api/dashboard`  
**Headers :** `Authorization: Bearer <token>`

---

## Transactions

### 5. Créer une transaction

**POST** `/api/transactions`  
**Headers :** `Authorization: Bearer <token>`  
**Body :**
```json
{
  "amount": 100,
  "type": "income", // ou "expense"
  "description": "Salaire",
  "date": "2025-06-14",
  "categoryId": 1
}
```

---

### 6. Lister les transactions de l'utilisateur

**GET** `/api/transactions`  
**Headers :** `Authorization: Bearer <token>`

---

### 7. Supprimer une transaction

**DELETE** `/api/transactions/:id`  
**Headers :** `Authorization: Bearer <token>`

---

### 8. Lister toutes les transactions (admin ou debug)

**GET** `/api/transactions/transactions`  
**Headers :** `Authorization: Bearer <token>`

---

## Objectifs (Goals)

### 9. Créer un objectif

**POST** `/api/goals`  
**Headers :** `Authorization: Bearer <token>`  
**Body :**
```json
{
  "title": "Économiser pour un voyage",
  "amount": 500
}
```

---

### 10. Lister les objectifs

**GET** `/api/goals`  
**Headers :** `Authorization: Bearer <token>`

---

### 11. Modifier un objectif

**PUT** `/api/goals/:id`  
**Headers :** `Authorization: Bearer <token>`  
**Body :**
```json
{
  "title": "Voyage à Paris",
  "amount": 600
}
```

---

### 12. Supprimer un objectif

**DELETE** `/api/goals/:id`  
**Headers :** `Authorization: Bearer <token>`

---

## Catégories

### 13. Créer une catégorie

**POST** `/api/categories`  
**Headers :** `Authorization: Bearer <token>`  
**Body :**
```json
{
  "name": "Alimentation"
}
```

---

### 14. Lister les catégories

**GET** `/api/categories`

---

## Statistiques

### 15. Statistiques par catégorie

**GET** `/api/stats/transactions/stats/categories`  
**Headers :** `Authorization: Bearer <token>`

---

### 16. Statistiques mensuelles

**GET** `/api/stats/transactions/stats/monthly`  
**Headers :** `Authorization: Bearer <token>`

---

### 17. Comparaison des objectifs

**GET** `/api/stats/goals/compare`  
**Headers :** `Authorization: Bearer <token>`

---

## Résumé des routes

| Méthode | Endpoint                                      | Authentification | Description                        |
|---------|-----------------------------------------------|------------------|------------------------------------|
| POST    | /api/users/register                           | Non              | Inscription utilisateur            |
| POST    | /api/users/login                              | Non              | Connexion utilisateur              |
| GET     | /api/users/profile                            | Oui              | Profil utilisateur 
|GET      | /api/dashboard         |                      |Oui               | View  
utilisateur Dashboard
| POST    | /api/transactions                             | Oui              | Créer une transaction              |
| GET     | /api/transactions                             | Oui              | Lister transactions utilisateur    |
| DELETE  | /api/transactions/:id                         | Oui              | Supprimer une transaction          |
| GET     | /api/transactions/transactions                | Oui              | Lister toutes les transactions     |
| POST    | /api/goals                                    | Oui              | Créer un objectif                  |
| GET     | /api/goals                                    | Oui              | Lister les objectifs               |
| PUT     | /api/goals/:id                                | Oui              | Modifier un objectif               |
| DELETE  | /api/goals/:id                                | Oui              | Supprimer un objectif              |
| POST    | /api/categories                               | Oui              | Créer une catégorie                |
| GET     | /api/categories                               | Non              | Lister les catégories              |
| GET     | /api/stats/transactions/stats/categories      | Oui              | Statistiques par catégorie         |
| GET     | /api/stats/transactions/stats/monthly         | Oui              | Statistiques mensuelles            |
| GET     | /api/stats/goals/compare                      | Oui              | Comparaison des objectifs          |

---

## Sécurité

- Toutes les routes sauf `/register`, `/login` et `GET /categories` nécessitent un JWT valide.
- Le token JWT doit être envoyé dans l’en-tête :  
  `Authorization: Bearer <token>`

---

## Gestion des erreurs

- **401 Unauthorized** : Token manquant ou invalide
- **404 Not Found** : Ressource non trouvée
- **400 Bad Request** : Données invalides
- **500 Internal Server Error** : Erreur serveur

---

## Remarques

- Toutes les dates sont au format ISO 8601.
- Les IDs sont des entiers auto-incrémentés.
- Les réponses d’erreur sont au format JSON.

---

Pour toute question ou suggestion, ouvrez une issue sur le dépôt GitHub du projet.