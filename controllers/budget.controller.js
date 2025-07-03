const { Budget, BudgetCategory, Category, Transaction } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');



const updateBudget = async (req, res) => {
  const t = await sequelize.transaction(); // Transaction pour atomicité
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const budgetId = req.params.id;
    const userId = req.user.id;
    const { name, month, categories } = req.body;

    // Vérification existence budget
    const budget = await Budget.findOne({ 
      where: { id: budgetId, user_id: userId },
      transaction: t
    });

    if (!budget) {
      await t.rollback();
      return res.status(404).json({ message: "Budget introuvable." });
    }

    // Vérification changement de mois avec transactions
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
          message: "Impossible de modifier le mois avec des transactions existantes" 
        });
      }
    }

    // Mise à jour du budget
    budget.name = name || budget.name;
    budget.month = month || budget.month;
    await budget.save({ transaction: t });

    // Suppression anciennes catégories
    await BudgetCategory.destroy({ 
      where: { budget_id: budgetId },
      transaction: t 
    });

    // Ajout nouvelles catégories
    const categoryRecords = await Promise.all(
      categories.map(async (cat) => {
        let category;
        if (cat.id) {
          category = await Category.findOne({
            where: { id: cat.id, user_id: userId },
            transaction: t
          });
          if (!category) throw new Error(`Catégorie ${cat.id} introuvable`);
        } else {
          [category] = await Category.findOrCreate({
            where: { name: cat.name, user_id: userId },
            defaults: { name: cat.name, user_id: userId },
            transaction: t
          });
        }

        return {
          budget_id: budgetId,
          category_id: category.id,
          allocated_amount: cat.allocated_amount,
          alert_threshold: cat.alert_threshold,
        };
      })
    );

    await BudgetCategory.bulkCreate(categoryRecords, { transaction: t });

    // Calcul des analytics
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
      return {
        category_id: cat.category_id,
        totalSpent,
        percentSpent: Math.min(
          Math.round((totalSpent / cat.allocated_amount) * 100),
          100
        )
      };
    });

    await t.commit();

    return res.status(200).json({
      message: "Budget mis à jour avec succès",
      budget,
      categories: categoryRecords,
      analytics
    });

  } catch (error) {
    await t.rollback();
    console.error("Erreur modification budget:", error);
    return res.status(500).json({ 
      message: "Erreur serveur lors de la modification du budget",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



module.exports = {
  updateBudget
};