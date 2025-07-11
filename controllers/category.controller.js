const { Category, BudgetCategory } = require('../models');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {

  
  try {
      console.log("===> getCategories lancé");
    console.log("req.user:", req.user); // 👀 Doit afficher l’utilisateur

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié.' });
    }


  
    const categories = await Category.findAll({
       where: { user_id: userId },
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
    console.log('Requête reçue avec body:', req.body);
  const { name, user_id } = req.body;

  // Validation de l’entrée utilisateur
  if (!name || name.trim() === '' || !user_id) {
    return res.status(400).json({ message: 'Le nom de la catégorie est requis.' });
  }
  try {
    const [category, created] = await Category.findOrCreate({ 
      where: { name: name.trim(), user_id },
      defaults: { name: name.trim(), user_id }
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
    console.error('Erreur dans getCategoryById:', error);

    res.status(500).json({
      message: 'Erreur serveur lors de la récupération.',
       error: process.env.NODE_ENV === 'development' ? error.message : null
      //error: error.message
    });
  }
};

// GET : Récupérer une catégorie par ID
const getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée.' });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération.',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

//  PUT : Mettre à jour une catégorie
// @desc    Update category by ID
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const user_id = req.user.id;

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Le nom de la catégorie est requis.' });
  }

  try {
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée.' });
    }

    category.name = name.trim();
    await category.save();

    res.status(200).json({
      message: 'Catégorie mise à jour avec succès.',
      category: { id: category.id, name: category.name }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur lors de la mise à jour.',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    // Vérifier si cette catégorie est utilisée dans budget_categories
    const usageCount = await BudgetCategory.count({
      where: { category_id: id }
    });

    if (usageCount > 0) {
      return res.status(400).json({
        message: "Impossible de supprimer cette catégorie : elle est liée a un budget."
      });
    }

    const deleted = await Category.destroy({ where: { id } });

    if (deleted === 0) {
      return res.status(404).json({ message: "Catégorie non trouvée." });
    }

    return res.status(200).json({ message: "Catégorie supprimée avec succès." });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

module.exports = {
  getCategories,
  addCategory,
  getCategoryById,     
  updateCategory,   
  deleteCategory,  
};
