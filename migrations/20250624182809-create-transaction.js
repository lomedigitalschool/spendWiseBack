'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`CREATE TYPE "enum_Transactions_type" AS ENUM ('income', 'expense')`);
    await queryInterface.createTable('Transactions', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE'
      },
      budget_categories_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Budget_Categories', key: 'id' },
        onDelete: 'CASCADE'
      },
      type: { type: Sequelize.ENUM('income', 'expense'), allowNull: false },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      description: { type: Sequelize.STRING },
      transaction_date: { type: Sequelize.DATEONLY, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Transactions');
    await queryInterface.sequelize.query(`DROP TYPE "enum_Transactions_type"`);
  }
};