const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


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
  },
  currentAmount: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  frequency: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
    allowNull: false,
  }
});
return Goal;
} 