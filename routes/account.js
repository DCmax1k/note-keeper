const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const User = require('../models/User');

router.get('/', (req, res) => {
  res.redirect('/');
});

// Mail Configuration
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

// Creates a user from from on signup
router.post('/', async (req, res) => {
  const user = new User({
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
  });
  try {
    const saveUser = await user.save();
    let mailOptions = {
      from: 'Note Keeper ✓',
      to: req.body.email,
      subject: 'Account Sign Up',
      html: `
            <p>Thanks for creating an account with Note Keeper!
            You can confirm your email address with this link.</p>
            <a href="https://note-keeper-api.herokuapp.com/account/${saveUser._id}/confirmemail">Confirm Email</a>
          `,
    };
    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        console.error(err);
      }
    });
    res.redirect(`/login?e=log&username=${req.body.username}`);
  } catch (e) {
    console.log(e);
    res.redirect('/signup');
  }
});

// Confirm Email
router.get('/:id/confirmemail', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const currentUserUpdate = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: { emailConfirmed: true },
      },
      { useFindAndModify: false }
    );
    const saveUser = await currentUserUpdate.save();
    res.send(`Email: ${user.email}, is now confirmed!`);
  } catch (err) {
    console.error(err);
  }
});

// Resend Email
router.post('/:id/resendemail', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    let mailOptions = {
      from: 'Note Keeper ✓',
      to: user.email,
      subject: 'Account Sign Up',
      html: `
            <p>Thanks for creating an account with Note Keeper!
            You can confirm your email address with this link.</p>
            <a href="https://note-keeper-api.herokuapp.com/account/${user._id}/confirmemail">Confirm Email</a>
          `,
    };
    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        console.error(err);
      }
    });
    res.redirect(`/account/${user.username}?k=${user._id}`);
  } catch (err) {
    console.error(err);
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const users = await User.find();
    for (i = 0; i < users.length; i++) {
      if (
        users[i].username === req.body.username &&
        users[i].password === req.body.password
      ) {
        // Sets activity online to true!
        const setOnline = await User.findByIdAndUpdate(
          users[i]._id,
          {
            $set: { online: true },
          },
          { useFindAndModify: false }
        );
        const saveOnline = await setOnline.save();
        if (!res.headersSent) {
          res.redirect(`/account/${users[i].username}?k=${users[i]._id}`);
        }
      }
    }
    if (!res.headersSent) {
      res.redirect(`/login?e=true`);
    }
  } catch (err) {
    console.error(err);
  }
});

// Actual user page
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (req.query.k == user._id && user.online === true) {
      res.render('account', { user: user });
    } else {
      res.redirect('/login');
    }
  } catch (err) {
    console.error(err);
    res.redirect('/login');
  }
});

// Add note
router.post('/:id/addnote', async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.id);
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $push: { notes: req.body.newnote },
      },
      { useFindAndModify: false }
    );
    const saveUser = await updatedUser.save();
    res.redirect(`/account/${currentUser.username}?k=${currentUser._id}`);
  } catch (err) {
    console.error(err);
    res.redirect('/login');
  }
});

// Delete note
router.post('/:id/deletenote', async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.id);
    const notes = currentUser.notes;
    notes.splice(req.body.notetoremove, 1);
    const userUpdate = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: { notes: notes },
      },
      { useFindAndModify: false }
    );
    const saveUser = await userUpdate.save();
    res.redirect(`/account/${currentUser.username}?k=${currentUser._id}`);
  } catch (err) {
    console.error(err);
    res.redirect('/login');
  }
});

// Log out
router.post('/logout/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user.online === true) {
      const setOffline = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: { online: false },
        },
        { useFindAndModify: false }
      );
      const saveOffline = await setOffline.save();
      res.redirect('/login');
    } else {
      res.redirect('/login');
    }
  } catch (err) {
    console.error(err);
    res.redirect('/login');
  }
});

// Delete all notes
router.post('/:id/deleteallnotes', async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.id);
    const deleteNotes = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: { notes: [] },
      },
      { useFindAndModify: false }
    );
    const saveDeleteNotes = await deleteNotes.save();
    res.redirect(`/account/${currentUser.username}?k=${currentUser._id}`);
  } catch (err) {
    console.error(err);
    res.redirect('/login');
  }
});

// Change Sort Option
router.post('/:id/sortoption', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user.online == true) {
      if (user.sortOption === 'descending') {
        const changeSort = await User.findByIdAndUpdate(
          req.params.id,
          {
            $set: { sortOption: 'ascending' },
          },
          { useFindAndModify: false }
        );
        const saveUser = await changeSort.save();
      } else if (user.sortOption === 'ascending') {
        const changeSort = await User.findByIdAndUpdate(
          req.params.id,
          {
            $set: { sortOption: 'descending' },
          },
          { useFindAndModify: false }
        );
        const saveUser = await changeSort.save();
      }
      res.redirect(`/account/${user.username}?k=${user._id}`);
    }
  } catch (err) {
    console.error(err);
    res.redirect('/login');
  }
});

module.exports = router;
