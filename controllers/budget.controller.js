const { Budget, BudgetCategory, Category, Transaction } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const { getCategoryAlert } = require('../services/alerteService');

const createBudget = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { name, month, year, categories } = req.body;
    const userId = req.user.id;

    // Filtrer les catégories sans nom valide
    let filteredCategories = categories.filter(cat => cat.name && cat.name.trim() !== '');
    // Vérification explicite des doublons par nom (insensible à la casse et aux espaces)
    const nameMap = {};
    let duplicateName = null;
    for (const cat of filteredCategories) {
      const key = (cat.name || '').trim().toLowerCase();
      if (nameMap[key]) {
        duplicateName = cat.name.trim();
        break;
      }
      nameMap[key] = true;
    }
    if (duplicateName) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: `Impossible de créer le budget : deux catégories portent le même nom (« ${duplicateName} »). Veuillez corriger.`
      });
    }

    // LOG: Affiche le payload reçu
    console.log("Payload reçu pour création budget:", req.body);
    console.log("Catégories filtrées:", filteredCategories);

    if (!filteredCategories || !Array.isArray(filteredCategories) || filteredCategories.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Aucune catégorie valide.'
      });
    }

    const totalAmount = filteredCategories.reduce((sum, cat) => sum + (parseFloat(cat.allocated_amount) || 0), 0);

    const budget = await Budget.create({
      name,
      month,
      year,
      user_id: userId,
      amount: totalAmount
    }, { transaction: t });

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
          allocated_amount: parseFloat(cat.allocated_amount) || 0,
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: error.original?.code || error.code
    });
  }
};

