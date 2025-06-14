const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// ✅ Middleware protect correctement appliqué
router.get('/dashboard', protect, (req, res) => {
  res.json({ message: `Bienvenue utilisateur ${req.user.id}` });
});

module.exports = router;
