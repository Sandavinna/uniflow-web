const User = require('../models/User');
const logger = require('../utils/logger');

// Track failed login attempts (in-memory, could be moved to Redis for production)
const failedAttempts = new Map();

// Clean up old entries every hour
setInterval(() => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [key, value] of failedAttempts.entries()) {
    if (value.timestamp < oneHourAgo) {
      failedAttempts.delete(key);
    }
  }
}, 60 * 60 * 1000);

// Check if account is locked
const checkAccountLockout = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next();
    }

    const key = email.toLowerCase();
    const attempts = failedAttempts.get(key);

    if (attempts && attempts.count >= 5) {
      const lockoutDuration = 30 * 60 * 1000; // 30 minutes
      const timeSinceFirstAttempt = Date.now() - attempts.timestamp;

      if (timeSinceFirstAttempt < lockoutDuration) {
        const remainingTime = Math.ceil((lockoutDuration - timeSinceFirstAttempt) / 1000 / 60);
        logger.warn(`Account lockout attempt for ${email}`);
        return res.status(423).json({
          message: `Account temporarily locked due to multiple failed login attempts. Please try again in ${remainingTime} minute(s).`,
        });
      } else {
        // Lockout period expired, reset attempts
        failedAttempts.delete(key);
      }
    }

    next();
  } catch (error) {
    logger.error('Account lockout check error:', error);
    next();
  }
};

// Record failed login attempt
const recordFailedAttempt = (email) => {
  const key = email.toLowerCase();
  const attempts = failedAttempts.get(key);

  if (attempts) {
    attempts.count += 1;
    // Reset timestamp if it's been more than 15 minutes since first attempt
    if (Date.now() - attempts.timestamp > 15 * 60 * 1000) {
      attempts.timestamp = Date.now();
      attempts.count = 1;
    }
  } else {
    failedAttempts.set(key, {
      count: 1,
      timestamp: Date.now(),
    });
  }
};

// Clear failed attempts on successful login
const clearFailedAttempts = (email) => {
  const key = email.toLowerCase();
  failedAttempts.delete(key);
};

module.exports = {
  checkAccountLockout,
  recordFailedAttempt,
  clearFailedAttempts,
};


