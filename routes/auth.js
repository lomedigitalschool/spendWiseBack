
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../Models');
require('dotenv').config();


router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const newUser = await User.create({ name, email, password: hashedPassword });

    return res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Générer un token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Envoyer le token aufrontend
    return res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;

