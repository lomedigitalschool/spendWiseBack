// utils/initializeDefaultCategories.js
const { Category } = require('../models');

const defaultCategories = [
  'Alimentation',
  'Logement',
  'Transport',
  'Loisirs',
  'Santé',
  'Éducation',
  'Autres'
];

const initializeDefaultCategories = async () => {
  try {
    for (const name of defaultCategories) {
      await Category.findOrCreate({ where: { name } });
    }
    console.log('✅ Catégories par défaut vérifiées ou créées avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l’initialisation des catégories :', error.message);
  }
};

module.exports = initializeDefaultCategories;
