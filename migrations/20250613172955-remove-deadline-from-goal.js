'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Vérifie si la colonne 'deadline' existe avant de la supprimer
    const table = await queryInterface.describeTable('Goals');
    if (table.deadline) {
      await queryInterface.removeColumn('Goals', 'deadline');
      console.log("✅ Colonne 'deadline' supprimée de la table 'Goals'");
    } else {
      console.log("ℹ️ La colonne 'deadline' n'existe pas dans la table 'Goals'");
    }
  },

  async down(queryInterface, Sequelize) {
    // Réajoute la colonne 'deadline' si on fait un rollback
    await queryInterface.addColumn('Goals', 'deadline', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  }
};
