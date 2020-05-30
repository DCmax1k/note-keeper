const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  emailConfirmed: {
    type: Boolean,
    default: false,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  notes: [String],
  sortOption: {
    type: String,
    required: true,
    default: 'descending',
  },
  online: {
    type: Boolean,
    default: false,
  },
  rank: {
    type: String,
    default: 'default',
  },
  pin: Number,
});

module.exports = mongoose.model('User', UserSchema);
