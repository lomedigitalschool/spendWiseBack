const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const budgetController = require('../controllers/budget.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { 
  validateBudgetCreation, 
  validateBudgetUpdate,
  validateBudgetCategoryUpdate 
} = require('../middleware/validators/budgetValidator');

// POST /api/budgets - Créer un nouveau budget
router.post(
  '/',
  authMiddleware.protect,
  validateBudgetCreation,
  budgetController.createBudget
);

// PATCH /api/budgets/:id - Mettre à jour un budget
router.patch(
  '/:id',
  authMiddleware.protect,
  validateBudgetUpdate,
  budgetController.updateBudget
);

// GET /api/budgets/:id - Récupérer un budget par son ID
router.get(
  '/:id',
  authMiddleware.protect,
  budgetController.updateBudget
);

// GET /api/budgets - Récupérer tous les budgets de l'utilisateur
router.get(
  '/',
  authMiddleware.protect,
  budgetController.getBudgets
);

// GET /api/budgets/:budgetId/alerts - Récupérer les alertes d'un budget
router.get(
  '/:budgetId/alerts',
  authMiddleware.protect,
  budgetController.getBudgetAlerts
);

// PATCH /api/budgets/:budgetId/categories/:categoryId - Mettre à jour une catégorie
router.patch(
  '/:budgetId/categories/:categoryId',
  authMiddleware.protect,
  validateBudgetCategoryUpdate,
  budgetController.updateSingleBudgetCategory
);

module.exports = router;