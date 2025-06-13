const { Transaction, Category, Goal } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

// 1. Stats par catégorie (camembert)
exports.getCategoryStats = async (req, res) => {
  try {
    const stats = await Transaction.findAll({
      where: { UserId: req.user.id },
      attributes: [
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN type = "income" THEN amount ELSE 0 END')), 'income'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN type = "expense" THEN amount ELSE 0 END')), 'expense'],
        'CategoryId'
      ],
      include: { 
        model: Category, 
        attributes: ['name', 'id'] 
      },
      group: ['CategoryId']
    });

    const formattedStats = stats.map(item => ({
      category: item.Category.name,
      categoryId: item.Category.id,
      income: parseFloat(item.income) || 0,
      expense: parseFloat(item.expense) || 0
    }));

    res.json(formattedStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Stats mensuelles (courbe)
exports.getMonthlyStats = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const stats = await Transaction.findAll({
      where: { 
        UserId: req.user.id,
        date: { 
          [Op.between]: [`${year}-01-01`, `${year}-12-31`] 
        }
      },
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('date'), '%Y-%m'), 'month'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN type = "income" THEN amount ELSE 0 END')), 'income'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN type = "expense" THEN amount ELSE 0 END')), 'expense']
      ],
      group: ['month'],
      order: ['month']
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};