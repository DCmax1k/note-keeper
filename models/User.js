const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
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
});

module.exports = mongoose.model('User', UserSchema);
