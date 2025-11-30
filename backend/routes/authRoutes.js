const express = require('express');
const router = express.Router();
const { register, login, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { sendVerificationEmail, verifyEmail } = require('../controllers/emailVerificationController');
const {
  setup2FA,
  verify2FA,
  disable2FA,
  verifyLogin2FA,
} = require('../controllers/twoFactorAuthController');
const { protect } = require('../middleware/auth');
const { authLimiter, registerLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');
const { checkAccountLockout } = require('../middleware/accountLockout');
const auditLog = require('../middleware/auditLog');

router.post('/register', registerLimiter, auditLog('REGISTER', 'User'), register);
router.post('/login', authLimiter, checkAccountLockout, auditLog('LOGIN', 'User'), login);
router.get('/me', protect, getMe);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password/:token', passwordResetLimiter, resetPassword);
router.post('/send-verification', protect, sendVerificationEmail);
router.get('/verify-email/:token', verifyEmail);
router.post('/2fa/setup', protect, setup2FA);
router.post('/2fa/verify', protect, verify2FA);
router.post('/2fa/disable', protect, disable2FA);
router.post('/2fa/verify-login', verifyLogin2FA);

module.exports = router;

