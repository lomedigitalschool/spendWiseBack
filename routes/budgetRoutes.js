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
const { validationResult } = require('express-validator');

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// POST /api/budgets - Créer un nouveau budget
router.post(
  '/',
  authMiddleware.protect,
  validateBudgetCreation,
  handleValidationErrors,
  budgetController.createBudget
);

// PATCH /api/budgets/:id - Mettre à jour un budget
router.patch(
  '/:id',
  authMiddleware.protect,
  validateBudgetUpdate,
  handleValidationErrors,
  budgetController.updateBudget
);

// GET /api/budgets/:id - Récupérer un budget par son ID
router.get(
  '/:id',
  authMiddleware.protect,
  budgetController.getBudgetById
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

// GET /api/budgets/:budgetId/alerts/check - Vérifier les alertes d'un budget pour une catégorie
router.get(
  '/:budgetId/alerts/check',
  authMiddleware.protect,
  budgetController.checkBudgetAlert
);

// PATCH /api/budgets/:budgetId/categories/:categoryId - Mettre à jour une catégorie
router.patch(
  '/:budgetId/categories/:categoryId',
  authMiddleware.protect,
  validateBudgetCategoryUpdate,
  handleValidationErrors,
  budgetController.updateSingleBudgetCategory
);

module.exports = router;