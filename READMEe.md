# SpendWiseBack – Backend

## Présentation

**SpendWiseBack** est le backend d’une application de gestion budgétaire personnelle. Il fournit une API REST sécurisée permettant la gestion des utilisateurs, des transactions, des objectifs financiers, des catégories et la génération de statistiques.  
Ce backend est développé en **Node.js** avec **Express** et utilise **PostgreSQL** via **Sequelize** comme ORM.

---

## Fonctionnalités principales

- **Authentification JWT** (inscription, connexion)
- **Gestion des utilisateurs**
- **Gestion des transactions** (ajout, consultation, suppression, modification)
- **Gestion des objectifs financiers (goals)**
- **Gestion des catégories**
- **Statistiques financières personnalisées**
- **Sécurité des routes protégées**
- **Migrations et seeders Sequelize**

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

3. **Configurer l’environnement**
   - Copier `.env.example` en `.env` et adapter les variables (DB, JWT_SECRET, etc.) :
     ```
     DB_NAME=your_db
     DB_USER=your_user
     DB_PASSWORD=your_password
     DB_HOST=localhost
     DB_PORT=5432
     JWT_SECRET=your_jwt_secret
     ```

4. **Créer la base de données PostgreSQL**
   - Via pgAdmin ou psql :
     ```sql
     CREATE DATABASE your_db;
     ```

5. **Lancer les migrations Sequelize**
   ```sh
   npx sequelize-cli db:migrate
   ```

6. **(Optionnel) Lancer les seeders**
   ```sh
   npx sequelize-cli db:seed:all
   ```

---

## Lancement du serveur

```sh
npm start
```
Le serveur démarre par défaut sur le port `5000` (modifiable dans `.env`).

---

## Structure des dossiers

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
└── README.md
```

---

## Principales routes de l’API

### Authentification

- `POST /api/auth/register` – Inscription
- `POST /api/auth/login` – Connexion

### Utilisateurs

- `GET /api/users/me` – Infos utilisateur connecté

### Transactions

- `GET /api/transactions` – Liste des transactions
- `POST /api/transactions` – Ajouter une transaction
- `PUT /api/transactions/:id` – Modifier une transaction
- `DELETE /api/transactions/:id` – Supprimer une transaction

### Objectifs (Goals)

- `GET /api/goals` – Liste des objectifs
- `POST /api/goals` – Ajouter un objectif
- `PUT /api/goals/:id` – Modifier un objectif
- `DELETE /api/goals/:id` – Supprimer un objectif

### Catégories

- `GET /api/categories` – Liste des catégories
- `POST /api/categories` – Ajouter une catégorie

### Statistiques

- `GET /api/stats` – Statistiques financières

---

## Sécurité

- Authentification par **JWT** : toutes les routes sensibles nécessitent un token dans l’en-tête `Authorization: Bearer <token>`.
- Les mots de passe sont hashés avec **bcryptjs**.

---

## Bonnes pratiques

- **Ne jamais versionner le fichier `.env`** contenant vos secrets.
- Utiliser des migrations pour toute modification de structure de la base.
- Protéger les routes sensibles avec le middleware d’authentification.

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

## Contact

Pour toute question ou suggestion, contactez l’équipe via [GitHub Issues](https://github.com/lomedigitalschool/spendWiseBack/issues).
