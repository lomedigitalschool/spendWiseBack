const express = require('express');
const router = express.Router();
const { getCategoryStats, getMonthlyStats } = require('../controllers/transactionStats.controller');
const { getGoalProgress } = require('../controllers/goalStats.controller');
const auth = require('../middleware/authMiddleware');

router.get('/transactions/stats/categories', auth, getCategoryStats);
router.get('/transactions/stats/monthly', auth, getMonthlyStats);
router.get('/goals/compare', auth, getGoalProgress);

module.exports = router;