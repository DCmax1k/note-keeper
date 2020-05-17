const express = require('express');
const router = express.Router();

const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.render('signup', { users: users });
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
