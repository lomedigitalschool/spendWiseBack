const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const userRoutes = require('./routes/userRoutes');// 👈 


dotenv.config();

const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboard');
const { sequelize } = require('./models');

const app = express();

// Middlewares globaux
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/users', userRoutes);
app.use('/api', dashboardRoutes);
app.use('api/auth', require('./routes/userRoutes'));

// Middleware pour les routes non trouvées
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Middleware global de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Une erreur est survenue' });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('✅ Connexion à la base de données réussie');
    return sequelize.sync({ alter: true }); // force: false par défaut
  })
  .then(() => {
    console.log('✅ Base de données synchronisée');
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Erreur de synchronisation ou de connexion à la base de données :', err);
  });

module.exports = app;