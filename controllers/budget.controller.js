const { Budget, BudgetCategory, Category } = require('../models');
const { validationResult } = require('express-validator');

const createBudget = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id; // JWT decoded
    const { name, month, year, categories } = req.body;

    // Création du budget
    const newBudget = await Budget.create({
      name,
      month,
      year,
      user_id: userId,
    });

    // Insertion des catégories liées au budget
    const categoryRecords = await Promise.all(categories.map(async (cat) => {
      const category = await Category.findOrCreate({
        where: { name: cat.name, user_id: userId },
        defaults: { name: cat.name, user_id: userId }
      });

      return {
        budget_id: newBudget.id,
        category_id: category[0].id,
        allocated_amount: cat.allocated_amount,
        alert_threshold: cat.alert_threshold,
      };
    }));

    await BudgetCategory.bulkCreate(categoryRecords);

    return res.status(201).json({
      message: "Votre budget a été créé avec succès.",
      budget: newBudget,
    });

  } catch (error) {
    console.error("Erreur création budget :", error);
    return res.status(500).json({ message: "Erreur serveur lors de la création du budget." });
  }
};

module.exports = {
  createBudget
};
