const { Transaction, Category, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Get paginated and filtered transactions
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      categoryId,
      type, // 'income' ou 'expense' (optionnel)
      page = 1, 
      limit = 10 
    } = req.query;

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

// @desc    Get all transactions (no filters, no pagination)
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

  if (!req.body.amount || !req.body.type) {
    return res.status(400).json({ message: 'amount et type sont obligatoires.' });
  }

  const { amount, type, description, date, CategoryId } = req.body;

  try {
    const transaction = await Transaction.create({
      amount,
      type,
      date: date ? new Date(date) : new Date(),
      description,
      CategoryId,
      UserId: req.user.id
    });

    const user = await User.findByPk(req.user.id);
    if (type === 'income') {
      user.balance += parseFloat(amount);
    } else {
      user.balance -= parseFloat(amount);
    }
    await user.save();

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Erreur addTransaction:', error);
    res.status(500).json({ message: 'Server error' });
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
      return res.status(404).json({ message: 'Transaction not found' });
    }

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
  getAllTransactions
};
