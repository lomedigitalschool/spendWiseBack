'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('budgets');
    
    if (!tableDescription.amount) {
      await queryInterface.addColumn('budgets', 'amount', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      });
    }

    if (tableDescription.total_amount) {
      await queryInterface.removeColumn('budgets', 'total_amount');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('budgets', 'amount');
    await queryInterface.addColumn('budgets', 'total_amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });
  }
};