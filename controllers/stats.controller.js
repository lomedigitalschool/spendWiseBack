const { Transaction, User } = require('../models');
const { Op } = require('sequelize');

const getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Somme totale des revenus
    const totalIncome = await Transaction.sum('amount', {
      where: {
        UserId: userId,
        type: 'income'
      }
    });

    // Somme totale des dépenses
    const totalExpenses = await Transaction.sum('amount', {
      where: {
        UserId: userId,
        type: 'expense'
      }
    });

    // Statistiques du mois en cours
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyIncome = await Transaction.sum('amount', {
      where: {
        UserId: userId,
        type: 'income',
        date: {
          [Op.between]: [firstDay, lastDay]
        }
      }
    });

    const monthlyExpenses = await Transaction.sum('amount', {
      where: {
        UserId: userId,
        type: 'expense',
        date: {
          [Op.between]: [firstDay, lastDay]
        }
      }
    });

    // Solde utilisateur
    const user = await User.findByPk(userId);

    return res.json({
      message: 'Statistiques globales récupérées avec succès',
      data: {
        balance: user?.balance || 0,
        totalIncome: totalIncome || 0,
        totalExpenses: totalExpenses || 0,
        netTotal: (totalIncome || 0) - (totalExpenses || 0),
        monthlyIncome: monthlyIncome || 0,
        monthlyExpenses: monthlyExpenses || 0
      }
    });
  } catch (error) {
    console.error('Erreur dans getStats:', error);
    res.status(500).json({
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getStats
};
