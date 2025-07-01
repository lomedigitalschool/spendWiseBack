const { Category } = require('../models');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Add a category
// @route   POST /api/categories
// @access  Private (Admin)
const addCategory = async (req, res) => {
  const { name } = req.body;

  // Validation de l’entrée utilisateur
  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Le nom de la catégorie est requis.' });
  }

  try {
    const [category, created] = await Category.findOrCreate({ 
      where: { name: name.trim() },
      defaults: { name: name.trim() }
    });

    if (!created) {
      return res.status(200).json({ 
        message: 'Cette catégorie existe déjà.',
        category: { id: category.id, name: category.name }
      });
    }

    res.status(201).json({ 
      message: 'Catégorie créée avec succès.',
      category: { id: category.id, name: category.name }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur serveur.',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

module.exports = {
  getCategories,
  addCategory
};
