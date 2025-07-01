# 📘 SpendWiseBack – Documentation de l'API

Cette documentation couvre tous les endpoints disponibles dans le backend **SpendWiseBack**, avec leur méthode, description, URL et détails des paramètres.

---

## 🔐 Authentification & Utilisateur
### 1. Inscription
**POST** /api/users/register
> Crée un nouvel utilisateur.

**Body JSON**
```json
{
  "name": "John",
  "email": "john@example.com",
  "password": "123456"
}
```
### 2. Connexion
**POST** /api/users/login
> Authentifie l'utilisateur et retourne un JWT.

**Body JSON**
```json
{
  "email": "john@example.com",
  "password": "123456"
}
```
### 3. Profil utilisateur
**GET** /api/users/profile
> Retourne les informations du profil utilisateur connecté.

**Headers**
- `Authorization: Bearer <token>`

---

## 4 Page de budget 

**GET** /api/budgets
> Retourne :
- Info utilisateur
- Solde
- Revenu et dépenses du mois courant
- 5 dernières transactions
- Résumé par catégorie

**Headers**
- `Authorization: Bearer <token>`

---

## 💰 Transactions
### 5. Créer une transaction

**POST** /api/transactions
> Crée une transaction.

**Body JSON**
```json
{
  "amount": 100,
  "type": "income",
  "description": "Salaire",
  "date": "2025-06-14",
  "categoryId": 1
}
```
### 6. Lister les transactions de l'utilisateur
**GET** /api/transactions
> Liste paginée des transactions de l’utilisateur avec filtres (`startDate`, `endDate`, `categoryId`, `type`, `page`, `limit`).

### 7. Supprimer une transaction
**DELETE** /api/transactions/:id
> Supprime une transaction par ID.

### 8. Lister toutes les transactions (admin ou debug)
**GET** /api/transactions/all
> Liste **complète** des transactions (admin/debug)

**Headers**
- `Authorization: Bearer <token>`

---





## 🏷️ Catégories

### 9. Créer une catégorie

**POST** /api/categories
> Ajoute une nouvelle catégorie.

**Body JSON**
```json
{ "name": "Alimentation" }


      { name: 'Alimentation',categoryId 1 },
      { name: 'Logement', categoryId 2 },
      { name: 'Transport', categoryId 3  },
      { name: 'Transport', categoryId 4  },
      { name: 'Loisirs', categoryId 5 },
      { name: 'Santé', categoryId 6 },
      { name: 'Éducation', categoryId 7 },
      { name: 'Autres', categoryId 8},



### 10. Lister les catégories
**GET** /api/categories
> Liste des catégories.

---

## 📈 Statistiques


### 11. Statistiques par catégorie
**GET** /api/stats/transactions/stats/categories
> Donne les dépenses et revenus par catégorie (type income/expense).


### 12. Statistiques mensuelles

**GET** /api/stats/transactions/stats/monthly?year=2025
> Donne les revenus et dépenses mensuels pour une année.




**Headers pour tous**
- `Authorization: Bearer <token>`

---



## Résumé des routes

| Méthode | Endpoint                                      | Authentification | Description                        |
|---------|-----------------------------------------------|------------------|------------------------------------|
| POST    | /api/users/register                           | Non              | Inscription utilisateur            |
| POST    | /api/users/login                              | Non              | Connexion utilisateur              |
| GET     | /api/users/profile                            | Oui              | Profil utilisateur
|GET      |  /api/users/balance                           |Oui               |Modification du solde initial
|POST     |  /api/users/balance                           |Oui               |Recuperation du solde initial        |

| POST    | /api/transactions                             | Oui     |Créer une transaction    

|
| GET     | /api/transactions                             | Oui     | Lister transactions utilisateur paginé et filtré     |

| DELETE  | /api/transactions/:id                         | Oui     | Supprimer une transaction          |


| GET     | /api/transactions/all                         | Oui  | Lister en tableau toutes les transactions sans pagination    |

| POST    | /api/categories                               | Oui     | Créer une catégorie                |
| GET     | /api/categories                               | Non     | Lister les catégories              |
| GET     | /api/stats/transactions/stats/categories      | Oui     | Statistiques par catégorie         |
| GET     | /api/stats/transactions/stats/monthly         | Oui     | Statistiques mensuelles            |
| GET     | /api/stats/goals/compare                      | Oui     | Comparaison des objectifs          |


## 13📌 Remarques

- Toutes les routes marquées "JWT requis" nécessitent un token dans l'en-tête :
  ```
  Authorization: Bearer <votre_token>
  ```

- En cas d'erreur, les réponses sont formatées comme suit :
```json
{
  "message": "Erreur serveur"
}
```