module.exports = (sequelize, DataTypes) => {
  const Goal = sequelize.define('Goal', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    targetAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    currentAmount: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    frequency: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
      allowNull: false,
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    CategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'Goals',
    timestamps: true,
    underscored: true
  });

  return Goal;
};
