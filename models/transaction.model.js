module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        isFloat: { msg: 'Le montant doit être un nombre.' },
        min: { args: [0], msg: 'Le montant doit être supérieur ou égal à 0.' }
      }
    },
    type: {
      type: DataTypes.ENUM('income', 'expense'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['income', 'expense']],
          msg: 'Le type doit être "income" ou "expense".'
        }
      }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
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
    tableName: 'Transactions',
    timestamps: true,
    underscored: true
  });

  return Transaction;
};
