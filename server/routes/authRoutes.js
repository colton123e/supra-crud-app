// server/routes/authRoutes.js

/**
 * Sets up endpoints for user registration and login.
 */

const express = require("express");
const {
  authController,
  loginLimiter,
  getUserDetails,
} = require("../controllers/authController");
const {
  registerValidation,
  loginValidation,
  handleValidationErrors,
} = require("./middleware/authValidation");

const authenticateToken = require("./middleware/authMiddleware");

const router = express.Router();

// Registration Route
router.post(
  "/register",
  registerValidation,
  handleValidationErrors,
  authController.register
);

// Login Route (with rate limiting)
router.post("/login", loginValidation, loginLimiter, authController.login);

// Item protected route
router.post("/api/items", authenticateToken, async (req, res) => {
  try {
    const { itemName, description, quantity } = req.body;

    // Use `req.user.id` for the authenticated user's ID
    const newItem = await Item.create({
      itemName,
      description,
      quantity: quantity || 0,
      UserId: req.user.id, // Associate item with the logged-in user
    });

    res
      .status(201)
      .json({ message: "Item created successfully", item: newItem });
  } catch (err) {
    console.error("Error creating item:", err);
    res.status(500).json({ message: "Error creating item" });
  }
});

// Get User details
router.get("/me", authenticateToken, getUserDetails);

module.exports = router;
