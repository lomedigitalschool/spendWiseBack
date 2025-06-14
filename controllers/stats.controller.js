const getStats = async (req, res) => {
  try {
    return res.json({
      message: 'Statistiques globales accessibles',
      userId: req.user?.id || null
    });
  } catch (error) {
    console.error('Erreur dans getStats:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  getStats,
};
