const { Budget, BudgetCategory, Category, Transaction } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const createBudget = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { name, month, year, categories } = req.body;

    // Vérification doublon de budget
    const existingBudget = await Budget.findOne({
      where: {
        user_id: userId,
        month,
        year
      }
    });

    if (existingBudget) {
      return res.status(400).json({ 
        message: "Un budget existe déjà pour ce mois et cette année." 
      });
    }

    // Calcul du total alloué
    const total_amount = categories.reduce(
      (sum, cat) => sum + parseFloat(cat.allocated_amount),
      0
    );

    // Création du budget
    const newBudget = await Budget.create({
      name,
      month,
      year,
      user_id: userId,
      total_amount
    });

    // Gestion des catégories
    const categoryRecords = await Promise.all(
      categories.map(async (cat) => {
        const [category] = await Category.findOrCreate({
          where: { 
            name: cat.name, 
            user_id: userId 
          },
          defaults: { 
            name: cat.name, 
            user_id: userId 
          }
        });

        return {
          budget_id: newBudget.id,
          category_id: category.id,
          allocated_amount: cat.allocated_amount,
          alert_threshold: cat.alert_threshold || 100, // Valeur par défaut
        };
      })
    );

    await BudgetCategory.bulkCreate(categoryRecords);

    // Récupération du budget complet avec relations
    const createdBudget = await Budget.findByPk(newBudget.id, {
      include: [
        {
          model: Category,
          through: { 
            attributes: ['allocated_amount', 'alert_threshold'] 
          }
        }
      ]
    });

    return res.status(201).json({
      message: "Budget créé avec succès.",
      budget: createdBudget,
      total_amount
    });

  } catch (error) {
    console.error("Erreur création budget :", error);
    return res.status(500).json({ 
      message: "Erreur serveur lors de la création du budget.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createBudget
};
