const { body, param, query, validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMessages = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    logger.warn('Validation errors:', { errors: errorMessages, path: req.path });
    
    return res.status(400).json({
      message: 'Validation failed',
      errors: errorMessages,
    });
  };
};

// Common validation rules
const emailValidation = body('email')
  .isEmail()
  .withMessage('Please provide a valid email address')
  .normalizeEmail()
  .trim();

const passwordValidation = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter')
  .matches(/[a-z]/)
  .withMessage('Password must contain at least one lowercase letter')
  .matches(/[0-9]/)
  .withMessage('Password must contain at least one number')
  .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
  .withMessage('Password must contain at least one special character');

const nameValidation = body('name')
  .trim()
  .isLength({ min: 2, max: 100 })
  .withMessage('Name must be between 2 and 100 characters')
  .matches(/^[a-zA-Z\s'-]+$/)
  .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes');

const phoneValidation = body('phone')
  .optional()
  .trim()
  .matches(/^[\d\s\-\+\(\)]+$/)
  .withMessage('Please provide a valid phone number');

const mongoIdValidation = param('id')
  .isMongoId()
  .withMessage('Invalid ID format');

// Sanitize input to prevent XSS
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
};

// Sanitize object recursively
const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
  }
  return sanitized;
};

// Middleware to sanitize request body
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  next();
};

module.exports = {
  validate,
  emailValidation,
  passwordValidation,
  nameValidation,
  phoneValidation,
  mongoIdValidation,
  sanitizeInput,
};


