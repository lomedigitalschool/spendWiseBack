const express = require('express');
const router = express.Router();

const {
  getCategoryStats,
  getMonthlyStats,
} = require('../controllers/transactionStats.controller');

const {
  getGoalProgress,
} = require('../controllers/goalStats.controller');

const { protect } = require('../middleware/authMiddleware');

// ✅ Routes sécurisées avec le middleware protect
router.get('/transactions/stats/categories', protect, getCategoryStats);
router.get('/transactions/stats/monthly', protect, getMonthlyStats);
router.get('/goals/compare', protect, getGoalProgress);
router.get('/goals/stats', protect, getGoalProgress); // identique à compare

module.exports = router;
