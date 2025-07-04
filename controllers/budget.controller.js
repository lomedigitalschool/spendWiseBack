const { Budget, BudgetCategory, Category, Transaction } = require('../models');
const { validationResult } = require('express-validator');
const { Op, sequelize } = require('sequelize');
const { getCategoryAlert } = require('../services/alerteService.js');

// @desc    Update entire budget with categories
// @route   PUT /api/budgets/:id
// @access  Private
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
const updateBudget = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const budgetId = req.params.id;
    const userId = req.user.id;
    const { name, month, year, categories } = req.body;

    // Verify budget ownership
    const budget = await Budget.findOne({ 
      where: { id: budgetId, user_id: userId },
      transaction: t
    });

    if (!budget) {
      await t.rollback();
      return res.status(404).json({ message: "Budget not found" });
    }

    // Check for existing transactions if changing month/year
    if (month && month !== budget.month) {
      const hasTransactions = await Transaction.findOne({
        where: {
          budget_categories_id: {
            [Op.in]: sequelize.literal(
              `(SELECT id FROM budget_categories WHERE budget_id = ${budgetId})`
            )
          }
        },
        transaction: t
      });

      if (hasTransactions) {
        await t.rollback();
        return res.status(400).json({ 
          message: "Cannot change month/year with existing transactions" 
        });
      }
    }

    // Update budget
    budget.name = name || budget.name;
    budget.month = month || budget.month;
    budget.year = year || budget.year;
    await budget.save({ transaction: t });

    // Delete old categories
    await BudgetCategory.destroy({ 
      where: { budget_id: budgetId },
      transaction: t 
    });

    // Add new categories
    const categoryRecords = await Promise.all(
      categories.map(async (cat) => {
        const [category] = await Category.findOrCreate({
          where: { 
            id: cat.category_id || cat.id,
            user_id: userId 
          },
          defaults: { 
            name: cat.name, 
            user_id: userId 
          },
          transaction: t
        });

        return {
          budget_id: budgetId,
          category_id: category.id,
          allocated_amount: cat.allocated_amount,
          alert_threshold: cat.alert_threshold,
        };
      })
    );

    await BudgetCategory.bulkCreate(categoryRecords, { transaction: t });

    // Calculate analytics
    const updatedCategories = await BudgetCategory.findAll({
      where: { budget_id: budgetId },
      include: [{
        model: Transaction,
        where: { type: 'expense' },
        required: false
      }],
      transaction: t
    });

    const analytics = updatedCategories.map(cat => {
      const totalSpent = cat.Transactions.reduce((sum, t) => sum + t.amount, 0);
      const percentSpent = Math.min(
        Math.round((totalSpent / cat.allocated_amount) * 100),
        100
      );
      
      return {
        category_id: cat.category_id,
        totalSpent,
        percentSpent,
        alerts: percentSpent >= cat.alert_threshold ? [{
          message: `Alerte: ${percentSpent}% du budget dépensé`,
          threshold: cat.alert_threshold
        }] : []
      };
    });

    await t.commit();

    return res.status(200).json({
      message: "Budget updated successfully",
      budget,
      categories: categoryRecords,
      analytics
    });

  } catch (error) {
    await t.rollback();
    console.error("Budget update error:", error);
    return res.status(500).json({ 
      message: "Server error during budget update",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update single budget category
// @route   PATCH /api/budgets/:budgetId/categories/:categoryId
// @access  Private
const updateSingleBudgetCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { budgetId, categoryId } = req.params;
    const userId = req.user.id;
    const { allocated_amount, alert_threshold } = req.body;

    // Verify ownership
    const budget = await Budget.findOne({ 
      where: { id: budgetId, user_id: userId } 
    });
    if (!budget) {
      return res.status(404).json({ message: "Budget not found or unauthorized" });
    }

    // Verify category link
    const budgetCategory = await BudgetCategory.findOne({
      where: {
        budget_id: budgetId,
        category_id: categoryId
      }
    });
    if (!budgetCategory) {
      return res.status(404).json({ message: "Category not linked to this budget" });
    }

    // Update category
    budgetCategory.allocated_amount = allocated_amount;
    budgetCategory.alert_threshold = alert_threshold;
    await budgetCategory.save();

    // Get alert status
    const alert = await getCategoryAlert(budgetId, categoryId);

    return res.status(200).json({
      message: "Budget category updated successfully",
      updatedCategory: budgetCategory,
      alert: alert || null
    });

  } catch (error) {
    console.error("Update category error:", error);
    return res.status(500).json({ 
      message: "Server error during category update",
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
  updateBudget,
  getBudgets,
  updateSingleBudgetCategory,
  createBudget
};