const { Category } = require('../models');

async function createInitialData() {
  try {
    const defaultCategories = [
      { name: 'Alimentation'},
      { name: 'Logement'},
      { name: 'Transport'},
      { name: 'Loisirs'},
      { name: 'Santé'},
      { name: 'Éducation'},
      { name: 'Autres'}
    ];

    for (const category of defaultCategories) {
      await Category.findOrCreate({ 
        where: { name: category.name },
        
      });
    }

    console.log('✅ initial data created successfully!', defaultCategories.map(c => c.name).join(', '));
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    process.exit(); // Ferme la connexion après exécution
  }
}

// ...existing code...

const sequelize = require('../config/db');

sequelize.authenticate()
  .then(() => createInitialData())
  .catch(err => console.error('❌ Error: unable to connect to the database', err));