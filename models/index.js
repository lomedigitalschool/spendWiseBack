const sequelize = require('../config/db');
const User = require('./user.model');
const Category = require('./category.model');
const Transaction = require('./transaction.model');
const Goal = require('./goal.model');

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
async function syncModels() {
  try {
    await sequelize.sync({ alter: true });
    console.log('Models synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing models:', error);
  }
}

syncModels();

module.exports = {
  User,
  Category,
  Transaction,
  Goal,
};