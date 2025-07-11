const express = require('express');
const router = express.Router();

const { getCategories, addCategory, getCategoryById, updateCategory,deleteCategory,} = require('../controllers/category.controller');
const { protect } = require('../middleware/authMiddleware');

// ✅ GET : accessible à tous (public)
// ✅ POST : accessible uniquement aux utilisateurs authentifiés
router.route('/')
  .get(protect, getCategories)
  .post(protect, addCategory);

  router.route('/:id')
  .get(protect, getCategoryById)
  .put(protect, updateCategory)

  router.delete("/:id", deleteCategory); 
  


module.exports = router;
