const sequelize = require('../config/db.js');
const User = require('./user.model.js');
const Category = require('./category.model.js');
const Transaction = require('./transaction.model.js');
const Goal = require('./goal.model.js');

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