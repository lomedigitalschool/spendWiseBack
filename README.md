# SpendWiseBack – Backend

## Présentation

**SpendWiseBack** est le backend d’une application de gestion budgétaire personnelle. Il expose une API REST sécurisée permettant la gestion des utilisateurs, des transactions, des objectifs financiers, des catégories et la génération de statistiques.  
Ce backend est développé en **Node.js** avec **Express** et utilise **PostgreSQL** via **Sequelize** comme ORM.

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Architecture et Structure du projet](#architecture-et-structure-du-projet)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Lancement du serveur](#lancement-du-serveur)
- [Principales routes de l’API](#principales-routes-de-lapi)
- [Tests avec Postman](#tests-avec-postman)
- [Sécurité](#sécurité)
- [Bonnes pratiques](#bonnes-pratiques)
- [Contribution](#contribution)
- [Licence](#licence)
- [Contact](#contact)

---

## Fonctionnalités

- Authentification JWT (inscription, connexion)
- Gestion des utilisateurs
- Gestion des transactions (ajout, consultation, suppression, modification)
- Gestion des objectifs financiers (goals)
- Gestion des catégories
- Statistiques financières personnalisées
- Sécurité des routes protégées
- Migrations et seeders Sequelize

---

## Architecture et Structure du projet

```
.
├── config/           # Configuration Sequelize et base de données
├── controllers/      # Logique métier des routes
├── migrations/       # Scripts de migration Sequelize
├── models/           # Modèles Sequelize
├── routes/           # Définition des routes Express
├── seeders/          # Données d’exemple (optionnel)
├── middleware/       # Middlewares Express (auth, etc.)
├── server.js         # Point d’entrée principal
├── .env.example      # Exemple de configuration d'environnement
├── package.json      # Dépendances et scripts npm
└── README.md         # Documentation du projet
```

---

## Prérequis

- [Node.js](https://nodejs.org/) (v16+ recommandé)
- [npm](https://www.npmjs.com/)
- [PostgreSQL](https://www.postgresql.org/) (v12+ recommandé)

---

## Installation

1. **Cloner le dépôt**
   ```sh
   git clone https://github.com/lomedigitalschool/spendWiseBack.git
   cd spendWiseBack
   ```

2. **Installer les dépendances**
   ```sh
   npm install
   ```

---

## Configuration

1. **Configurer l’environnement**
   - Copier `.env.example` en `.env` et adapter les variables (DB, JWT_SECRET, etc.) :
     ```
     DB_NAME=your_db
     DB_USER=your_user
     DB_PASSWORD=your_password
     DB_HOST=localhost
     DB_PORT=5432
     JWT_SECRET=your_jwt_secret
     ```

2. **Créer la base de données PostgreSQL**
   - Via pgAdmin ou psql :
     ```sql
     CREATE DATABASE your_db;
     ```

3. **Lancer les migrations Sequelize**
   ```sh
   npx sequelize-cli db:migrate
   ```

---

## Lancement du serveur

```sh
npm start
```
Le serveur démarre par défaut sur le port `5000` (modifiable dans `.env`).

---

## Principales routes de l’API

Voir la [documentation API complète](./API_DOCUMENTATION.md) pour le détail de chaque endpoint.

---

## Tests avec Postman

1. Télécharge le fichier `SpendWiseBack.postman_collection.json` fourni.
2. Ouvre Postman, clique sur `Importer` et sélectionne ce fichier.
3. Renseigne la variable `{{token}}` avec le JWT obtenu après le login pour tester les routes protégées.


### Authentification & Utilisateur

- POST /api/users/register – Inscription
- POST /api/users/login – Connexion
- GET /api/users/profile – Infos utilisateur connecté (JWT requis)


-GET /api/dashbord - Données utilisateur;Solde de l’utilisateur;Somme des dépenses  expense du mois courant
Somme des revenus income du mois courant
5 dernières transactions
Objectifs de l’utilisateur avec currentAmount / targetAmount
Somme dépensée par catégorie ce mois-ci

### Transactions

- GET /api/transactions – Liste des transactions de l’utilisateur (JWT requis)
- POST /api/transactions – Ajouter une transaction (JWT requis)
- DELETE /api/transactions/:id – Supprimer une transaction (JWT requis)
- GET /api/transactions/all – Lister toutes les transactions (JWT requis, usage admin/debug)

### Objectifs (Goals)

- GET /api/goals – Liste des objectifs (JWT requis)
- POST /api/goals – Ajouter un objectif (JWT requis)
- PUT /api/goals/:id – Modifier un objectif (JWT requis)
- DELETE /api/goals/:id – Supprimer un objectif (JWT requis)

### Catégories

- GET /api/categories – Liste des catégories
- POST /api/categories – Ajouter une catégorie (JWT requis)

### Statistiques

- GET /api/stats/transactions/stats/categories – Statistiques par catégorie (JWT requis)
- GET /api/stats/transactions/stats/monthly – Statistiques mensuelles (JWT requis)
- GET /api/stats/goals/compare – Comparaison des objectifs (JWT requis)

---

## Sécurité

- Authentification par **JWT** : toutes les routes sensibles nécessitent un token dans l’en-tête `Authorization: Bearer <token>`.
- Les mots de passe sont hashés avec **bcryptjs**.
- Les entrées sont validées côté serveur.

---

## Bonnes pratiques

- **Ne jamais versionner le fichier `.env`** contenant vos secrets.
- Utiliser des migrations pour toute modification de structure de la base.
- Protéger les routes sensibles avec le middleware d’authentification.
- Documenter toute nouvelle route ou fonctionnalité.

---

## Contribution

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/ma-feature`)
3. Commitez vos modifications (`git commit -am 'Ajout de ma feature'`)
4. Poussez la branche (`git push origin feature/ma-feature`)
5. Ouvrez une Pull Request

---

## Licence

Ce projet est sous licence MIT.

---

## 👥 Contributeurs

- Sewanou Samson Edorh-Tossa (samwin25)
- Sylvie ADONSOU (Sylvieads)

## Contact

Pour toute question ou suggestion, contactez l’équipe via [GitHub Issues](https://github.com/lomedigitalschool/spendWiseBack/issues).