const updateBudget = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, month, year, categories } = req.body;

    // Validation du nom
    if (!name || typeof name !== 'string' || name.trim() === '') {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Le nom du budget est requis.' });
    }

    // Validation des catégories
    if (!Array.isArray(categories) || categories.length === 0) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Au moins une catégorie est requise.' });
    }

    // Validation des champs de chaque catégorie
    const seen = new Set();
    for (const cat of categories) {
      if (!cat.name || typeof cat.name !== 'string' || cat.name.trim() === '') {
        await t.rollback();
        return res.status(400).json({ success: false, message: "Le nom de chaque catégorie est requis." });
      }
      const key = cat.name.trim().toLowerCase();
      if (seen.has(key)) {
        await t.rollback();
        return res.status(400).json({ success: false, message: "Doublon de catégorie: " + cat.name });
      }
      seen.add(key);
      if (isNaN(cat.allocated_amount) || Number(cat.allocated_amount) <= 0) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Le montant alloué pour la catégorie '${cat.name}' doit être un nombre positif.` });
      }
      if (isNaN(cat.alert_threshold) || Number(cat.alert_threshold) < 1 || Number(cat.alert_threshold) > 100) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Le pourcentage d'alerte pour la catégorie '${cat.name}' doit être entre 1 et 100.` });
      }
    }

    // Récupérer le budget
    const budget = await Budget.findOne({
      where: { id, user_id: userId },
      transaction: t
    });
    if (!budget) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Budget non trouvé' });
    }

    // Mettre à jour le nom et la période
    budget.name = name;
    if (month) budget.month = month;
    if (year) budget.year = year;
    await budget.save({ transaction: t });

    // Récupérer les catégories existantes pour ce budget
    const existingBudgetCategories = await BudgetCategory.findAll({
      where: { budget_id: id },
      include: [Category],
      transaction: t
    });

    // Pour suppression : trouver les catégories à retirer
    const incomingCategoryNames = categories.map(cat => cat.name.trim().toLowerCase());
    const toDelete = existingBudgetCategories.filter(bc => !incomingCategoryNames.includes(bc.Category.name.trim().toLowerCase()));
    for (const bc of toDelete) {
      await bc.destroy({ transaction: t });
    }

    // Pour ajout/mise à jour
    for (const cat of categories) {
      // Trouver ou créer la catégorie (globale)
      let category = null;
      if (cat.id) {
        category = await Category.findOne({ where: { id: cat.id, user_id: userId }, transaction: t });
      }
      if (!category) {
        // Par nom
        [category] = await Category.findOrCreate({
          where: { name: cat.name.trim(), user_id: userId },
          defaults: { name: cat.name.trim(), user_id: userId },
          transaction: t
        });
      }
      // Vérifier si la catégorie existe déjà dans ce budget
      let budgetCategory = await BudgetCategory.findOne({
        where: { budget_id: id, category_id: category.id },
        transaction: t
      });
      if (budgetCategory) {
        // Mise à jour
        budgetCategory.allocated_amount = parseFloat(cat.allocated_amount);
        budgetCategory.alert_threshold = parseInt(cat.alert_threshold);
        await budgetCategory.save({ transaction: t });
      } else {
        // Ajout
        await BudgetCategory.create({
          budget_id: id,
          category_id: category.id,
          allocated_amount: parseFloat(cat.allocated_amount),
          alert_threshold: parseInt(cat.alert_threshold)
        }, { transaction: t });
      }
    }

    // Recalculer le montant total du budget
    const updatedBudgetCategories = await BudgetCategory.findAll({
      where: { budget_id: id },
      transaction: t
    });
    const totalAmount = updatedBudgetCategories.reduce((sum, bc) => sum + (parseFloat(bc.allocated_amount) || 0), 0);
    budget.amount = totalAmount;
    await budget.save({ transaction: t });

    await t.commit();

    // Retourner le budget mis à jour avec ses catégories
    const updatedBudget = await Budget.findByPk(id, {
      include: [{
        model: BudgetCategory,
        as: 'budgetCategories',
        include: [Category]
      }]
    });

    return res.status(200).json({
      success: true,
      message: 'Budget mis à jour avec succès',
      data: updatedBudget
    });
  } catch (error) {
    await t.rollback();
    console.error('Erreur mise à jour budget:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du budget',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: error.original?.code || error.code
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

/**
 * GET /budgets/:budgetId/alerts
 * Retourne toutes les catégories du budget ayant déclenché une alerte
 */
const getBudgetAlerts = async (req, res) => {
  try {
    const { budgetId } = req.params;
    const userId = req.user.id;

    // verification de l'existence du budget
    const budget = await Budget.findOne({
      where: { id: budgetId, user_id: userId }
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget non trouvé'
      });
    }
     
    // Recuperation des catégories liées à ce budget
    const budgetCategories = await BudgetCategory.findAll({
      where: { budget_id: budgetId }
    });
      // Utilisation de getCategoryAlert pour chaque catégorie
    const alerts = (
      await Promise.all(
        budgetCategories.map(cat =>
          getCategoryAlert(budgetId, cat.category_id)
        )
      )
    ).filter(alert => alert && (alert.thresholdAlertTriggered || alert.hundredPercentAlertTriggered));

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

/**
 * GET /budgets/:budgetId/check-alert?categoryId=...
 * Vérifie si une catégorie déclenche une alerte
 */
const checkBudgetAlert = async (req, res) => {
  try {
    const { budgetId } = req.params;
    const { categoryId } = req.query;
    const userId = req.user.id;

    // Vérification de l'existence du budget
    const budget = await Budget.findOne({
      where: { id: budgetId, user_id: userId }
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget non trouvé'
      });
    }

    const alert = await getCategoryAlert(budgetId, categoryId);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie de budget non trouvée'
      });
    }

    return res.status(200).json({
      success: true,
      data: alert
    });

  } catch (error) {
    console.error("Erreur vérification alerte:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la vérification de l'alerte",
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

    if (isNaN(allocated_amount) || allocated_amount < 0) {
      return res.status(400).json({ success: false, message: "Montant alloué invalide" });
    }

    if (isNaN(alert_threshold) || alert_threshold < 0 || alert_threshold > 100) {
      return res.status(400).json({ success: false, message: "Seuil d'alerte invalide" });
    }

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

    budgetCategory.allocated_amount = parseFloat(allocated_amount);
    budgetCategory.alert_threshold = parseInt(alert_threshold);
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
      message: "Erreur lors de la mise à jour de la catégorie de budget",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getBudgetById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const budget = await Budget.findOne({
      where: { id, user_id: userId },
      include: [{
        model: BudgetCategory,
        as: 'budgetCategories',
        include: [Category]
      }]
    });
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget non trouvé'
      });
    }
    return res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    console.error('Erreur récupération budget par ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du budget',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createBudget,
  updateBudget,
  getBudgets,
  getBudgetAlerts,
  updateSingleBudgetCategory,
  checkBudgetAlert,
  getBudgetById
};
