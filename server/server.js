// server/server.js

/**
 * Starts the server, connects to the database,
 * and sets up all routes.
 */

const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const os = require("os");
const sequelize = require("./database/sequelize");
require("./database/models/User");
require("./database/models/Item");
require("dotenv").config(); // Load .env values first

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, "../client/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

// Configuration
const PORT = process.env.PORT || 5000;
const HOSTNAME = process.env.HOSTNAME || os.hostname();
let API_BASE_URL = process.env.API_BASE_URL || `http://${HOSTNAME}:${PORT}`;

// Paths
const envFilePath = path.resolve(__dirname, ".env");
const configPath = path.join(__dirname, "../client/public/config.json");
const configPathDist = path.join(__dirname, "../client/dist/config.json");

// Update or create .env file
function updateEnvFile() {
  const requiredEnvVars = {
    JWT_SECRET:
      process.env.JWT_SECRET || crypto.randomBytes(100).toString("hex"),
    API_BASE_URL: `http://${HOSTNAME}:${PORT}`,
  };

  let existingVars = {};
  if (fs.existsSync(envFilePath)) {
    const content = fs.readFileSync(envFilePath, "utf-8");
    existingVars = content
      .split("\n")
      .filter((line) => line.trim() && !line.startsWith("#"))
      .reduce((acc, line) => {
        const [key, value] = line.split("=");
        acc[key.trim()] = value ? value.trim() : "";
        return acc;
      }, {});
  }

  // Add missing variables
  const updatedVars = { ...requiredEnvVars, ...existingVars };

  // Write .env file
  const envContent = Object.entries(updatedVars)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  fs.writeFileSync(envFilePath, envContent.trim(), "utf-8");
  console.log(".env file updated.");
  process.env = { ...process.env, ...updatedVars }; // Ensure runtime variables are updated
}

// Generate config.json for the front end
function generateConfig() {
  const config = { apiBaseUrl: API_BASE_URL };
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
  fs.writeFileSync(configPathDist, JSON.stringify(config, null, 2), "utf-8");
  console.log(`Generated config.json with API base URL: ${API_BASE_URL}`);
}

// Ensure .env and generate config.json
updateEnvFile();
API_BASE_URL = process.env.API_BASE_URL; // Ensure API_BASE_URL is updated
generateConfig();

// Synchronize database and start the server
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to the SQLite database.");
    await sequelize.sync({ alter: false });
    console.log("Database synchronized.");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running at ${API_BASE_URL}`);
    });
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
})();
