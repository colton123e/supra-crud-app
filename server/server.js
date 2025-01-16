// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();

const PORT = process.env.PORT || 5000;
// Dynamically resolve the database path or set by Docker environment variable
const DATABASE_PATH =
  process.env.DATABASE_PATH || path.resolve(__dirname, "../database/db.sqlite");
const db = new sqlite3.Database(DATABASE_PATH);

app.use(cors());
app.use(bodyParser.json());

// Example Route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Start the server

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
