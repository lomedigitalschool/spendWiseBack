const express = require('express');
const router = express.Router();

const {
  getGoals,
  addGoal,
  updateGoal,
  deleteGoal,
} = require('../controllers/goal.controller');

const { protect } = require('../middleware/authMiddleware');

// ✅ Routes protégées par middleware JWT
router.route('/')
  .get(protect, getGoals)
  .post(protect, addGoal);

router.route('/:id')
  .put(protect, updateGoal)
  .delete(protect, deleteGoal);

module.exports = router;
