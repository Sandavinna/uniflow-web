const mongoose = require('mongoose');

const twoFactorAuthSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  secret: {
    type: String,
    required: true,
  },
  backupCodes: [{
    type: String,
  }],
  isEnabled: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUsed: {
    type: Date,
  },
});

module.exports = mongoose.model('TwoFactorAuth', twoFactorAuthSchema);


