// server/routes/middleware/itemValidation.js

/**
 * Provides middleware for validating item input.
 */

const { body, validationResult } = require("express-validator");

// Validation rules for creating/editing an item
// Reusable sanitization for text inputs
const sanitizeTextInput = (fieldName) =>
  body(fieldName)
    .trim()
    .customSanitizer((value) => {
      // Allow apostrophes and escape other special characters
      return value.replace(/[^a-zA-Z0-9\s'`~,.:;\?\-=+&%!$#]/g, "");
    });

const itemValidation = [
  sanitizeTextInput("itemName")
    .isLength({ min: 1 })
    .withMessage("Item name cannot be empty"),
  sanitizeTextInput("description")
    .isLength({ max: 255 })
    .withMessage("Description cannot exceed 255 characters"),
  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a non-negative integer"),
];

const handleItemValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { itemValidation, handleItemValidationErrors };
