const express = require('express'); // Importation du module express
const router = express.Router(); // Création d’un routeur


const {
  getTransactions,
  addTransaction,
  deleteTransaction,
  getAllTransactions,
} = require('../controllers/transaction.controller'); // Importation des contrôleurs de transactions

// ⬇️ LE CONSOLE.LOG ICI
/*console.log({
  getTransactions,
  addTransaction,
  deleteTransaction,
  getAllTransactions,
}); */

const { protect } = require('../middleware/authMiddleware');  // Importation du middleware de protection

// ✅ Routes protégées par le middleware
router.route('/')
  .get(protect, getTransactions) // Route pour obtenir toutes les transactions.
  .post(protect, addTransaction); // Route pour ajouter une transaction.
  // PUT - Modifier une transaction
router.put('/:id', transactionController.updateTransaction);//Router pour modifier une transaction

router.get('/all', protect, getAllTransactions); // Route pour obtenir toutes les transactions.

router.route('/:id')
  .delete(protect, deleteTransaction); // Route pour supprimer une transaction par ID.

module.exports = router;