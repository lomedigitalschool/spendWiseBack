const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budget.controller');
const { protect } = require('../middlewares/authMiddleware');
const { validateBudgetCreation } = require('../middlewares/validators/budgetValidator');
const { validateBudgetUpdate } = require('../middlewares/validators/budgetValidator');
const { validateBudgetCategoryUpdate } = require('../middlewares/validators/budgetValidator');


router.post('/budgets', protect, validateBudgetCreation, budgetController.createBudget);
router.patch('/budgets/:id', protect, validateBudgetUpdate, budgetController.updateBudget);
router.patch('/budgets/:budgetId/categories/:categoryId',protect,validateBudgetCategoryUpdate,budgetController.updateBudgetCategory);



module.exports = router;
