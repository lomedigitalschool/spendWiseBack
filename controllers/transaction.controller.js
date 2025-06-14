const { Transaction, Category } = require('../models');
const { User } = require('../models');

const { Op } = require('sequelize');

exports.getTransactions = async (req, res) => {
  try {
    // 1. Récupération et validation des paramètres
    const { 
      startDate, 
      endDate, 
      categoryId,
      type, // 'income' ou 'expense' (optionnel)
      page = 1, 
      limit = 10 
    } = req.query;

    // 2. Construction de la clause WHERE
    const where = { 
      UserId: req.user.id,
      ...(type && { type }), // Filtre par type si fourni
      ...(categoryId && { CategoryId: categoryId }),
      ...((startDate || endDate) && {
        date: {
          ...(startDate && { [Op.gte]: new Date(startDate) }),
          ...(endDate && { [Op.lte]: new Date(endDate) })
        }
      })
    };

    // 3. Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // 4. Requête optimisée
    const { count, rows } = await Transaction.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['date', 'DESC']],
      include: {
        model: Category,
        attributes: ['id', 'name'],
        where: categoryId ? { id: categoryId } : undefined // Optimise la jointure si categoryId est fourni
      },
      attributes: { exclude: ['updatedAt'] } // Masque les champs inutiles
    });

    // 5. Réponse standardisée
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


// ...autres exports...
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { UserId: req.user.id },
      include: [{ model: Category, attributes: ['name'] }],
      order: [['date', 'DESC']],
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
// ...autres exports...

// @desc    Get all transactions for a user
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { UserId: req.user.id },
      include: [{ model: Category, attributes: ['name'] }],
      order: [['date', 'DESC']],
    });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add a transaction
// @route   POST /api/transactions
// @access  Private
const addTransaction = async (req, res) => {
  console.log('Données reçues:', req.body);
  if (!req.body.amount || !req.body.type) {
  return res.status(400).json({ message: 'amount et type sont obligatoires.' });
}


  const { amount, type, description, date, CategoryId } = req.body;

  try {
    const transaction = await Transaction.create({
      amount,
      type,
      date: new Date(), // Utilise la date actuelle
      description,
      CategoryId,
      UserId: req.user.id,
    });

    // Mettre à jour le solde de l'utilisateur
    const user = await User.findByPk(req.user.id);
    if (type === 'income') {
      user.balance += parseFloat(amount);
    } else {
      user.balance -= parseFloat(amount);
    }
    await user.save();

    res.status(201).json(transaction);
  } catch (error) {
  console.error('Erreur addTransaction:', error); // Ajoute ce log
  res.status(500).json({ message: 'Server error' });
}
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      where: { id: req.params.id, UserId: req.user.id },
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Mettre à jour le solde de l'utilisateur
    const user = await User.findByPk(req.user.id);
    if (transaction.type === 'income') {
      user.balance -= parseFloat(transaction.amount);
    } else {
      user.balance += parseFloat(transaction.amount);
    }
    await user.save();

    await transaction.destroy();
    res.json({ message: 'Transaction removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getTransactions,
  addTransaction,
  deleteTransaction,
  getAllTransactions,
};