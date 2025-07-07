'use strict';
module.exports = (sequelize, DataTypes) => {
  const BudgetCategory = sequelize.define('BudgetCategory', {
    budget_id: { type: DataTypes.INTEGER, allowNull: false },
    category_id: { type: DataTypes.INTEGER, allowNull: false },
    allocated_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } },
    alert_threshold: { type: DataTypes.INTEGER, validate: { min: 0, max: 100 } }
  }, {
    tableName: 'budget_categories',
    timestamps: true,
    underscored: true,
    indexes: [{
      unique: true,
      fields: ['budget_id', 'category_id']
    }]
  });

  BudgetCategory.associate = models => {
    BudgetCategory.belongsTo(models.Budget, { foreignKey: 'budget_id' });
    BudgetCategory.belongsTo(models.Category, { foreignKey: 'category_id' });
    BudgetCategory.hasMany(models.Transaction, { foreignKey: 'budget_category_id' });
  };

  return BudgetCategory;
};