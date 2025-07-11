const jwt = require('jsonwebtoken');
require('dotenv').config();
const { User } = require('../models');

const authMiddleware =  async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Vérifie que le header Authorization existe et commence par "Bearer"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Accès non autorisé. Aucun token fourni.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Vérification du token avec la clé secrète
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ⚠️ Rechercher l’utilisateur dans la base à partir du decoded.id
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé." });
    }

    // Attacher l'utilisateur complet à la requête
    req.user = user;

  
  

    next(); // Passage au contrôleur
  } catch (err) {
    console.error("Erreur de vérification du token :", err.message);
    // Si le token est invalide ou expiré
    return res.status(403).json({ message: 'Token invalide ou expiré.' });

  }
};

module.exports = { protect: authMiddleware };



