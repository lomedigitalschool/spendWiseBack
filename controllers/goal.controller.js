const { Goal, Category } = require('../models');


// @desc    Get all goals for a user
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.findAll({
      where: { UserId: req.user.id },
      include: [{ model: Category, attributes: ['name'] }],
    });

    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add a goal
// @route   POST /api/goals
// @access  Private
const addGoal = async (req, res) => {
  const { targetAmount, frequency, CategoryId } = req.body;

  try {
    const goal = await Goal.create({
      targetAmount,
      frequency,
      CategoryId,
      UserId: req.user.id,
    });

    res.status(201).json(goal);
  } catch (error) {
    console.error('Goal creation failed:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
  const { targetAmount, currentAmount, frequency, deadline, CategoryId } = req.body;

  try {
    const goal = await Goal.findOne({
      where: { id: req.params.id, UserId: req.user.id },
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    goal.targetAmount = targetAmount || goal.targetAmount;
    goal.currentAmount = currentAmount || goal.currentAmount;
    goal.frequency = frequency || goal.frequency;
    goal.CategoryId = CategoryId || goal.CategoryId;

    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      where: { id: req.params.id, UserId: req.user.id },
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    await goal.destroy();
    res.json({ message: 'Goal removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getGoals,
  addGoal,
  updateGoal,
  deleteGoal,
};