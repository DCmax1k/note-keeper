const express = require('express');
const router = express.Router();

const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    if (req.query.e === 'true') {
      res.render('login', { status: 'error', user: 'none' });
    } else if (req.query.e === 'log') {
      res.render('login', {
        status: 'successful',
        user: { username: req.query.username },
      });
    } else {
      res.render('login', { status: 'good', user: 'none' });
    }
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
