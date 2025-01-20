/**
 * Controller for item CRUD operations.
 * Provides functionality for creating, reading, updating, and deleting items using Sequelize.
 */

// const { validationResult } = require("express-validator");
const { Op } = require("sequelize");
const Item = require("../database/models/Item");
const User = require("../database/models/User"); // Include User model for associations

// Create a new item
exports.createItem = async (req, res) => {
  try {
    const { itemName, description, quantity } = req.body;

    const userId = req.user.id;

    const newItem = await Item.create({
      itemName,
      description,
      quantity: quantity || 1, // Default quantity to 1 if not provided
      userId,
    });

    res.status(201).json({
      message: "Item created successfully.",
      item: newItem,
    });
  } catch (err) {
    console.error("Item Creation DB Error: ", err);
    res
      .status(500)
      .json({ message: "Error creating item", error: err.message });
  }
};
// exports.createItem = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       console.log("Validation Errors:", errors.array());
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { itemName, description, quantity } = req.body;

//     if (!itemName) {
//       return res.status(400).json({ error: "Item name is required." });
//     }

//     // Extract userId from req.user (populated by JWT middleware)
//     const userId = req.user.id;

//     const newItem = await Item.create({
//       itemName,
//       description,
//       quantity: quantity || 1, // Default quantity to 1 if not provided
//       userId: userId, // Set the user ID from the middleware
//     });

//     res.status(201).json({
//       message: "Item created successfully.",
//       item: newItem,
//     });
//   } catch (err) {
//     console.error("Item Creation DB Error: ", err);
//     res
//       .status(500)
//       .json({ message: "Error creating item", error: err.message });
//   }
// };

// Get all items (both authenticated and unauthenticated view)
exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.findAll({
      attributes: ["id", "itemName", "description", "quantity", "UserId"],
    });

    res.status(200).json(items);
  } catch (err) {
    console.error("Get All Items Error: ", err);
    res.status(500).json({
      error: "Database error while retrieving items.",
      message: err.message,
    });
  }
};

// Get item by userID (Authenticated)
exports.getMyItems = async (req, res) => {
  try {
    const items = await Item.findAll({ where: { UserId: req.user.id } });
    res.status(200).json(items);
  } catch (err) {
    console.error("Error fetching user items:", err);
    res.status(500).json({ message: "Error fetching your items." });
  }
};

// Get item by ID
exports.getItemById = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await Item.findByPk(id, {
      attributes: ["id", "itemName", "description", "quantity", "UserId"],
    });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json(item);
  } catch (err) {
    console.error("Get Item By ID Error: ", err);
    res.status(500).json({
      error: "Database error while retrieving item.",
      message: err.message,
    });
  }
};

// Update item by ID
exports.updateItem = async (req, res) => {
  const { id } = req.params;
  const { itemName, description, quantity } = req.body;

  try {
    const item = await Item.findByPk(id);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    if (item.userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this item." });
    }

    await item.update({
      itemName,
      description,
      quantity,
    });

    res.status(200).json({ message: "Item updated successfully", item });
  } catch (err) {
    console.error("Update Item Error: ", err);
    res.status(500).json({
      error: "Database error while updating item.",
      message: err.message,
    });
  }
};
// exports.updateItem = async (req, res) => {
//   const { id } = req.params;
//   const { itemName, description, quantity } = req.body;

//   try {
//     const item = await Item.findByPk(id);

//     if (!item) {
//       return res.status(404).json({ error: "Item not found" });
//     }

//     if (item.userId !== req.user.id) {
//       return res
//         .status(403)
//         .json({ message: "Not authorized to update this item." });
//     }

//     await item.update({
//       itemName: itemName || item.itemName,
//       description: description || item.description,
//       quantity: quantity !== undefined ? quantity : item.quantity,
//     });

//     res.status(200).json({ message: "Item updated successfully", item });
//   } catch (err) {
//     console.error("Update Item Error: ", err);
//     res.status(500).json({
//       error: "Database error while updating item.",
//       message: err.message,
//     });
//   }
// };

// Delete item by ID
exports.deleteItem = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await Item.findByPk(id);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    if (item.userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this item." });
    }

    await item.destroy();

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("Delete Item Error: ", err);
    res.status(500).json({
      error: "Database error while deleting item.",
      message: err.message,
    });
  }
};
