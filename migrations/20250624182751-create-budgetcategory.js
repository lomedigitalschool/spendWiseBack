'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('budget_categories', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      budget_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'budgets', key: 'id' },
        onDelete: 'CASCADE'
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'categories', key: 'id' },
        onDelete: 'CASCADE'
      },
      allocated_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0.00 },
      alert_threshold: { type: Sequelize.INTEGER, validate: { min: 0, max: 100 } },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    await queryInterface.addConstraint('budget_categories', {
      fields: ['budget_id', 'category_id'],
      type: 'unique',
      name: 'unique_category_per_budget'
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('budget_categories');
  }
};