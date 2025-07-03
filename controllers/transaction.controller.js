const { Transaction, Category, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Get paginated and filtered transactions
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, categoryId, type, page = 1, limit = 10 } = req.query;

    const where = {
      UserId: req.user.id,
      ...(type && { type }),
      ...(categoryId && { CategoryId: categoryId }),
      ...((startDate || endDate) && {
        date: {
          ...(startDate && { [Op.gte]: new Date(startDate) }),
          ...(endDate && { [Op.lte]: new Date(endDate) })
        }
      })
    };

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Transaction.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['date', 'DESC']],
      include: {
        model: Category,
        attributes: ['id', 'name'],
        where: categoryId ? { id: categoryId } : undefined
      },
      attributes: { exclude: ['updatedAt'] }
    });

    res.json({
      success: true,
      data: {
        transactions: rows,
        pagination: {
          totalItems: count,
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all transactions (no filters, no pagination) liste des transactions
// @route   GET /api/transactions/all
// @access  Private
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { UserId: req.user.id },
      include: [{ model: Category, attributes: ['name'] }],
      order: [['date', 'DESC']]
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add a new transaction
// @route   POST /api/transactions
// @access  Private
const addTransaction = async (req, res) => {
  console.log('Données reçues:', req.body);

  const { amount, type, description, date, categoryId } = req.body;

  if (!amount || !type) {
    return res.status(400).json({ message: 'amount et type sont obligatoires.' });
  }

  try {
    const category = await BudgetCategory.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({ message: "Catégorie inexistante ou invalide." });
    }

    const user = await User.findByPk(req.user.id);

    if (type === 'expense' && parseFloat(user.balance) < parseFloat(amount)) {
      return res.status(400).json({
        message: "Le solde est insuffisant pour effectuer cette dépense.",
        balanceActuel: user.balance
      });
    }

    const transaction = await Transaction.create({
      amount,
      type,
      transaction_date: date ? new Date(date) : new Date(),
      description,
      budget_categories_id: categoryId,
      user_id: req.user.id,
    });

    if (type === 'income') {
      user.balance += parseFloat(amount);
    } else {
      user.balance -= parseFloat(amount);
    }

    await user.save();

    res.status(201).json({
      message: "Transaction créée avec succès.",
      transaction,
      balance: user.balance
    });

  } catch (error) {
    console.error('Erreur addTransaction:', error);

    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message);
      return res.status(400).json({
        message: "Échec de la création de la transaction.",
        errors: messages
      });
    }

    res.status(500).json({ message: 'Erreur serveur. Veuillez réessayer plus tard.' });
  }
};
const updateTransaction = async (req, res) => {
  const { amount, type, description, date, categoryId } = req.body;

  try {
    const transaction = await Transaction.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction non trouvée" });
    }

    const user = await User.findByPk(req.user.id);
    const category = await BudgetCategory.findByPk(categoryId);

    if (!category) {
      return res.status(400).json({ message: "Catégorie invalide." });
    }

    // Annuler l'effet de l'ancienne transaction sur le solde
    if (transaction.type === 'income') {
      user.balance -= parseFloat(transaction.amount);
    } else {
      user.balance += parseFloat(transaction.amount);
    }

    // Vérifier que le nouveau solde est suffisant (si type = dépense)
    if (type === 'expense' && user.balance < parseFloat(amount)) {
      return res.status(400).json({
        message: "Solde insuffisant pour cette modification.",
        balance: user.balance
      });
    }

    // Appliquer les nouvelles valeurs à la transaction
    transaction.amount = amount;
    transaction.type = type;
    transaction.description = description;
    transaction.transaction_date = date ? new Date(date) : new Date();
    transaction.budget_categories_id = categoryId;

    await transaction.save();

    // Appliquer l'effet de la nouvelle transaction sur le solde
    if (type === 'income') {
      user.balance += parseFloat(amount);
    } else {
      user.balance -= parseFloat(amount);
    }

    await user.save();

    res.json({
      message: "Transaction mise à jour avec succès.",
      transaction,
      balance: user.balance
    });

  } catch (error) {
    console.error('Erreur updateTransaction:', error);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour." });
  }
};
// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      where: { id: req.params.id, UserId: req.user.id }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction non trouvée' });
    }

    const user = await User.findByPk(req.user.id);

    if (transaction.type === 'income') {
      user.balance -= parseFloat(transaction.amount);
    } else {
      user.balance += parseFloat(transaction.amount);
    }

    await user.save();
    await transaction.destroy();

    res.json({
      message: 'Transaction supprimée avec succès.',
      balance: user.balance
    });

  } catch (error) {
    console.error('Erreur deleteTransaction:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  getTransactions,
  addTransaction,
  deleteTransaction,
  getAllTransactions,
  updateTransaction
};
