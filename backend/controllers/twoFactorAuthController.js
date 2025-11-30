const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const TwoFactorAuth = require('../models/TwoFactorAuth');
const logger = require('../utils/logger');

// @desc    Setup 2FA
// @route   POST /api/auth/2fa/setup
// @access  Private
exports.setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `UniFlow (${user.email})`,
      issuer: 'UniFlow',
    });

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    // Save or update 2FA record
    await TwoFactorAuth.findOneAndUpdate(
      { user: user._id },
      {
        user: user._id,
        secret: secret.base32,
        backupCodes: backupCodes.map(code => require('crypto').createHash('sha256').update(code).digest('hex')),
        isEnabled: false, // Not enabled until verified
      },
      { upsert: true, new: true }
    );

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    logger.info(`2FA setup initiated for user ${user._id}`);

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes, // Show only once during setup
      manualEntryKey: secret.base32,
    });
  } catch (error) {
    logger.error('Error setting up 2FA:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify and enable 2FA
// @route   POST /api/auth/2fa/verify
// @access  Private
exports.verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const twoFA = await TwoFactorAuth.findOne({ user: req.user.id });

    if (!twoFA) {
      return res.status(404).json({ message: '2FA not set up. Please set up 2FA first.' });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: twoFA.secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps (60 seconds) tolerance
    });

    if (!verified) {
      // Check backup codes
      const hashedToken = require('crypto').createHash('sha256').update(token).digest('hex');
      const backupCodeIndex = twoFA.backupCodes.indexOf(hashedToken);

      if (backupCodeIndex === -1) {
        return res.status(400).json({ message: 'Invalid verification code' });
      }

      // Remove used backup code
      twoFA.backupCodes.splice(backupCodeIndex, 1);
    }

    // Enable 2FA
    twoFA.isEnabled = true;
    await twoFA.save();

    logger.info(`2FA enabled for user ${req.user.id}`);

    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    logger.error('Error verifying 2FA:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Disable 2FA
// @route   POST /api/auth/2fa/disable
// @access  Private
exports.disable2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const twoFA = await TwoFactorAuth.findOne({ user: req.user.id });

    if (!twoFA || !twoFA.isEnabled) {
      return res.status(400).json({ message: '2FA is not enabled' });
    }

    // Verify token before disabling
    const verified = speakeasy.totp.verify({
      secret: twoFA.secret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    twoFA.isEnabled = false;
    await twoFA.save();

    logger.info(`2FA disabled for user ${req.user.id}`);

    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    logger.error('Error disabling 2FA:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify 2FA token during login
// @route   POST /api/auth/2fa/verify-login
// @access  Public
exports.verifyLogin2FA = async (req, res) => {
  try {
    const { userId, token } = req.body;
    const twoFA = await TwoFactorAuth.findOne({ user: userId, isEnabled: true });

    if (!twoFA) {
      return res.status(400).json({ message: '2FA not enabled for this user' });
    }

    const verified = speakeasy.totp.verify({
      secret: twoFA.secret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    twoFA.lastUsed = new Date();
    await twoFA.save();

    res.json({ verified: true });
  } catch (error) {
    logger.error('Error verifying login 2FA:', error);
    res.status(500).json({ message: error.message });
  }
};


