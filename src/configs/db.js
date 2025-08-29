const express = require("express");
const { Pool } = require("pg");

const app = express();

// PostgreSQL connection config (Private IP)
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: process.env.DB_SSLMODE !== "false" ? { rejectUnauthorized: false } : false,
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});