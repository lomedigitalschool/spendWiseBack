const { User, Category } = require('../models');

async function createInitialData() {
  try {
    // Créer des catégories par défaut
    const defaultCategories = [
      'Alimentation',
      'Logement',
      'Transport',
      'Loisirs',
      'Santé',
      'Éducation',
      'Autres',
    ];

    for (const name of defaultCategories) {
      await Category.findOrCreate({ where: { name } });
    }

    console.log('Initial data created successfully');
  } catch (error) {
    console.error('Error creating initial data:', error);
  }
}

createInitialData();