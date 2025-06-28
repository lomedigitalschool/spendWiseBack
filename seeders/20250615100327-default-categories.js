'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const defaultCategories = [
      { name: 'Alimentation', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Logement', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Transport', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Loisirs', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Santé', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Éducation', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Autres', createdAt: new Date(), updatedAt: new Date() },
    ];

    await queryInterface.bulkInsert('Categories', defaultCategories, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Categories', null, {});
  }
};
