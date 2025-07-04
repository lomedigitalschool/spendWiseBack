const express = require('express');
const router = express.Router();

const { getCategories, addCategory, getCategoryById, updateCategory} = require('../controllers/category.controller');
const { protect } = require('../middleware/authMiddleware');

// ✅ GET : accessible à tous (public)
// ✅ POST : accessible uniquement aux utilisateurs authentifiés
router.route('/')
  .get(getCategories)
  .post(protect, addCategory);

  router.route('/:id')
  .get(getCategoryById)
  .put(protect, updateCategory)
  

module.exports = router;
