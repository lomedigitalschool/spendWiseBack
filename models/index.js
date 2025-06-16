const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Initialisation des modèles
const User = require('./user.model')(sequelize, DataTypes);
const Category = require('./category.model')(sequelize, DataTypes);
const Transaction = require('./transaction.model')(sequelize, DataTypes);
const Goal = require('./goal.model')(sequelize, DataTypes);

// Associations

// 🔗 User -> Transaction
User.hasMany(Transaction, {
  foreignKey: {
    name: 'UserId',
    allowNull: false
  },
  onDelete: 'CASCADE'
});
Transaction.belongsTo(User, {
  foreignKey: {
    name: 'UserId',
    allowNull: false
  }
});

// 🔗 User -> Goal
User.hasMany(Goal, {
  foreignKey: {
    name: 'UserId',
    allowNull: false
  },
  onDelete: 'CASCADE'
});
Goal.belongsTo(User, {
  foreignKey: {
    name: 'UserId',
    allowNull: false
  }
});

// 🔗 Category -> Transaction
Category.hasMany(Transaction, {
  foreignKey: {
    name: 'CategoryId',
    allowNull: true // SET NULL autorisé
  },
  onDelete: 'SET NULL'
});
Transaction.belongsTo(Category, {
  foreignKey: {
    name: 'CategoryId',
    allowNull: true
  }
});

// 🔗 Category -> Goal
Category.hasMany(Goal, {
  foreignKey: {
    name: 'CategoryId',
    allowNull: true // SET NULL autorisé
  },
  onDelete: 'SET NULL'
});
Goal.belongsTo(Category, {
  foreignKey: {
    name: 'CategoryId',
    allowNull: true
  }
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
