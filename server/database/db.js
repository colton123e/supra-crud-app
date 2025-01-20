// server/database/db.js
/**
 * This file sets up the SQLite database connection and
 * exports a single instance of the database to be used
 * throughout the server.
 */

const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Dynamically resolve the database path or set by Docker environment variable
const DATABASE_PATH =
  process.env.DATABASE_PATH || path.resolve(__dirname, "./db.sqlite");

// Create or open the SQLite database file
const db = new sqlite3.Database(DATABASE_PATH, (err) => {
  if (err) {
    console.error("Error connecting to SQLite database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

module.exports = db;
