// server/routes/middleware/authValidation.js
/**
 * Provides middleware for validating authentication/registration input.
 */
const { body, validationResult } = require("express-validator");

// Middleware for sanitization and validation
// Reusable sanitization for text inputs
const sanitizeTextInput = (fieldName) =>
  body(fieldName)
    .trim()
    .customSanitizer((value) => {
      // Allow apostrophes and escape other special characters
      return value.replace(/[^a-zA-Z0-9\s'`~,.;\?\-=+&%!$#]/g, "");
    });

const registerValidation = [
  body("email").isEmail().withMessage("Invalid email address").normalizeEmail(),
  body("password")
    .isLength({ min: 12, max: 128 })
    .withMessage("Password must be between 12 and 128 characters long")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[@$!%*?&#]/)
    .withMessage("Password must contain at least one special character"),
  sanitizeTextInput("firstName")
    .isLength({ min: 1 })
    .withMessage("First name cannot be empty"),
  sanitizeTextInput("lastName")
    .isLength({ min: 1 })
    .withMessage("Last name cannot be empty"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Invalid email address").normalizeEmail(),
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map((error) => ({
        field: error.param,
        message: error.msg,
      })),
    });
  }
  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  handleValidationErrors,
};
