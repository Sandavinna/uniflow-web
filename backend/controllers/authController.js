const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const logger = require('../utils/logger');
const { recordFailedAttempt, clearFailedAttempts } = require('../middleware/accountLockout');
const { body, validationResult } = require('express-validator');

// Password validation function
const validatePassword = (password) => {
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!minLength || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    const errors = [];
    if (!minLength) errors.push('at least 8 characters');
    if (!hasUpperCase) errors.push('one uppercase letter');
    if (!hasLowerCase) errors.push('one lowercase letter');
    if (!hasNumber) errors.push('one number');
    if (!hasSpecialChar) errors.push('one special character');
    return {
      isValid: false,
      message: `Password must contain: ${errors.join(', ')}`
    };
  }
  return { isValid: true };
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, studentId, department, academicYear, phone, lecturerCourses } = req.body;

    // Prevent admin registration through public registration
    if (role === 'admin') {
      logger.warn(`Admin registration attempt blocked from IP: ${req.ip}`);
      return res.status(403).json({ message: 'Admin accounts cannot be created through registration. Please contact system administrator.' });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if studentId exists (for students)
    if (role === 'student' && studentId) {
      const studentIdExists = await User.findOne({ studentId });
      if (studentIdExists) {
        return res.status(400).json({ message: 'Student ID already exists' });
      }
    }

    // Validate lecturer courses
    if (role === 'lecturer') {
      if (!lecturerCourses || lecturerCourses.length === 0) {
        return res.status(400).json({ message: 'Lecturers must add at least one course' });
      }
      for (const yearData of lecturerCourses) {
        if (!yearData.year || !yearData.courses || yearData.courses.length === 0) {
          return res.status(400).json({ message: 'Each year must have at least one course' });
        }
        for (const course of yearData.courses) {
          if (!course.courseCode || !course.courseName) {
            return res.status(400).json({ message: 'All courses must have both course code and course name' });
          }
        }
      }
    }

    // Determine registration status
    // Staff roles need approval, students and admins are auto-approved
    const needsApproval = ['lecturer', 'medical_staff', 'canteen_staff', 'hostel_admin'].includes(role);
    const registrationStatus = needsApproval ? 'pending' : 'approved';

    logger.info(`Registration attempt - Role: ${role}, Needs Approval: ${needsApproval}, Status: ${registrationStatus}`);

    // Create user
    const userData = {
      name,
      email,
      password,
      role,
      studentId: role === 'student' ? studentId : undefined,
      department: (role === 'student' || role === 'lecturer') ? department : undefined,
      academicYear: role === 'student' ? academicYear : undefined,
      phone,
      lecturerCourses: role === 'lecturer' ? lecturerCourses : undefined,
      registrationStatus, // Explicitly set registration status
    };

    const user = await User.create(userData);

    // Define staff roles that need approval
    const staffRoles = ['lecturer', 'medical_staff', 'canteen_staff', 'hostel_admin'];
    
    // Check the role - use the role from request body first, then fall back to user.role
    const actualRole = role || user.role;
    const isStaffRole = staffRoles.includes(actualRole);

    logger.debug(`Registration - Role from request: "${role}", User role: "${user.role}", Actual role: "${actualRole}", Is staff: ${isStaffRole}`);

    // For staff roles, ALWAYS set to pending and NEVER return a token
    if (isStaffRole) {
      // Force update to pending - do this immediately after creation
      const updatedUser = await User.findByIdAndUpdate(
        user._id, 
        { registrationStatus: 'pending' }, 
        { new: true }
      );
      logger.info(`Staff role registration - User: ${updatedUser._id}, Role: ${actualRole}, Status: ${updatedUser.registrationStatus}`);
      
      // Return response WITHOUT token - CRITICAL: Do not include token field at all
      const responseData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        registrationStatus: 'pending',
        message: 'Registration successful! Your account is pending admin approval. You will be notified once approved.',
      };
      
      logger.debug(`Registration response (pending): User ${updatedUser._id}`);
      return res.status(201).json(responseData);
    }

    // For non-staff roles (students, admins), return token immediately
    logger.info(`Non-staff registration - User: ${user._id}, Role: ${actualRole}, Auto-approved`);
    const token = generateToken(user._id);
    const responseData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      academicYear: user.academicYear,
      token: token,
    };
    logger.debug(`Registration response (approved): User ${user._id}`);
    return res.status(201).json(responseData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Normalize email to lowercase for consistency
    const normalizedEmail = email.toLowerCase().trim();

    // Check for user email
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      // Record failed attempt even if user doesn't exist (but don't reveal this)
      recordFailedAttempt(normalizedEmail);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Your account has been deactivated. Please contact administrator.' });
    }

    // Check registration status - ensure it exists (for backward compatibility with existing users)
    const registrationStatus = user.registrationStatus || 'approved';
    logger.info(`Login attempt for user ${user._id} (${user.email}) - Role: ${user.role}, Status: ${registrationStatus}`);

    // Check registration status for staff roles
    if (registrationStatus === 'pending') {
      logger.warn(`Login blocked: User ${user._id} has pending registration`);
      recordFailedAttempt(normalizedEmail);
      return res.status(403).json({ 
        message: 'Your registration is pending admin approval. Please wait for approval before logging in.' 
      });
    }

    if (registrationStatus === 'rejected') {
      logger.warn(`Login blocked: User ${user._id} has rejected registration`);
      recordFailedAttempt(normalizedEmail);
      return res.status(403).json({ 
        message: 'Your registration has been rejected. Please contact administrator for more information.' 
      });
    }

    // Verify password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      logger.warn(`Failed login attempt for ${normalizedEmail}`);
      recordFailedAttempt(normalizedEmail);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Clear failed attempts on successful login
    clearFailedAttempts(normalizedEmail);
    logger.info(`Successful login for user ${user._id} (${user.email})`);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      department: user.department,
      academicYear: user.academicYear,
      profileImage: user.profileImage,
      emailVerified: user.emailVerified || false,
      token: generateToken(user._id),
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot password - Send reset token to email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide an email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        message: 'If that email exists, a password reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save token to database
    await PasswordResetToken.create({
      user: user._id,
      token: hashedToken,
      expiresAt: Date.now() + 3600000, // 1 hour
    });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    // Email message
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0284c7;">Password Reset Request</h2>
        <p>Hello ${user.name},</p>
        <p>You requested to reset your password for your UniFlow account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #0284c7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">This is an automated message, please do not reply.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request - UniFlow',
        message: message,
        resetUrl: resetUrl,
      });

      res.json({
        message: 'If that email exists, a password reset link has been sent.',
      });
    } catch (error) {
      // Delete token if email fails
      await PasswordResetToken.findOneAndDelete({ user: user._id, token: hashedToken });
      logger.error('Error sending email:', error);
      res.status(500).json({
        message: 'Email could not be sent. Please try again later.',
      });
    }
  } catch (error) {
    logger.error('Error in forgotPassword:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        message: passwordValidation.message,
      });
    }

    // Hash the token to compare with stored token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find valid token
    const resetToken = await PasswordResetToken.findOne({
      token: hashedToken,
      expiresAt: { $gt: Date.now() },
    }).populate('user');

    if (!resetToken) {
      return res.status(400).json({
        message: 'Invalid or expired reset token',
      });
    }

    // Update user password
    const user = resetToken.user;
    user.password = password;
    await user.save();

    // Delete all reset tokens for this user
    await PasswordResetToken.deleteMany({ user: user._id });

    res.json({
      message: 'Password reset successful. You can now login with your new password.',
    });
  } catch (error) {
    logger.error('Error in resetPassword:', error);
    res.status(500).json({ message: error.message });
  }
};

