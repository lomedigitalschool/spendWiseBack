const express = require('express');
const router = express.Router();

const {
  getTransactions,
  addTransaction,
  deleteTransaction,
  getAllTransactions,
} = require('../controllers/transaction.controller');

const { protect } = require('../middleware/authMiddleware');

// ✅ Routes protégées par le middleware
router.route('/')
  .get(protect, getTransactions)      // Avec pagination/filtrage
  .post(protect, addTransaction);     // Création

router.get('/all', protect, getAllTransactions); // Toutes les transactions non filtrées

router.route('/:id')
  .delete(protect, deleteTransaction); // Suppression par ID

module.exports = router;
