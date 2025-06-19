const { Transaction, Category } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

// 1. Stats par catégorie (camembert)
exports.getCategoryStats = async (req, res) => {
  try {
    const stats = await Transaction.findAll({
      where: { UserId: req.user.id },
      attributes: [
        [
          sequelize.literal(`SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END)`),
          'income'
        ],
        [
          sequelize.literal(`SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)`),
          'expense'
        ],
        'CategoryId'
      ],
      include: { 
        model: Category, 
        attributes: ['name', 'id'] 
      },
      group: ['CategoryId', 'Category.id']
    });

    const formattedStats = stats.map(item => ({
      category: item.Category.name,
      categoryId: item.Category.id,
      income: parseFloat(item.get('income')) || 0,
      expense: parseFloat(item.get('expense')) || 0
    }));

    res.json(formattedStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Stats mensuelles (courbe)
exports.getMonthlyStats = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query; // Récupère l'année depuis les paramètres de la requête, sinon utilise l'année actuelle

    const stats = await Transaction.findAll({
      where: { 
        UserId: req.user.id,
        date: { 
          [Op.between]: [`${year}-01-01`, `${year}-12-31`] 
        } // Filtre pour l'année spécifiée
      },
      attributes: [
        [
          sequelize.literal(`TO_CHAR(date, 'YYYY-MM')`),
          'month'
        ],
        [
          sequelize.literal(`SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END)`),
          'income'
        ],
        [
          sequelize.literal(`SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)`),
          'expense'
        ] 
      ],
      group: [sequelize.literal(`TO_CHAR(date, 'YYYY-MM')`)],
      order: [sequelize.literal(`TO_CHAR(date, 'YYYY-MM')`)]
    }); // TO_CHAR(date, 'YYYY-MM') permet de formater la date en 'YYYY-MM'

    const formattedStats = stats.map(item => ({
      month: item.get('month'),
      income: parseFloat(item.get('income')) || 0,
      expense: parseFloat(item.get('expense')) || 0
    })); // Formate les statistiques mensuelles

    res.json(formattedStats); // Renvoie les statistiques mensuelles formatées
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message }); 
  }
};
