// server/database/models/Item.js

/**
 * Defines the Item model using Sequelize.
 * Each Item belongs to a single User (one-to-many relationship).
 */

const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const User = require("./User");

const Item = sequelize.define("Item", {
  itemName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false, // Ensure UserId cannot be NULL
    references: {
      model: User, // Associate with the User model
      key: "id",
    },
  },
});

// Define the relationship (one User has many Items, one Item belongs to a User)
User.hasMany(Item, { foreignKey: "userId" });
Item.belongsTo(User, { foreignKey: "userId" });

module.exports = Item;
