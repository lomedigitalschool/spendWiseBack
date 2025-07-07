'use strict';
module.exports = (sequelize, DataTypes) => {
  const Budget = sequelize.define('Budget', {
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    month: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 12 } },
    year: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 }, comment: 'Montant automatiquement calculé' },
  }, {
    tableName: 'budgets',
    timestamps: true,
    underscored: true,
    indexes: [{
      unique: true,
      fields: ['user_id', 'month', 'year']
    }]
  });

  Budget.associate = models => {
    Budget.belongsTo(models.User, { foreignKey: 'user_id' });
    Budget.hasMany(models.BudgetCategory, { foreignKey: 'budget_id', as: 'budgetCategories' });
  };

  return Budget;
};