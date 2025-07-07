'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];

const db = {};

// Initialisation de la connexion Sequelize
const sequelize = config.use_env_variable
  ? new Sequelize(process.env[config.use_env_variable], config)
  : new Sequelize(config.database, config.username, config.password, config);

// Chargement automatique des modèles
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file !== basename &&
      file.endsWith('.js') &&
      !file.includes('.test.js') // Exclure les fichiers de test
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Configuration des associations
Object.keys(db).forEach(modelName => {
  if (typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
});

// Vérification de la connexion à la base de données
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie avec succès.');
  } catch (error) {
    console.error('Impossible de se connecter à la base de données:', error);
  }
})();

// Synchronisation des modèles avec la base de données (optionnel)
if (env === 'development') {
  sequelize.sync({ alter: true })
    .then(() => console.log('Modèles synchronisés avec la base de données'))
    .catch(console.error);
}

// Export des composants
module.exports = {
  sequelize,
  Sequelize,
  ...db,
  models: db // Alias supplémentaire pour accéder aux modèles
};