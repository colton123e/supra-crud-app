// server/routes/middleware/authMiddleware.js

/**
 * Provides middleware for authenticating web tokens.
 */

const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access token is missing or invalid." });
  }

  try {
    // Decode and verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user information to the request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      firstName: decoded.firstName,
    };
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

module.exports = authenticateToken;
