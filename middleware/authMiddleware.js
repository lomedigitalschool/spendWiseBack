const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Vérifie que le header Authorization existe et commence par "Bearer"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Accès non autorisé. Aucun token fourni.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Vérification du token avec la clé secrète
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ajoute les données de l'utilisateur décodées dans req.user
    req.user = decoded;

    next(); // Passage au contrôleur
  } catch (err) {
    return res.status(403).json({ message: 'Token invalide ou expiré.' });
  }
};

module.exports = { protect: authMiddleware };

