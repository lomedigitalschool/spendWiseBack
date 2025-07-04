const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
//const initializeDefaultCategories = require('./utils/initializeDefaultCategories');
require('dotenv').config();

// Import des routes
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
//const goalRoutes = require('./routes/goalRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
//const statsRoutes = require('./routes/statsRoutes');
//const dashboardRoutes = require('./routes/dashboardRoutes');
const budgetRoutes = require('./routes/budgetRoutes');

dotenv.config();

const app = express();

// Middlewares globaux
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/users', userRoutes); // ✅ auth/register, auth/login, auth/profile
app.use('/api/transactions', transactionRoutes);
//app.use('/api/goals', goalRoutes);
app.use('/api/categories', categoryRoutes);
//app.use('/api', statsRoutes); // pour /transactions/stats/* et /goals/compare
//app.use('/api/stats', require('./routes/statsRoutes'));
//app.use('/api', dashboardRoutes); // ✅ /dashboard
app.use('/api/budgets', budgetRoutes); // ✅ /budgets, /budgets/:id


// Route de test
app.get('/', (req, res) => res.send('✅ API Budget App opérationnelle'));

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Gestion d’erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Une erreur est survenue' });
});

// Démarrage du serveur avec initialisation des catégories
const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('✅ Connexion à la base de données réussie');
    return sequelize.sync(); // ⚠️ Ne PAS utiliser { force: true } ici
  })
  .then(async () => {
    console.log('✅ Base de données synchronisée');

    // Injection des catégories par défaut si manquantes
    //await initializeDefaultCategories();

    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Erreur de synchronisation ou de connexion à la base de données :', err);
  });

module.exports = app;
