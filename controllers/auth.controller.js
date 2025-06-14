const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.User;
require('dotenv').config();

// Fonction pour générer un token JWT
const generateToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email déjà utilisé.' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      balance: 0 // Valeur par défaut
      });

    return res.status(201).json({ message: 'Utilisateur créé avec succès', userId: user.id });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });

    const token = generateToken(user); // Utilise ta fonction définie

    return res.status(200).json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        balance: user.balance
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// GET USER PROFILE
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'balance']
    });

    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ✅ Export correct
module.exports = {
  register,
  login,
  getUserProfile,
  generateToken
};
