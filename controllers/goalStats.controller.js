const { Goal, Transaction, Category } = require('../models');
const { Op } = require('sequelize');

// 3. Comparaison objectifs vs dépenses
exports.getGoalProgress = async (req, res) => {
  try {
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
            [Op.between]: [
              new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
            ]
          }
        }
      });

      return {
        goalId: goal.id,
        category: goal.Category.name,
        target: goal.targetAmount,
        current: expenses || 0,
        progress: Math.round(((expenses || 0) / goal.targetAmount) * 100)
      };
    }));

    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};