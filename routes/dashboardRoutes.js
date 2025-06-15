const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getDashboard } = require('../controllers/dashboardController');

// ✅ Route protégée pour le tableau de bord
router.get('/dashboard', protect, getDashboard);

module.exports = router;
