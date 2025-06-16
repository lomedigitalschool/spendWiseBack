const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Initialisation des modèles
const User = require('./user.model')(sequelize, DataTypes);
const Category = require('./category.model')(sequelize, DataTypes);
const Transaction = require('./transaction.model')(sequelize, DataTypes);
const Goal = require('./goal.model')(sequelize, DataTypes);

// Associations

// Un utilisateur a plusieurs transactions
User.hasMany(Transaction, {
  foreignKey: {
    name: 'UserId',
    allowNull: false
  },
  onDelete: 'CASCADE'
});
Transaction.belongsTo(User, {
  foreignKey: 'UserId'
});

// Un utilisateur a plusieurs objectifs
User.hasMany(Goal, {
  foreignKey: {
    name: 'UserId',
    allowNull: false
  },
  onDelete: 'CASCADE'
});
Goal.belongsTo(User, {
  foreignKey: 'UserId'
});

// Une catégorie a plusieurs transactions
Category.hasMany(Transaction, {
  foreignKey: {
    name: 'CategoryId',
    allowNull: true   // ✅ cohérent avec SET NULL
  },
  onDelete: 'SET NULL'
});
Transaction.belongsTo(Category, {
  foreignKey: 'CategoryId'
});

// Une catégorie a plusieurs objectifs
Category.hasMany(Goal, {
  foreignKey: {
    name: 'CategoryId',
    allowNull: true   // ✅ cohérent avec SET NULL
  },
  onDelete: 'SET NULL'
});
Goal.belongsTo(Category, {
  foreignKey: 'CategoryId'
});

// Exportation
module.exports = {
  sequelize,
  Sequelize,
  User,
  Category,
  Transaction,
  Goal,
};
