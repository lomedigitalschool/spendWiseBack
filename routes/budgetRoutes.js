const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budget.controller');
const { protect } = require('../middleware/authMiddleware');
const { validateBudgetCreation } = require('../middleware/validators/budgetValidator');
const { validateBudgetUpdate } = require('../middleware/validators/budgetValidator');
const { validateBudgetCategoryUpdate } = require('../middleware/validators/budgetValidator');


router.post('/budgets', protect, validateBudgetCreation, budgetController.createBudget);
router.patch('/budgets/:id', protect, validateBudgetUpdate, budgetController.updateBudget);
router.patch('/budgets/:budgetId/categories/:categoryId',protect,validateBudgetCategoryUpdate,budgetController.updateBudgetCategory);

router.get('/budgets', protect, budgetController.getBudgets);




module.exports = router;
