const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Initialisation des modèles
const User = require('./user.model')(sequelize, DataTypes);
const Category = require('./category.model')(sequelize, DataTypes);
const Transaction = require('./transaction.model')(sequelize, DataTypes);
const Goal = require('./goal.model')(sequelize, DataTypes);

// Associations
User.hasMany(Transaction);
Transaction.belongsTo(User);

User.hasMany(Goal);
Goal.belongsTo(User);

Category.hasMany(Transaction);
Transaction.belongsTo(Category);

Category.hasMany(Goal);
Goal.belongsTo(Category);

// Synchronisation des modèles avec la base de données
//async function syncModels() {
  //try {
    //await sequelize.sync({ alter: true }); // ou { force: true } pour réinitialiser la BDD
    //console.log('✅ Modèles synchronisés avec succès');
  //} catch (error) {
    //console.error('❌ Erreur lors de la synchronisation des modèles :', error);
  //}
//}

//syncModels();

// Exportation des modèles et de sequelize
module.exports = {
  sequelize,
  Sequelize,
  User,
  Category,
  Transaction,
  Goal,
};
