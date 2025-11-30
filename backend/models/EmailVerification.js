const mongoose = require('mongoose');
const crypto = require('crypto');

const emailVerificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    index: { expires: 0 }, // Auto-delete expired tokens
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate verification token
emailVerificationSchema.statics.generateToken = function() {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = mongoose.model('EmailVerification', emailVerificationSchema);


