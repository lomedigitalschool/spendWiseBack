'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    balance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00, validate: { min: 0 } },
    has_set_balance: { type: DataTypes.BOOLEAN, defaultValue: false },
    reset_token: DataTypes.STRING,
    reset_token_expiry: DataTypes.DATE
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true
  });

  User.associate = models => {
    User.hasMany(models.Category, { foreignKey: 'user_id' });
    User.hasMany(models.Budget, { foreignKey: 'user_id' });
    User.hasMany(models.Transaction, { foreignKey: 'user_id' });
  };

  return User;
};