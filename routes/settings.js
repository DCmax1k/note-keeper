const express = require('express');
const router = express.Router();

const User = require('../models/User');

// Go to settings link
router.get('/:username', async (req, res) => {
  try {
    const currentUser = await User.findById(req.query.k);
    if (
      currentUser.username === req.params.username &&
      currentUser.online == true
    ) {
      if (req.query.cp === 'succ') {
        res.render('settings', { user: currentUser, cp: 'succ' });
      } else if (req.query.cp === 'err') {
        res.render('settings', { user: currentUser, cp: 'err' });
      } else {
        res.render('settings', { user: currentUser, cp: null });
      }
    } else {
      res.redirect('/login');
    }
  } catch (err) {
    console.error(err);
    res.redirect('/login');
  }
});

// Change password
router.post('/:id/changepassword', async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.id);
    if (currentUser.password != req.body.currentPassword) {
      res.redirect(
        `/settings/${currentUser.username}?k=${currentUser._id}&cp=err`
      );
    } else if (currentUser.online == true) {
      const updatePassword = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: { password: req.body.newPassword },
        },
        { useFindAndModify: false }
      );
      const savePassword = await updatePassword.save();
      if (!res.headersSent) {
        res.redirect(
          `/settings/${currentUser.username}?k=${currentUser._id}&cp=succ`
        );
      }
    }
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.redirect('/login');
    }
  }
});

// Delete account
router.post('/:id/deleteaccount', async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.id);
    if (currentUser.online == true) {
      const deleteUser = await User.deleteOne({
        username: currentUser.username,
      });
      res.redirect('/login');
    }
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.redirect('/login');
    }
  }
});

// Admin Accessibility
router.get('/admin/:username', async (req, res) => {
  try {
    const currentUser = await User.findById(req.query.k);
    const allUsers = await User.find();
    if (
      currentUser.username === req.params.username &&
      currentUser.online == true
    ) {
      res.render('adminpage', { user: currentUser, allusers: allUsers });
    } else {
      res.redirect('/login');
    }
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.redirect('/login');
    }
  }
});

// Admin delete
router.post('/:adminid/:username/admindelete', async (req, res) => {
  try {
    const admin = await User.findById(req.params.adminid);
    const currentUser = await User.findById(req.query.k);
    if (
      admin.rank === 'admin' ||
      (admin.rank === 'owner' && currentUser.username === req.params.username)
    ) {
      const deleteUser = await User.deleteOne({
        username: currentUser.username,
      });
      res.redirect(`/settings/admin/${admin.username}?k=${admin._id}`);
    } else {
      if (!req.headersSent) {
        res.redirect('/login');
      }
    }
  } catch (err) {
    console.error(err);
  }
});

// Admin grant admin
router.post('/:admin/:username', async (req, res) => {
  try {
    const admin = await User.findById(req.params.admin);
    const currentUser = await User.findById(req.query.k);
    if (
      admin.rank === 'admin' ||
      (admin.rank === 'owner' && currentUser.username === req.params.username)
    ) {
      const grantRank = await User.findByIdAndUpdate(
        currentUser._id,
        {
          $set: { rank: 'admin' },
        },
        { useFindAndModify: false }
      );
      const saveRank = await grantRank.save();
      res.redirect(`/settings/admin/${admin.username}?k=${admin._id}`);
    } else {
      res.redirect('login');
    }
  } catch (err) {
    console.error(err);
    res.redirect(`/settings/admin/${admin.username}?k=${admin._id}`);
  }
});

module.exports = router;
