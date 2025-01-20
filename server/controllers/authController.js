// server/controllers/authController.js

/**
 * Controller for authenticating users (registration and login).
 * Uses bcrypt for password hashing.
 */

const bcrypt = require("bcrypt");
const db = require("../database/db");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const User = require("../database/models/User");

// Define a rate limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 500, // Limit each IP to 5 login attempts per window
  message: "Too many login attempts. Please try again after 10 minutes.",
  standardHeaders: true, // Send rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
});

// Lock account for repeated failed attempts
const lockAccount = async (email) => {
  const lockDuration = 10 * 60 * 1000; // 10 minutes
  const user = await User.findOne({ where: { email } });

  if (user) {
    const failedAttempts = user.failedAttempts + 1;
    const lockUntil =
      failedAttempts >= 5 ? new Date(Date.now() + lockDuration) : null;

    await user.update({ failedAttempts, lockUntil });
  }
};

// Check if account is locked
const isAccountLocked = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) return false;

  const locked = user.lockUntil !== null && user.lockUntil > new Date();
  return locked;
};

// Reset failed attempts
const resetFailedAttempts = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (user) {
    await user.update({ failedAttempts: 0, lockUntil: null });
  }
};

// Controller methods
const authController = {
  // Login an existing user
  login: async (req, res) => {
    const { email, password } = req.body;

    if (!isAccountLocked(email)) {
      return res
        .status(403)
        .json({ message: "Account locked. Please try again later." });
    }
    try {
      const user = await User.findOne({ where: { email } }); // Fetch user from DB
      const match = await bcrypt.compare(password, user.password);
      if (!user || !match) {
        await lockAccount(email); // Increment failed attempts and lock if necessary
        return res.status(401).json({ message: "Invalid email or password" });
      }

      await resetFailedAttempts(email);

      // Generate a JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, firstName: user.firstName },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          email: user.email,
        },
      });
    } catch (err) {
      res.status(500).json({ message: "Error logging in", error: err.message });
    }
  },

  // Register a new user
  register: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { firstName, lastName, email, password } = req.body;
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "Missing required fields." });
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ message: "Email is already in use." }); // 409 Conflict for existing user
      }

      // Hash the password with bcrypt (cost factor 14)
      const hashedPassword = await bcrypt.hash(password, 14);

      // Save the user to the database
      const newUser = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });

      res.status(201).json({
        message: "User registered successfully.",
        userId: newUser.id,
      });
    } catch (err) {
      console.error("Registration DB Error: ", err); // <-- Important Troubleshooting
      res
        .status(500)
        .json({ message: "Error registering user", error: err.message });
    }
  },

  // Protected route example
  protected: (req, res) => {
    res
      .status(200)
      .json({ message: "You accessed a protected route", user: req.user });
  },
};

const getUserDetails = async (req, res) => {
  try {
    // Extract user info from `req.user` (set by authenticateToken middleware)
    const user = req.user;

    if (!user) {
      return res
        .status(401)
        .json({ message: "Unauthorized. No user information found." });
    }

    res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      email: user.email,
    });
  } catch (err) {
    console.error("Error fetching user details:", err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  authController,
  loginLimiter,
  getUserDetails,
};
