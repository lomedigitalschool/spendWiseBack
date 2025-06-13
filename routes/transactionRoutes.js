const express = require('express');
const router = express.Router();
const { getTransactions, addTransaction, deleteTransaction } = require('../controllers/transaction.controller');
const auth = require('../middlewares/auth');
const transactionController = require('../controllers/transaction.controller');


router.route('/')
  .get(auth, getTransactions)
  .post(auth, addTransaction);

router.get('/transactions', auth, transactionController.getAllTransactions);

router.route('/:id')
  .delete(auth, deleteTransaction);

module.exports = router;