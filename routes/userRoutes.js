const express = require("express");
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// Routes pour l'authentification
router.get("/profile", protect, authController.getUserProfile);


router.post(
  "/password-reset-request",
  authController.passwordResetRequestController
);

router.post('/register', authController.register);
router.post('/login', authController.login);

// POST /api/users/balance → définir le solde initial
router.post('/balance', auth, userController.setInitialBalance);

// GET /api/users/balance → récupérer le solde
router.get('/balance', auth, userController.getBalance);



module.exports = router;
