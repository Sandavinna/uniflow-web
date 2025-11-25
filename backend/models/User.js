const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Password validation function
const validatePassword = function(password) {
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
    throw new Error(`Password must contain: ${errors.join(', ')}`);
  }
  return true;
};

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 8,
    validate: {
      validator: validatePassword,
      message: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character'
    },
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'student', 'lecturer', 'medical_staff', 'canteen_staff', 'hostel_admin'],
    default: 'student',
  },
  studentId: {
    type: String,
    sparse: true,
    unique: true,
  },
  department: {
    type: String,
  },
  academicYear: {
    type: String,
    enum: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
  },
  dateOfBirth: {
    type: Date,
  },
  profileImage: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

