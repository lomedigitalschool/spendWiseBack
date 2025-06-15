const { Op, fn, col } = require('sequelize');
const moment = require('moment'); // npm install moment
const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const Goal = require('../models/goal.model');
const Category = require('../models/category.model');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = moment();
    const startOfMonth = now.startOf('month').toDate();
    const endOfMonth = now.endOf('month').toDate();

    // ✅ Infos utilisateur
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'balance']
    });

    // ✅ Dépenses et revenus du mois en cours
    const totalExpensesThisMonth = await Transaction.sum('amount', {
      where: {
        userId,
        type: 'expense',
        date: { [Op.between]: [startOfMonth, endOfMonth] }
      }
    });

    const totalIncomeThisMonth = await Transaction.sum('amount', {
      where: {
        userId,
        type: 'income',
        date: { [Op.between]: [startOfMonth, endOfMonth] }
      }
    });

    // ✅ 5 dernières transactions
    const recentTransactions = await Transaction.findAll({
      where: { userId },
      order: [['date', 'DESC']],
      limit: 5,
      include: [{ model: Category, attributes: ['name'] }]
    });

    // ✅ Objectifs
    const goals = await Goal.findAll({
      where: { userId },
      include: [{ model: Category, attributes: ['name'] }]
    });

    // ✅ Résumé par catégorie (sommes)
    const categorySummary = await Transaction.findAll({
      where: {
        userId,
        type: 'expense',
        date: { [Op.between]: [startOfMonth, endOfMonth] }
      },
      attributes: [
        'categoryId',
        [fn('SUM', col('amount')), 'total']
      ],
      include: [{ model: Category, attributes: ['name'] }],
      group: ['categoryId', 'Category.id']
    });

    res.json({
      message: 'Bienvenue sur votre tableau de bord, ' + user.name + '!',
      user,
      balance: user.balance,
      totalExpensesThisMonth: totalExpensesThisMonth || 0,
      totalIncomeThisMonth: totalIncomeThisMonth || 0,
      recentTransactions,
      activeGoals: goals,
      categorySummary
    });

  } catch (error) {
    console.error('Erreur dashboard:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
