'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Supprime la colonne 'deadline' de la table 'Goals'
    await queryInterface.removeColumn('Goals', 'deadline');
  },

  async down (queryInterface, Sequelize) {
    // Permet de revenir en arrière : rajoute la colonne 'deadline'
    await queryInterface.addColumn('Goals', 'deadline', {
      type: Sequelize.DATE,
    });
    
  }
};