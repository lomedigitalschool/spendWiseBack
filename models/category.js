'use strict';
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false }
  }, {
    tableName: 'Categories',
    timestamps: true,
    underscored: true
  });

  Category.associate = models => {
    Category.belongsTo(models.User, { foreignKey: 'user_id' });
    Category.hasMany(models.BudgetCategory, { foreignKey: 'category_id' });
  };

  return Category;
};
