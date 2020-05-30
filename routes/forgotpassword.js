const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const User = require('../models/User');

// Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'notekeeperapi@gmail.com',
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Forgot Pass page
router.get('/', async (req, res) => {
  if (req.query.e === 'none') {
    res.render('forgotpassword', {
      status: { error: 'No one with that email!' },
    });
  } else {
    res.render('forgotpassword', { status: 'none' });
  }
});

// Sendmail post method
router.post('/sendemail', async (req, res) => {
  try {
    const user = await User.find({ email: req.body.email });
    if (user.length == 1) {
      let currentPin = Math.floor(Math.random() * 9900 + 100);
      const dbPin = await User.findOneAndUpdate(
        { email: req.body.email },
        { $set: { pin: currentPin } },
        { useFindAndModify: false }
      );
      const saveUser = dbPin.save();
      const mailOptions = {
        from: 'Node Keeper ✓',
        to: req.body.email,
        subject: 'Forgot Password',
        html: `
      Your 4 digit number is ${currentPin}.
      `,
      };
      transporter.sendMail(mailOptions, (err, data) => {
        if (err) console.error(err);
      });
      res.redirect(`/forgotpassword/code?k=${user[0]._id}`);
    } else {
      res.redirect('/forgotpassword?e=none');
    }
  } catch (err) {
    console.error(err);
    res.redirect('/login');
  }
});

// Type in code page
router.get('/code', async (req, res) => {
  try {
    const user = await User.findById(req.query.k);
    if (req.query.e === 'none') {
      res.render('forgotpasscode', {
        status: { error: 'Wrong Pin!' },
        user: user,
      });
    } else {
      res.render('forgotpasscode', { status: 'none', user: user });
    }
  } catch (err) {
    console.error(err);
    res.redirect('/login');
  }
});

// Check if pin is correct
router.post('/checkpin/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user.pin === parseInt(req.body.pin)) {
      //   Set user to online
      const setOnline = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: { online: true },
        },
        { useFindAndModify: false }
      );
      const saveUser = setOnline.save();
      res.redirect(`/account/${user.username}?k=${user._id}`);
      //   Email their password
      const mailOptions = {
        from: 'Noe Keeper ✓',
        to: user.email,
        subject: 'Password Change',
        html: `
            You have successfully logged into your account!
            <br />
            <hr />
            Your current password is... '${user.password}'.
        `,
      };
      transporter.sendMail(mailOptions, (err, data) => {
        if (err) return console.error(err);
      });
    } else {
      res.redirect(`/forgotpassword/code?k=${user._id}&e=none`);
    }
  } catch (err) {
    console.error(err);
    res.redirect('/login');
  }
});

module.exports = router;
