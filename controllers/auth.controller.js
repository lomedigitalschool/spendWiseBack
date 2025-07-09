const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { User } = require('../models');
require('dotenv').config();
const {tokenGenerator} = require('../utils/tokenGenerator');

// Stockage temporaire des tokens (à remplacer par une vraie DB en prod)
const tokenDB = new Map();

// 🔐 Fonction pour générer un token JWT
const generateToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// ✅ ENREGISTREMENT (REGISTER)
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation simple côté backend (à renforcer si besoin)
    const nameRegex = /^[A-Za-z]{4,}$/;
    if (!nameRegex.test(name)) {
      return res.status(400).json({ message: "Nom invalide. Minimum 4 lettres, sans chiffre ou caractère spécial." });
    }

    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: "Adresse email invalide." });
    }

    if (!password || password.length < 4 || /\s/.test(password)) {
      return res.status(400).json({ message: "Mot de passe invalide. Minimum 4 caractères, sans espace." });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      balance: 0,
      has_set_balance: false
    });

    return res.status(201).json({ message: 'Compte créé avec succès.', userId: user.id });
  } catch (error) {
    
    console.error("Erreur lors de l'inscription :", error);
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

//✅ CONNEXION (LOGIN)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
    
    const token = generateToken(user);

    return res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        balance: user.balance,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur serveur", error: error.message });
  }
};

// REINITIALISATION DU MOT DE PASSE - Demande
const passwordResetRequestController = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res
      .status(400)
      .json({ message: "Cet utilisateur n'est pas inscrit" });
  }
  // génération d'un token et d'un temps d'expiration
  const token = tokenGenerator();
  const expiration = Date.now() + 30 * 60 * 1000; // Expire dans 30 min
  const link = `${process.env.FRONTEND_URL || ''}/reset-password?token=${token}`;

  const sender = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Réinitialisation du mot de passe",
    html: `<p>Cliquez sur ce lien 👇</p>
           <a style="display:block; width:150px; height:28px; padding:5px 8px; background-color:#6c63ff; color:white; border-radius:5px; text-decoration:none;" href="${link}">Pour réinitialiser votre mot de passe</a>`,
  };

  try {
    await sender.sendMail(mailOptions);
    res.status(200).json({ message: "Email envoyé avec succès !", token });
    tokenDB.set(token, { email, expiration });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de l'envoi de l'email" });
  }
};

// REINITIALISATION DU MOT DE PASSE - Action
const passwordReset = async (req, res) => {
  const { newPassword } = req.body;
  const { token } = req.query;

  const data = tokenDB.get(token);
  if (!data) {
    return res.status(400).json({ error: "Token invalide ou expiré" });
  }
  const { email, expiration } = data;

  if (Date.now() > expiration) {
    return res.status(400).json({ error: "le lien  est expiré" });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  try {
    const update = await User.update(
      { password: passwordHash },
      { where: { email: email } }
    );

    update[0] !== 0
      ? res.status(200).json({ message: "le mot de passe a été reinitialisé" })
      : res
          .status(400)
          .json({ message: "Aucun utilisateur trouvé avec cet email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "erreur serveur lors de la reinintialisation du mot de passe",
    });
  }
};

module.exports = {
  register,
  login,
  generateToken,
  passwordResetRequestController,
  passwordReset
};