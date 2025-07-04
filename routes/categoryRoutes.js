const express = require('express');
const router = express.Router();

const { deleteCategory } = require('../controllers/category.controller'); ///
const { getCategories, addCategory } = require('../controllers/category.controller');
const { protect } = require('../middleware/authMiddleware');


// ✅ GET : accessible à tous (public)
// ✅ POST : accessible uniquement aux utilisateurs authentifiés
router.route('/')
  .get(getCategories)
  .post(protect, addCategory);
 
router.route('/:id')
  .delete(protect, deleteCategory); // 


module.exports = router;
