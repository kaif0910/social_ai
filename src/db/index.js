const { Pool } = require("pg");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";
const connectionString = process.env.DATABASE_URL;

let pool;

if (connectionString) {
  const isRemote =
    connectionString.includes("supabase") ||
    connectionString.includes("render") ||
    connectionString.includes("neon") ||
    connectionString.includes("aws") ||
    isProduction;

  pool = new Pool({
    connectionString,
    ssl: isRemote ? { rejectUnauthorized: false } : false,
  });
} else {
  pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "postgres",
    password: process.env.PASSWORD || process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "social_ai",
    port: process.env.DB_PORT || 5432,
  });
}

module.exports = pool;
