// server/database/sequelize.js

/**
 * This file initializes and exports a Sequelize instance
 * configured to use a local SQLite database.
 */

const { Sequelize } = require("sequelize");
const path = require("path");

// Dynamically resolve the database path or set by Docker environment variable
const DATABASE_PATH =
  process.env.DATABASE_PATH || path.resolve(__dirname, "./db.sqlite");

// Create a new Sequelize instance
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: DATABASE_PATH,
  logging: false, // Disable logging SQL statements to the console (optional)
});

module.exports = sequelize;
