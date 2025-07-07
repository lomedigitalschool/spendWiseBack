const { Budget, BudgetCategory, Category, Transaction } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');

const createBudget = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { name, month, year, categories } = req.body;
    const userId = req.user.id;

    // Validation manuelle supplémentaire
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Le format des catégories est invalide'
      });
    }

    // Création du budget
    const budget = await Budget.create({
      name,
      month,
      year,
      user_id: userId,
      amount: categories.reduce((sum, cat) => sum + parseFloat(cat.allocated_amount), 0)
    }, { transaction: t });

    // Création des catégories
    const createdCategories = await Promise.all(
      categories.map(async cat => {
        const [category] = await Category.findOrCreate({
          where: { 
            name: cat.name.trim(),
            user_id: userId 
          },
          defaults: {
            name: cat.name.trim(),
            user_id: userId
          },
          transaction: t
        });

        return BudgetCategory.create({
          budget_id: budget.id,
          category_id: category.id,
          allocated_amount: cat.allocated_amount,
          alert_threshold: cat.alert_threshold || 80
        }, { transaction: t });
      })
    );

    await t.commit();

    return res.status(201).json({
      success: true,
      message: 'Budget créé avec succès',
      data: {
        budget,
        categories: createdCategories
      }
    });

  } catch (error) {
    await t.rollback();
    console.error('Erreur création budget:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du budget',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const updateBudget = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, month, year, categories } = req.body;

    // Vérification du budget
    const budget = await Budget.findOne({ 
      where: { id, user_id: userId },
      transaction: t
    });

    if (!budget) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Budget non trouvé'
      });
    }

    // Mise à jour du budget
    if (name) budget.name = name;
    if (month) budget.month = month;
    if (year) budget.year = year;
    await budget.save({ transaction: t });

    // Mise à jour des catégories
    if (categories) {
      await BudgetCategory.destroy({ 
        where: { budget_id: id },
        transaction: t 
      });

      await BudgetCategory.bulkCreate(
        categories.map(cat => ({
          budget_id: id,
          category_id: cat.id,
          allocated_amount: cat.allocated_amount,
          alert_threshold: cat.alert_threshold
        })),
        { transaction: t }
      );
    }

    await t.commit();

    return res.status(200).json({
      success: true,
      message: 'Budget mis à jour avec succès',
      data: await Budget.findByPk(id, {
        include: [{
          model: BudgetCategory,
          as: 'budgetCategories',
          include: [Category]
        }]
      })
    });

  } catch (error) {
    await t.rollback();
    console.error('Erreur mise à jour budget:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du budget',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: BudgetCategory,
        as: 'budgetCategories',
        include: [Category]
      }],
      order: [['year', 'DESC'], ['month', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets
    });
  } catch (error) {
    console.error('Erreur récupération budgets:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des budgets',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getBudgetAlerts = async (req, res) => {
  try {
    const { budgetId } = req.params;
    const userId = req.user.id;

    // Vérification du budget
    const budget = await Budget.findOne({
      where: { id: budgetId, user_id: userId }
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget non trouvé'
      });
    }

    // Récupération des alertes
    const categories = await BudgetCategory.findAll({
      where: { budget_id: budgetId },
      include: [
        { model: Category, attributes: ['id', 'name'] },
        { 
          model: Transaction, 
          where: { type: 'expense' },
          required: false,
          attributes: ['amount'] 
        }
      ]
    });

    const alerts = categories.map(cat => {
      const totalSpent = cat.Transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const percentSpent = Math.min(Math.round((totalSpent / cat.allocated_amount) * 100), 100);
      
      return {
        category_id: cat.category_id,
        category_name: cat.Category.name,
        allocated_amount: cat.allocated_amount,
        spent: totalSpent,
        percent_spent: percentSpent,
        alert_threshold: cat.alert_threshold,
        has_alert: percentSpent >= cat.alert_threshold
      };
    }).filter(cat => cat.has_alert);

    return res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    console.error('Erreur récupération alertes:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des alertes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const updateSingleBudgetCategory = async (req, res) => {
  const t = await sequelize.transaction();  
  try {
    const { budgetId, categoryId } = req.params;
    const userId = req.user.id;
    const { allocated_amount, alert_threshold } = req.body; 
    // Vérification du budget
    const budget = await Budget.findOne({   
      where: { id: budgetId, user_id: userId },
      transaction: t
    }); 
    if (!budget) {
      await t.rollback(); 
      return res.status(404).json({
        success: false,
        message: 'Budget non trouvé'  
      }); 
    }

    // Vérification de la catégorie
    const budgetCategory = await BudgetCategory.findOne({
      where: { budget_id: budgetId, category_id: categoryId },
      transaction: t
    });

    if (!budgetCategory) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    } 

    budgetCategory.allocated_amount = allocated_amount;
    budgetCategory.alert_threshold = alert_threshold;
    await budgetCategory.save({ transaction: t });  
    await t.commit();   
    return res.status(200).json({
      success: true,
      message: 'Catégorie de budget mise à jour avec succès',
      data: budgetCategory
    });
  } catch (error) {
    await t.rollback();
    console.error('Erreur mise à jour catégorie budget:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la catégorie de budget',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



module.exports = {
  createBudget,
  updateBudget,
  getBudgets,
  getBudgetAlerts,
  updateSingleBudgetCategory

};