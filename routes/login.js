const express = require('express');
const router = express.Router();

const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    if (req.query.e === 'true') {
      res.render('loginerror');
    } else if (req.query.e === 'log') {
      res.render('loginsucc');
    } else {
      res.render('login');
    }
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
