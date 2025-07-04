const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/authMiddleware');
const userController = require('../controllers/user.controller');

// Routes pour l'authentification

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post(
  '/password-reset-request',
  authController.passwordResetRequestController
);
router.post('/password-reset', authController.passwordReset);

// POST /api/users/balance → définir le solde initial
router.post('/balance', protect, userController.setInitialBalance);

// GET /api/users/balance → récupérer le solde
router.get('/balance', protect, userController.getBalance);

module.exports = router;