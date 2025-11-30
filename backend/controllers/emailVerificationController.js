const User = require('../models/User');
const EmailVerification = require('../models/EmailVerification');
const sendEmail = require('../utils/sendEmail');
const logger = require('../utils/logger');
const crypto = require('crypto');

// @desc    Send email verification
// @route   POST /api/auth/send-verification
// @access  Private
exports.sendVerificationEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate verification token
    const token = EmailVerification.generateToken();
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Delete existing verification tokens
    await EmailVerification.findOneAndDelete({ user: user._id });

    // Create new verification token
    await EmailVerification.create({
      user: user._id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Verify Your Email - UniFlow',
        html: `
          <h2 style="color: #0284c7;">Email Verification</h2>
          <p>Hello ${user.name},</p>
          <p>Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0284c7; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Verify Email
          </a>
          <p>Or copy and paste this link into your browser:</p>
          <p>${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        `,
      });

      logger.info(`Verification email sent to ${user.email}`);
      res.json({ message: 'Verification email sent successfully' });
    } catch (emailError) {
      logger.error('Error sending verification email:', emailError);
      res.status(500).json({ message: 'Failed to send verification email' });
    }
  } catch (error) {
    logger.error('Error in sendVerificationEmail:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash the token to compare with stored token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const verification = await EmailVerification.findOne({
      token: hashedToken,
      expiresAt: { $gt: Date.now() },
    });

    if (!verification) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Update user email verification status
    const user = await User.findByIdAndUpdate(
      verification.user,
      {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
      { new: true }
    );

    // Delete verification token
    await EmailVerification.findByIdAndDelete(verification._id);

    logger.info(`Email verified for user ${user._id}`);

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    logger.error('Error in verifyEmail:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

