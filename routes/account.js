const express = require('express');
const router = express.Router();

const User = require('../models/User');

router.get('/', (req, res) => {
  res.redirect('/');
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
    res.redirect('/login?e=log');
  } catch (e) {
    console.log(e);
    res.redirect('/signup');
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
  const user = await User.findOne({ username: req.params.username });
  try {
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

router.post('/:id/addnote', async (req, res) => {
  const currentUser = await User.findById(req.params.id);
  try {
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

router.post('/:id/deletenote', async (req, res) => {
  const currentUser = await User.findById(req.params.id);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { notes: req.body.notetoremove },
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

module.exports = router;
