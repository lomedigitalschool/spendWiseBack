const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/authMiddleware');

// Routes pour l'authentification
router.get('/profile', protect, authController.getUserProfile);

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post(
  '/password-reset-request',
  authController.passwordResetRequestController
);

module.exports = router;