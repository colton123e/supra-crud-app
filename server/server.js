// server/server.js

/**
 * Starts the server, connects to the database,
 * and sets up all routes.
 */

const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const fs = require("fs");
const crypto = require("crypto");
// Initialize sequelize instances for users and items
const sequelize = require("./database/sequelize"); // Sequelize instance
require("./database/models/User"); // Ensure models are defined
require("./database/models/Item"); // Ensure models are defined
require("dotenv").config();

app.use(cors()); // Allows cross-origin requests (React dev server)
app.use(bodyParser.json()); // Allows parsing JSON bodies
app.use(express.json());

// Routes for auth and items
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../client/dist")));

// Handle client-side routing, return index.html for unknown routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

// Path to the .env file
const envFilePath = path.resolve(__dirname, ".env");

// Check if JWT_SECRET exists
if (!process.env.JWT_SECRET) {
  console.warn("JWT_SECRET is not defined. Generating and writing to .env...");

  // Generate a secure random key
  const newSecret = crypto.randomBytes(100).toString("hex");

  // Write the new secret to .env
  const envContent = `JWT_SECRET=${newSecret}\n`;
  try {
    if (fs.existsSync(envFilePath)) {
      // Append to existing .env file
      fs.appendFileSync(envFilePath, envContent);
      console.log("JWT_SECRET added to existing .env file.");
    } else {
      // Create a new .env file
      fs.writeFileSync(envFilePath, envContent);
      console.log(".env file created, and JWT_SECRET added.");
    }

    // Update the process environment so it takes effect immediately
    process.env.JWT_SECRET = newSecret;
  } catch (err) {
    console.error("Error writing to .env file:", err);
    process.exit(1); // Exit if writing to .env fails
  }
}

// Sync all defined models to the DB
(async () => {
  try {
    //Ensure the database can be connected
    await sequelize
      .authenticate()
      .then(() => console.log("Connected to the SQLite database."))
      .catch((err) => {
        console.error("Unable to connect to the database:", err.message);
        process.exit(1);
      });

    // Synchronize the database
    await sequelize
      .sync({ alter: false })
      .then(() => console.log("Database synchronized."))
      .catch((err) => {
        console.error("Database synchronization failed:", err.message);
        process.exit(1);
      });

    // Then start the server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Unable to connect to the database:", err);
  }
})();
