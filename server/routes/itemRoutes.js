// server/routes/itemRoutes.js

/**
 * Defines routes to create, read, update, and delete items.
 */

const express = require("express");
const router = express.Router();
const {
  createItem,
  getAllItems,
  getMyItems,
  getItemById,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");
const {
  itemValidation,
  handleItemValidationErrors,
} = require("./middleware/itemValidation");

// Requiring authentication for some routes
const authenticateToken = require("./middleware/authMiddleware");

// POST /api/items
router.post(
  "/",
  authenticateToken,
  itemValidation,
  handleItemValidationErrors,
  createItem
);

// GET /api/items
router.get("/", getAllItems);

// GET /api/items/mine (Fetch authenticated user's items - Authenticated)
router.get("/mine", authenticateToken, getMyItems);

// GET /api/items/:id
router.get("/:id", getItemById);

// PUT /api/items/:id (Update an item - Authenticated)
router.put(
  "/:id",
  authenticateToken,
  itemValidation,
  handleItemValidationErrors,
  updateItem
);

// DELETE /api/items/:id (Delete an item - Authenticated)
router.delete("/:id", authenticateToken, deleteItem);

module.exports = router;
