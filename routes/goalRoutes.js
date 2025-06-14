const express = require('express');
const router = express.Router();
const { getGoals, addGoal, updateGoal, deleteGoal } = require('../controllers/goal.controller');
const auth = require('../middleware/authMiddleware');

router.route('/')
  .get(auth, getGoals)
  .post(auth, addGoal);

router.route('/:id')
  .put(auth, updateGoal)
  .delete(auth, deleteGoal);

module.exports = router;