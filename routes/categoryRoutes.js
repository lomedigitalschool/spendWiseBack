const express = require('express');
const router = express.Router();

const { getCategories, addCategory } = require('../controllers/category.controller');
const { protect } = require('../middleware/authMiddleware');

// ✅ GET : accessible à tous (public)
// ✅ POST : accessible uniquement aux utilisateurs authentifiés
router.route('/')
  .get(getCategories)
  .post(protect, addCategory);

module.exports = router;
