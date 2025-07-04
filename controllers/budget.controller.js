const { Budget, BudgetCategory, Category, Transaction } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const updateSingleBudgetCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { budgetId, categoryId } = req.params;
    const userId = req.user.id;
    const { allocated_amount, alert_threshold } = req.body;

    // Vérification ownership
    const budget = await Budget.findOne({ 
      where: { id: budgetId, user_id: userId } 
    });
    if (!budget) {
      return res.status(404).json({ message: "Budget non trouvé ou non autorisé." });
    }

    // Vérification lien catégorie/budget
    const budgetCategory = await BudgetCategory.findOne({
      where: {
        budget_id: budgetId,
        category_id: categoryId
      }
    });
    if (!budgetCategory) {
      return res.status(404).json({ message: "Catégorie non liée à ce budget." });
    }

    // Mise à jour
    budgetCategory.allocated_amount = allocated_amount;
    budgetCategory.alert_threshold = alert_threshold;
    await budgetCategory.save();

    // Calcul des indicateurs
    const transactions = await Transaction.findAll({
      where: {
        budget_categories_id: budgetCategory.id,
        type: 'expense'
      }
    });

    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const percentSpent = Math.min(
      Math.round((totalSpent / allocated_amount) * 100),
      100
    );

    const alerts = [];
    if (percentSpent >= alert_threshold) {
      alerts.push({
        categoryId,
        message: `Alerte: ${percentSpent}% du budget dépensé`,
        threshold: alert_threshold
      });
    }

    return res.status(200).json({
      message: "Catégorie mise à jour avec succès",
      updatedCategory: budgetCategory,
      analytics: {
        totalSpent,
        percentSpent,
        alerts
      }
    });

  } catch (error) {
    console.error("Erreur updateSingleBudgetCategory:", error);
    return res.status(500).json({ 
      message: "Erreur serveur lors de la mise à jour",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
//recuperation des budgets
const getBudgets = async (req , res ) => {
  const userId = req.user.id;

  try {
    const budgets = await Budget.findAll({
      where: { user_id: userId },
      include: [{ model: BudgetCategory }],
    });

    res.json(budgets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

module.exports = {
  updateSingleBudgetCategory,
  getBudgets,
};