const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/authMiddleware');

// Routes pour l'authentification
router.get('/profile', authMiddleware, authController.getUserProfile);


router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;