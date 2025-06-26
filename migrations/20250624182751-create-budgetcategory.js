module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Budget_Categories', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      budget_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Budgets', key: 'id' },
        onDelete: 'CASCADE'
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Categories', key: 'id' },
        onDelete: 'CASCADE'
      },
      allocated_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      alert_threshold: { type: Sequelize.INTEGER },
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
    await queryInterface.addConstraint('Budget_Categories', {
      fields: ['budget_id', 'category_id'],
      type: 'unique',
      name: 'unique_category_per_budget'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('Budget_Categories');
  }
};
