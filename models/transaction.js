'use strict';
module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    budget_category_id: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.ENUM('income', 'expense'), allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } },
    description: DataTypes.STRING,
    transaction_date: { type: DataTypes.DATEONLY, allowNull: false }
  }, {
    tableName: 'transactions',
    timestamps: true,
    underscored: true
  });

  Transaction.associate = models => {
    Transaction.belongsTo(models.User, { foreignKey: 'user_id' });
    Transaction.belongsTo(models.BudgetCategory, { foreignKey: 'budget_category_id' });
  };

  return Transaction;
};