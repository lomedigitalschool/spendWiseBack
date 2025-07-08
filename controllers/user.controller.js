const { User } = require('../models');

// POST: définir le solde initial
const setInitialBalance = async (req, res) => {
  const userId = req.user.id;
  const { balance } = req.body;

  if (balance === undefined || isNaN(balance) || balance < 0) {
    return res.status(400).json({ message: "Solde invalide." });
  }

  try {
    const user = await User.findByPk(userId);

    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });

    if (user.has_set_balance) {
      return res.status(400).json({ message: "Le solde initial a déjà été défini." });
    }

    user.balance = balance;
    user.has_set_balance = true;
    await user.save();

    return res.status(200).json({ message: "Solde initial enregistré.", balance: user.balance });

  } catch (error) {
    console.error("Erreur setInitialBalance:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

// GET: récupérer le solde de l'utilisateur
const getBalance = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findByPk(userId, {
      attributes: ['balance', 'has_set_balance']
    });

    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });

    return res.status(200).json({
      balance: user.balance,
      has_set_balance: user.has_set_balance
    });

  } catch (error) {
    console.error("Erreur getBalance:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

module.exports = {
  setInitialBalance,
  getBalance
};
