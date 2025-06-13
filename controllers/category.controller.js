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

  try {
    const [category, created] = await Category.findOrCreate({ 
      where: { name },
      defaults: { name }
    });

    if (!created) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    res.status(201).json({ 
      message: 'Category added',
      category: { id: category.id, name: category.name }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

module.exports = {
  getCategories,
  addCategory
};