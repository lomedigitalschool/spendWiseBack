const { Op, fn, col } = require('sequelize');
const moment = require('moment'); // npm install moment

const { User, Transaction, Goal, Category } = require('../models');

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

    // ✅ Dépenses du mois en cours
    const totalExpensesThisMonth = await Transaction.sum('amount', {
      where: {
        UserId: userId, // corrigé
        type: 'expense',
        date: { [Op.between]: [startOfMonth, endOfMonth] }
      }
    });

    // ✅ Revenus du mois en cours
    const totalIncomeThisMonth = await Transaction.sum('amount', {
      where: {
        UserId: userId, // corrigé
        type: 'income',
        date: { [Op.between]: [startOfMonth, endOfMonth] }
      }
    });

    // ✅ 5 dernières transactions
    const recentTransactions = await Transaction.findAll({
      where: { UserId: userId }, // corrigé
      order: [['date', 'DESC']],
      limit: 5,
      include: [{ model: Category, attributes: ['name'] }]
    });

    // ✅ Objectifs actifs
    const goals = await Goal.findAll({
      where: { UserId: userId }, // corrigé
      include: [{ model: Category, attributes: ['name'] }]
    });

    // ✅ Résumé par catégorie (sommes)
    const categorySummary = await Transaction.findAll({
      where: {
        UserId: userId, // corrigé
        type: 'expense',
        date: { [Op.between]: [startOfMonth, endOfMonth] }
      },
      attributes: [
        'CategoryId', // corrigé
        [fn('SUM', col('amount')), 'total']
      ],
      include: [{ model: Category, attributes: ['name'] }],
      group: ['CategoryId', 'Category.id'] // corrigé
    });

    res.json({
      message: user ? `Bienvenue sur votre tableau de bord, ${user.name} !` : "Bienvenue sur votre tableau de bord !",
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
