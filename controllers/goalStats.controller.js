const { Goal, Transaction, Category } = require('../models');
const { Op } = require('sequelize');

// 3. Comparaison objectifs vs dépenses
exports.getGoalProgress = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || (new Date().getMonth() + 1); // 1 à 12

    const startDate = new Date(year, month - 1, 1); // premier jour du mois
    const endDate = new Date(year, month, 0, 23, 59, 59); // dernier jour du mois

    const goals = await Goal.findAll({
      where: {
        UserId: req.user.id,
        frequency: 'monthly'
      },
      include: { model: Category }
    });

    const progress = await Promise.all(goals.map(async (goal) => {
      const expenses = await Transaction.sum('amount', {
        where: {
          UserId: req.user.id,
          type: 'expense',
          CategoryId: goal.CategoryId,
          date: {
            [Op.between]: [startDate, endDate]
          }
        }
      });

      const current = expenses || 0;
      const target = goal.targetAmount;
      const percent = target > 0 ? Math.round((current / target) * 100) : 0;

      return {
        goalId: goal.id,
        category: goal.Category.name,
        target,
        current,
        progress: percent,
        month,
        year,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };
    }));

    res.json(progress);
  } catch (error ) {
    console.error('Error fetching goal progress:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
