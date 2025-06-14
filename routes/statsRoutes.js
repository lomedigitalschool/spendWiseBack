const express = require('express');
const router = express.Router();

const {
  getCategoryStats,
  getMonthlyStats,
} = require('../controllers/transactionStats.controller');

const {
  getGoalProgress,
} = require('../controllers/goalStats.controller');

const authMiddleware = require('../middleware/authMiddleware');
const { protect } = authMiddleware;

// ✅ Routes sécurisées avec le middleware d'authentification
router.get('/transactions/stats/categories', getCategoryStats);
router.get('/transactions/stats/monthly', getMonthlyStats);
router.get('/goals/compare', getGoalProgress);
router.get('/goals/stats', getGoalProgress); // même logique que compare

module.exports = router;
