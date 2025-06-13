const express = require('express');
const router = express.Router();
const { getCategories, addCategory } = require('../controllers/category.controller');
const auth = require('../middlewares/auth');

router.route('/')
  .get(getCategories)
  .post(auth, addCategory);



module.exports = router;